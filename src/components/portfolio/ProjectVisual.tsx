import type { Project } from "./data";

/** Quiet landscape study per project; decorative only. */
export function ProjectVisual({ kind }: { kind: Project["kind"] }) {
  const paths: Record<Project["kind"], string> = {
    sensor: "M0 150 C70 116 104 136 151 112 S245 72 304 101 S365 128 400 112 V220 H0 Z",
    app: "M0 162 C55 148 85 92 145 103 S235 159 289 126 S350 82 400 99 V220 H0 Z",
    calendar: "M0 132 C64 126 87 151 140 139 S220 91 279 112 S354 151 400 136 V220 H0 Z",
    sat: "M0 168 C80 151 112 121 169 128 S248 168 305 145 S358 114 400 120 V220 H0 Z",
    robot: "M0 143 C56 111 109 112 151 137 S235 172 284 136 S354 92 400 108 V220 H0 Z",
  };
  return (
    <svg viewBox="0 0 400 220" className="h-full w-full" fill="none" aria-hidden>
      <path d={paths[kind]} className="fill-primary/10" />
      <path d={paths[kind]} className="stroke-primary/25" strokeWidth="1" />
      <path d="M38 177 C100 165 151 181 213 168 S322 171 370 160" className="stroke-signal/20" />
      <path d="M72 192 C133 184 177 198 238 187 S319 190 351 184" className="stroke-signal/15" />
    </svg>
  );
}
