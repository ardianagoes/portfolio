import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

export function Section({ id, label, title, children }: { id: string; label: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-20 py-20 md:py-28">
      <div className="mx-auto max-w-5xl px-6">
        <div className="mb-12 grid gap-4 md:grid-cols-[180px_1fr]">
          <span className="pt-2 text-sm text-muted-foreground">{label}</span>
          <h2 className="max-w-2xl text-3xl font-normal leading-tight md:text-4xl">{title}</h2>
        </div>
        <div className="md:pl-[180px]">{children}</div>
      </div>
    </section>
  );
}

export function PillLink({ href, children, primary }: { href: string; children: ReactNode; primary?: boolean }) {
  const ext = href.startsWith("http");
  return (
    <Button asChild variant={primary ? "default" : "link"} className={`min-h-11 rounded-full px-5 shadow-none ${primary ? "" : "text-foreground underline decoration-border underline-offset-4 hover:decoration-primary"}`}>
      <a href={href} target={ext ? "_blank" : undefined} rel={ext ? "noreferrer" : undefined}>{children}</a>
    </Button>
  );
}
