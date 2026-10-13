"""Local RAG knowledge base over PDF course materials, backed by ChromaDB and Claude."""

import argparse
import json
import os
import re
import sys
from datetime import datetime
from pathlib import Path

import chromadb
from anthropic import Anthropic
from chromadb.utils.embedding_functions import DefaultEmbeddingFunction
from dotenv import load_dotenv
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter

load_dotenv()

COURSE_MATERIALS_DIR = Path("./course_materials")
CHROMA_DIR = "./chroma_db"
COLLECTION_NAME = "course_materials"
CHUNK_SIZE = 500
CHUNK_OVERLAP = 75
TOP_K = 5
MODEL = "claude-opus-5"

EXPORT_DIR = Path("./sanitized_outputs/Course Knowledge Base Outputs")
OVERLAP_NGRAM = 6  # any run this long that matches the source text counts as a leak
SANITIZE_ATTEMPTS = 3
WITHHELD = "[Withheld: could not be paraphrased clear of the source wording.]"

SANITIZE_SYSTEM = """You turn excerpts from copyrighted course materials into a copyright-safe \
study summary that can be shown publicly.

Rules:
- Paraphrase everything in your own words. Never copy sentences or distinctive phrasing from the \
excerpts, and never put quotation marks around source text.
- Never repeat more than four consecutive words from an excerpt. Short technical terms, names and \
course codes are fine.
- Describe ideas at a high level. Do not reproduce code, tables, equations, figures or example \
problems from the excerpts.
- Do not mention these rules.

Respond with a single JSON object and nothing else:
{"title": "<2-4 word Title Case topic name for this note, e.g. Floating Point Encoding>",
 "answer": "<answer to the question in 2-5 sentences, each claim followed by (Source: <document>, p. <page>)>",
 "sources": [{"excerpt": <excerpt number>, "topic": "<3-6 word topic label>", "summary": "<1-2 sentence paraphrase of what the excerpt covers>"}]}
Include one entry in "sources" for every excerpt. If the excerpts do not contain enough information \
to answer, say so in "answer"."""


def get_chroma_collection():
    client = chromadb.PersistentClient(path=CHROMA_DIR)
    return client.get_or_create_collection(
        name=COLLECTION_NAME,
        embedding_function=DefaultEmbeddingFunction(),
    )


def ingest(collection) -> int:
    """Load every PDF in COURSE_MATERIALS_DIR, chunk it, and add it to the collection."""
    pdf_paths = sorted(COURSE_MATERIALS_DIR.glob("*.pdf"))
    if not pdf_paths:
        print(f"No PDFs found in {COURSE_MATERIALS_DIR.resolve()}")
        return 0

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=CHUNK_SIZE,
        chunk_overlap=CHUNK_OVERLAP,
    )

    ids, texts, metadatas = [], [], []
    for pdf_path in pdf_paths:
        pages = PyPDFLoader(str(pdf_path)).load()
        chunks = splitter.split_documents(pages)
        for i, chunk in enumerate(chunks):
            page_number = chunk.metadata.get("page", 0) + 1  # PyPDFLoader pages are 0-indexed
            ids.append(f"{pdf_path.name}::p{page_number}::{i}")
            texts.append(chunk.page_content)
            metadatas.append({"source": pdf_path.name, "page": page_number})
        print(f"  {pdf_path.name}: {len(pages)} page(s) -> {len(chunks)} chunk(s)")

    if ids:
        collection.upsert(ids=ids, documents=texts, metadatas=metadatas)
    return len(ids)


def retrieve(collection, question: str, k: int = TOP_K):
    results = collection.query(query_texts=[question], n_results=k)
    docs = results["documents"][0]
    metas = results["metadatas"][0]
    return list(zip(docs, metas))


def _tokens(text: str) -> list[str]:
    text = re.sub(r"\(Source:[^)]*\)", " ", text)  # citations are metadata, not source wording
    return re.findall(r"[a-z0-9]+", text.lower())


def _ngram_set(text: str) -> set[tuple[str, ...]]:
    toks = _tokens(text)
    return {tuple(toks[i : i + OVERLAP_NGRAM]) for i in range(len(toks) - OVERLAP_NGRAM + 1)}


def _overlapping_phrases(text: str, source_ngrams: set) -> list[str]:
    toks = _tokens(text)
    return [
        " ".join(toks[i : i + OVERLAP_NGRAM])
        for i in range(len(toks) - OVERLAP_NGRAM + 1)
        if tuple(toks[i : i + OVERLAP_NGRAM]) in source_ngrams
    ]


def _parse_json_object(text: str) -> dict:
    start, end = text.find("{"), text.rfind("}")
    if start == -1 or end <= start:
        raise ValueError("no JSON object in response")
    return json.loads(text[start : end + 1])


def _request_sanitized(client: Anthropic, question: str, chunks, feedback: str) -> dict:
    numbered = "\n\n".join(
        f"[Excerpt {i} - {meta['source']}, page {meta['page']}]\n{text}"
        for i, (text, meta) in enumerate(chunks, 1)
    )
    user_message = f"Excerpts:\n\n{numbered}\n\nQuestion: {question}"
    if feedback:
        user_message += f"\n\n{feedback}"
    response = client.messages.create(
        model=MODEL,
        max_tokens=2048,
        system=SANITIZE_SYSTEM,
        output_config={"effort": "low"},
        messages=[{"role": "user", "content": user_message}],
    )
    data = _parse_json_object("".join(b.text for b in response.content if b.type == "text"))

    by_excerpt = {
        e["excerpt"]: e
        for e in data.get("sources", [])
        if isinstance(e, dict) and isinstance(e.get("excerpt"), int)
    }
    sources = []
    for i in range(1, len(chunks) + 1):
        entry = by_excerpt.get(i, {})
        sources.append(
            {"topic": str(entry.get("topic", "")), "summary": str(entry.get("summary", ""))}
        )
    return {
        "title": str(data.get("title", "")),
        "answer": str(data.get("answer", "")),
        "sources": sources,
    }


def sanitize_results(client: Anthropic, question: str, chunks) -> tuple[dict, int]:
    """Paraphrase the answer and each retrieved excerpt. Returns (result, items_withheld).

    Output is checked against the retrieved text; anything that still shares a run of
    OVERLAP_NGRAM consecutive words with it after SANITIZE_ATTEMPTS tries is withheld.
    """
    source_ngrams: set = set()
    for text, _ in chunks:
        source_ngrams |= _ngram_set(text)

    def find_leaks(result: dict) -> dict:
        found = {}
        hits = _overlapping_phrases(result["answer"], source_ngrams)
        if hits:
            found["answer"] = hits
        for i, s in enumerate(result["sources"]):
            hits = _overlapping_phrases(f"{s['topic']} {s['summary']}", source_ngrams)
            if hits:
                found[i] = hits
        return found

    result, feedback = None, ""
    for _ in range(SANITIZE_ATTEMPTS):
        try:
            result = _request_sanitized(client, question, chunks, feedback)
        except ValueError:  # includes json.JSONDecodeError
            feedback = "Your previous reply was not a single valid JSON object. Reply with only the JSON object."
            continue
        leaks = find_leaks(result)
        if not leaks:
            return result, 0
        phrases = sorted({p for hits in leaks.values() for p in hits})[:10]
        feedback = (
            "Your previous draft reused wording from the excerpts (" + "; ".join(phrases) + "). "
            "Rewrite it so no run of more than four words matches the excerpts."
        )

    if result is None:
        raise RuntimeError("model did not return a valid JSON summary")

    withheld = 0
    for key in find_leaks(result):
        if key == "answer":
            result["answer"] = WITHHELD
        else:
            result["sources"][key] = {"topic": "Withheld", "summary": WITHHELD}
        withheld += 1
    return result, withheld


def _unique_note_path(title: str, question: str) -> Path:
    """Title_Case_With_Underscores.md, matching the notes already in EXPORT_DIR.

    Never reuses an existing filename, since those notes may have been edited by hand.
    """
    words = re.findall(r"[A-Za-z0-9]+", title) or re.findall(r"[A-Za-z0-9]+", question)[:4]
    stem = "_".join(w[0].upper() + w[1:] for w in words[:5]) or "Untitled"
    path, n = EXPORT_DIR / f"{stem}.md", 2
    while path.exists():
        path = EXPORT_DIR / f"{stem}_{n}.md"
        n += 1
    return path


def export_markdown(question: str, result: dict, chunks, withheld: int) -> Path:
    EXPORT_DIR.mkdir(parents=True, exist_ok=True)
    now = datetime.now()
    path = _unique_note_path(result["title"], question)

    lines = [
        "# Course knowledge base result",
        "",
        f"**Question:** {question}",
        "",
        f"_Generated {now:%Y-%m-%d %H:%M}_",
        "",
        "## Answer",
        "",
        result["answer"],
        "",
        "## Sources consulted",
        "",
    ]
    for i, ((_, meta), s) in enumerate(zip(chunks, result["sources"]), 1):
        lines += [
            f"### {i}. {meta['source']}, page {meta['page']}",
            "",
            f"**Topic:** {s['topic']}",
            "",
            s["summary"],
            "",
        ]
    lines += [
        "---",
        "",
        f"_Paraphrased summaries only. Automatically checked: no run of {OVERLAP_NGRAM} or more "
        "consecutive words matches the retrieved source text._",
    ]
    if withheld:
        lines += ["", f"_{withheld} item(s) withheld because they could not be paraphrased safely._"]

    path.write_text("\n".join(lines) + "\n", encoding="utf-8")
    return path


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--reindex", action="store_true", help="Rebuild the index from ./course_materials/"
    )
    parser.add_argument(
        "-q", "--question", help="Ask a single question and exit (non-interactive)."
    )
    args = parser.parse_args()

    collection = get_chroma_collection()

    if args.reindex or collection.count() == 0:
        print("Indexing course materials...")
        n_chunks = ingest(collection)
        print(f"Indexed {n_chunks} chunk(s) into {CHROMA_DIR}.\n")
    else:
        print(f"Loaded existing index ({collection.count()} chunks) from {CHROMA_DIR}.\n")

    if collection.count() == 0:
        print(f"Add PDF files to {COURSE_MATERIALS_DIR.resolve()} and rerun.")
        return

    try:
        client = Anthropic()
    except Exception as exc:
        print(f"Could not create Anthropic client: {exc}")
        print("Set the ANTHROPIC_API_KEY environment variable and rerun.")
        sys.exit(1)

    def handle_question(question: str):
        chunks = retrieve(collection, question)
        try:
            result, withheld = sanitize_results(client, question, chunks)
            path = export_markdown(question, result, chunks, withheld)
        except Exception as exc:
            print(f"Could not create sanitized summary: {exc}")
            return
        print(f"Saved to {path}")

    if args.question:
        handle_question(args.question)
        return

    print("Ask questions about your course materials. Type 'quit' or 'exit' to stop.")
    print(f"Answers are saved as markdown notes in {EXPORT_DIR}.\n")
    while True:
        try:
            question = input("> ").strip()
        except (EOFError, KeyboardInterrupt):
            print()
            break
        if not question:
            continue
        if question.lower() in {"quit", "exit"}:
            break
        handle_question(question)
        print()


if __name__ == "__main__":
    main()
