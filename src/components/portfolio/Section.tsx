import type { ReactNode } from "react";

export function Section({ id, label, title, children }: { id: string; label: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 border-t border-border py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-14 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <h2 className="text-4xl font-semibold md:text-5xl">{title}</h2>
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-primary">{label}</span>
        </div>
        {children}
      </div>
    </section>
  );
}

export function PillLink({ href, children, primary }: { href: string; children: ReactNode; primary?: boolean }) {
  const ext = href.startsWith("http");
  return (
    <a href={href} target={ext ? "_blank" : undefined} rel={ext ? "noreferrer" : undefined}
      className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-colors ${
        primary ? "bg-primary text-primary-foreground hover:bg-primary/90" : "border border-border bg-secondary/40 hover:border-primary/50 hover:text-primary"
      }`}>
      {children}
    </a>
  );
}
