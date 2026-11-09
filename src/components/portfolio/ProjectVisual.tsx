import type { Project } from "./data";

/** Symbolic subject studies, not screenshots or hardware specifications. */
export function ProjectVisual({ kind }: { kind: Project["kind"] }) {
  const labels: Record<Project["kind"], [string, string]> = {
    sensor: ["O₂ / NYC", "Environmental monitoring"],
    app: ["FURNEY", "Space / perspective"],
    calendar: ["DEADLINE DESK", "Time / priorities"],
    sat: ["FLATSAT", "Motion → capture"],
    robot: ["FIRST ROBOTICS", "Hardware ↔ software"],
    alarm: ["SNOOZELESS", "Silent / tactile"],
  };
  return (
    <svg viewBox="0 0 400 225" className="h-full w-full text-primary" fill="none" aria-hidden="true">
      <text x="24" y="31" className="fill-current font-mono text-[11px]">{labels[kind][0]}</text>
      <path d="M24 43H376" className="stroke-current opacity-25" />
      <g stroke="currentColor" strokeWidth="1.5">
        {kind === "alarm" && <>
          <path d="M176 87V62h48v25m-48 67v25h48v-25" className="opacity-50" />
          <rect x="164" y="87" width="72" height="67" rx="6" />
          <circle cx="200" cy="120" r="14" /><path d="M200 111v10l7 4M236 107h5m-5 27h5" />
          <path d="m151 109-5 6 5 6-5 6m103-18 5 6-5 6 5 6" className="opacity-50" />
        </>}
        {kind === "sensor" && <>
          <circle cx="200" cy="118" r="26" /><circle cx="200" cy="118" r="4" className="fill-current" />
          <path d="M158 89a51 51 0 0 0 0 58M242 89a51 51 0 0 1 0 58M145 78a69 69 0 0 0 0 80M255 78a69 69 0 0 1 0 80" className="opacity-40" />
          <path d="M200 144v22m-20 0h40" />
        </>}
        {kind === "app" && <>
          <path d="m132 96 67-29 70 29v59l-70 31-67-31Zm0 0 67 30 70-30m-70 30v60" className="opacity-60" />
          <path d="m158 130 38-17 45 20-39 17Zm0 0v17l44 20 39-17v-17m-39 17v17" />
        </>}
        {kind === "calendar" && <>
          <path d="M113 79h174M113 111h174M113 143h174M113 175h174" className="opacity-25" />
          <rect x="113" y="90" width="10" height="10" rx="2" /><path d="M141 95h90m-90 32h121m-121 32h62" />
          <path d="m113 125 4 4 9-10m-13 38 4 4 9-10" />
          <circle cx="277" cy="95" r="4" className="fill-current" />
        </>}
        {kind === "sat" && <>
          <rect x="147" y="84" width="110" height="76" rx="4" /><circle cx="202" cy="122" r="24" /><circle cx="202" cy="122" r="12" className="opacity-40" />
          <path d="M129 96h-16v52h16m146-52h16v52h-16M181 72V61h42v11" className="opacity-50" />
          <path d="m302 115 7 7-7 7m-1-7h-23" />
        </>}
        {kind === "robot" && <>
          <path d="M144 159h108l-8-18h-92Zm32-18 14-44 37 19 18-33m-55 14-20-21" />
          <circle cx="190" cy="97" r="7" className="fill-surface" /><circle cx="227" cy="116" r="6" className="fill-surface" />
          <circle cx="162" cy="169" r="10" /><circle cx="234" cy="169" r="10" />
          <path d="m245 83 13 2 5-11m-18 9 1-13 11-5" />
          <path d="m107 116-9 7 9 7m185-14 9 7-9 7" className="opacity-50" />
        </>}
      </g>
      <text x="24" y="205" className="fill-current font-mono text-[10px] opacity-75">{labels[kind][1]}</text>
    </svg>
  );
}
