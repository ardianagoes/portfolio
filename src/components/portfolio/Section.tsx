import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

export function Section({ id, label, title, children }: { id: string; label: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-8 border-t border-border/60 py-12 md:py-16">
      <div className="mx-auto max-w-5xl px-6">
        <div className="mb-8 grid gap-3 md:grid-cols-[140px_1fr] md:gap-x-0">
          <span className="pt-2 text-sm text-muted-foreground">{label}</span>
          <h2 className="max-w-2xl text-3xl font-normal leading-tight md:text-4xl">{title}</h2>
        </div>
        <div className="md:pl-[140px]">{children}</div>
      </div>
    </section>
  );
}

export function PillLink({ href, children, primary }: { href?: string | undefined; children: ReactNode; primary?: boolean }) {
  if (!href) return <span className="inline-flex min-h-11 items-center gap-2 px-4 text-sm text-muted-foreground">{children} <span className="text-xs">(pending)</span></span>;
  const ext = href.startsWith("http");
  return (
    <Button asChild variant={primary ? "default" : "link"} className={`min-h-11 rounded-md px-4 shadow-none transition-none ${primary ? "" : "text-foreground underline decoration-border underline-offset-4 hover:decoration-primary"}`}>
      <a href={href} target={ext ? "_blank" : undefined} rel={ext ? "noreferrer" : undefined}>{children}</a>
    </Button>
  );
}
