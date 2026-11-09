import type { Project } from "./data";

/** Abstract technical illustration per project — no photos. */
export function ProjectVisual({ kind }: { kind: Project["kind"] }) {
  const s = "stroke-primary";
  return (
    <svg viewBox="0 0 400 220" className="h-full w-full" fill="none" aria-hidden>
      {kind === "sensor" && (
        <g strokeWidth="1.5">
          <rect x="130" y="50" width="140" height="120" rx="10" className="stroke-foreground/30" />
          <rect x="170" y="85" width="60" height="50" rx="4" className={s} />
          {[0, 1, 2, 3, 4].map((i) => (
            <line key={i} x1={178 + i * 11} y1="85" x2={178 + i * 11} y2="72" className="stroke-foreground/40" />
          ))}
          {[30, 55, 80].map((r) => (
            <circle key={r} cx="200" cy="110" r={r + 60} className="stroke-signal/20" />
          ))}
        </g>
      )}
      {kind === "app" && (
        <g strokeWidth="1.5">
          <path d="M120 150 L200 110 L280 150 L200 190 Z" className="stroke-foreground/30" />
          <path d="M120 150 L120 70 L200 30 L200 110" className="stroke-foreground/20" />
          <path d="M200 110 L280 150 L280 70 L200 30" className="stroke-foreground/20" />
          <path d="M175 140 L210 122 L240 137 L205 155 Z" className={`${s} fill-primary/10`} />
          <circle cx="300" cy="50" r="5" className="fill-signal" />
        </g>
      )}
      {kind === "calendar" && (
        <g strokeWidth="1.5">
          {Array.from({ length: 21 }).map((_, i) => (
            <rect key={i} x={110 + (i % 7) * 27} y={55 + Math.floor(i / 7) * 36} width="21" height="28" rx="4"
              className={i === 10 ? `${s} fill-primary/20` : i === 16 ? "stroke-signal" : "stroke-foreground/20"} />
          ))}
        </g>
      )}
      {kind === "sat" && (
        <g strokeWidth="1.5">
          <ellipse cx="200" cy="110" rx="170" ry="50" className="stroke-foreground/15" />
          <rect x="175" y="85" width="50" height="50" rx="4" className={s} />
          <rect x="95" y="97" width="70" height="26" className="stroke-signal/60" />
          <rect x="235" y="97" width="70" height="26" className="stroke-signal/60" />
          <circle cx="200" cy="110" r="8" className="stroke-foreground/50" />
        </g>
      )}
      {kind === "robot" && (
        <g strokeWidth="1.5">
          <path d="M60 170 C 120 170, 140 60, 200 60 S 280 150, 340 150" className="stroke-foreground/20" />
          <path d="M60 170 C 120 170, 150 75, 200 70 S 290 145, 340 148" className={s} />
          {[60, 140, 200, 270, 340].map((x) => (
            <line key={x} x1={x} y1="40" x2={x} y2="190" className="stroke-foreground/10" />
          ))}
        </g>
      )}
    </svg>
  );
}
