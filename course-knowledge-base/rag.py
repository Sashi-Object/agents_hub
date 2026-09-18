"""Local RAG knowledge base over PDF course materials, backed by ChromaDB and Claude."""

import argparse
import os
import sys
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

SYSTEM_PROMPT = """You are a study assistant answering questions about the user's course materials.

Answer ONLY using the excerpts provided below. Every factual claim in your answer must be \
followed by an inline citation in the format (Source: <document>, p. <page>), using the exact \
document name and page number given with each excerpt. If the excerpts do not contain enough \
information to answer, say so plainly instead of guessing."""


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


def build_context(chunks) -> str:
    parts = []
    for text, meta in chunks:
        parts.append(f"[Excerpt from {meta['source']}, page {meta['page']}]\n{text}")
    return "\n\n".join(parts)


def ask_claude(client: Anthropic, question: str, chunks) -> str:
    context = build_context(chunks)
    user_message = (
        f"Course material excerpts:\n\n{context}\n\n"
        f"Question: {question}"
    )
    response = client.messages.create(
        model=MODEL,
        max_tokens=1024,
        system=SYSTEM_PROMPT,
        output_config={"effort": "low"},
        messages=[{"role": "user", "content": user_message}],
    )
    return "".join(block.text for block in response.content if block.type == "text")


def print_sources(chunks) -> None:
    print("\nSources:")
    seen = set()
    for _, meta in chunks:
        key = (meta["source"], meta["page"])
        if key not in seen:
            seen.add(key)
            print(f"  - {meta['source']}, page {meta['page']}")


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
            answer = ask_claude(client, question, chunks)
        except Exception as exc:
            print(f"Error calling Claude API: {exc}")
            return
        print(f"\n{answer}")
        print_sources(chunks)

    if args.question:
        handle_question(args.question)
        return

    print("Ask questions about your course materials. Type 'quit' or 'exit' to stop.\n")
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
