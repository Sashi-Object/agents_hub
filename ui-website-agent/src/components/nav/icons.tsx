import type { NavIcon } from "@/lib/site";

const paths: Record<NavIcon, string> = {
  home: "M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z",
  projects:
    "M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
  about:
    "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8m-7 8a7 7 0 0 1 14 0",
  contact: "M4 6h16v12H4zm0 0 8 7 8-7",
};

type IconProps = { className?: string };

function Svg({ d, className }: { d: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path d={d} />
    </svg>
  );
}

export function NavIconGlyph({ icon, className }: IconProps & { icon: NavIcon }) {
  return <Svg d={paths[icon]} className={className} />;
}

export function MenuIcon({ className }: IconProps) {
  return <Svg d="M4 7h16M4 12h16M4 17h16" className={className} />;
}

export function CloseIcon({ className }: IconProps) {
  return <Svg d="M6 6l12 12M18 6 6 18" className={className} />;
}
