import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight, Github, Linkedin, Mail, FileText } from "lucide-react";
import { experience, interests, links, projects, skills } from "@/components/portfolio/data";
import { ProjectVisual } from "@/components/portfolio/ProjectVisual";
import { PillLink, Section } from "@/components/portfolio/Section";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ardian Agoes — Electrical Engineering Portfolio" },
      { name: "description", content: "Brown University EE student building FPGA, embedded, and robotics projects." },
      { property: "og:title", content: "Ardian Agoes — Electrical Engineering Portfolio" },
      { property: "og:description", content: "Brown University EE student building FPGA, embedded, and robotics projects." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const nav = [["Projects", "#projects"], ["About", "#about"], ["Experience", "#experience"], ["Skills", "#skills"], ["Contact", "#contact"]];

function Index() {
  return (
    <div className="min-h-screen">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <a href="#top" className="font-display text-lg font-semibold">ardian<span className="text-primary">.</span></a>
          <nav className="hidden gap-8 text-sm text-muted-foreground md:flex">
            {nav.map(([l, h]) => <a key={h} href={h} className="hover:text-foreground">{l}</a>)}
          </nav>
          <a href="#contact" className="rounded-full border border-border px-4 py-1.5 text-sm hover:border-primary/50">Say hi</a>
        </div>
      </header>

      {/* Hero */}
      <section id="top" className="relative overflow-hidden pt-36 pb-24 md:pt-44 md:pb-32">
        <div className="grid-bg pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_70%_30%,black,transparent_70%)]" />
        <div className="relative mx-auto grid max-w-6xl gap-16 px-6 md:grid-cols-[1.3fr_1fr] md:items-center">
          <div>
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/40 px-3 py-1 font-mono text-xs text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Electrical Engineering · Brown University
            </div>
            <h1 className="text-6xl font-semibold leading-[0.95] md:text-8xl">Ardian<br />Agoes<span className="text-primary">.</span></h1>
            <p className="mt-8 max-w-lg text-lg text-muted-foreground">
              I build hardware and the software that drives it — from sensor boards and robots to digital logic that has to be fast.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <PillLink href="#projects" primary>View projects <ArrowUpRight className="h-4 w-4" /></PillLink>
              <PillLink href={links.resume}><FileText className="h-4 w-4" />Resume</PillLink>
              <PillLink href={links.github}><Github className="h-4 w-4" />GitHub</PillLink>
              <PillLink href={links.linkedin}><Linkedin className="h-4 w-4" />LinkedIn</PillLink>
              <PillLink href="#contact"><Mail className="h-4 w-4" />Contact</PillLink>
            </div>
          </div>
          <ChipGraphic />
        </div>
        <div className="relative mx-auto mt-20 flex max-w-6xl flex-wrap gap-x-8 gap-y-3 px-6 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
          {interests.map((i) => <span key={i}>/ {i}</span>)}
        </div>
      </section>

      <Section id="projects" label="01 — Selected work" title="Featured projects">
        <div className="grid gap-6 md:grid-cols-2">
          {projects.map((p, i) => (
            <article key={p.id} className={`group overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-primary/40 ${i === 0 ? "md:col-span-2" : ""}`}>
              <div className={`grid-bg relative border-b border-border bg-surface ${i === 0 ? "h-72" : "h-56"}`}>
                <ProjectVisual kind={p.kind} />
                <span className="absolute left-5 top-5 font-mono text-xs text-muted-foreground">{p.id}</span>
              </div>
              <div className="p-7">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-semibold">{p.title}</h3>
                    <p className="mt-1 text-primary">{p.tagline}</p>
                  </div>
                  <ArrowUpRight className="h-5 w-5 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
                </div>
                <p className="mt-4 text-muted-foreground">{p.description}</p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {p.tags.map((t) => <span key={t} className="rounded-full border border-border px-3 py-1 font-mono text-xs text-muted-foreground">{t}</span>)}
                </div>
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section id="about" label="02 — About" title="Curious about how things work, down to the gate.">
        <div className="grid gap-10 md:grid-cols-2 text-lg text-muted-foreground">
          <p>I'm an Electrical Engineering student at Brown University. I like projects where hardware and code meet — where a timing constraint, a noisy sensor, or a control loop decides whether something actually works.</p>
          <p>Lately I've been drawn to FPGAs, ASIC design, and semiconductors, especially systems where latency matters. Outside of class I build with embedded boards, robots, and the occasional app that solves a problem I have myself.</p>
        </div>
      </Section>

      <Section id="experience" label="03 — Experience" title="Experience & activities">
        <div className="divide-y divide-border border-y border-border">
          {experience.map((e) => (
            <div key={e.org} className="grid gap-2 py-7 md:grid-cols-[1fr_1fr_auto] md:items-center">
              <h3 className="text-xl font-semibold">{e.org}</h3>
              <div><p>{e.role}</p><p className="text-sm text-muted-foreground">{e.note}</p></div>
              <span className="font-mono text-xs text-muted-foreground">{e.period}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section id="skills" label="04 — Toolkit" title="Skills">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {skills.map((s) => (
            <div key={s.group} className="rounded-2xl border border-border bg-card p-6">
              <h3 className="mb-5 font-mono text-xs uppercase tracking-[0.18em] text-primary">{s.group}</h3>
              <ul className="space-y-2.5">{s.items.map((i) => <li key={i}>{i}</li>)}</ul>
            </div>
          ))}
        </div>
      </Section>

      <Section id="contact" label="05 — Contact" title="Let's build something.">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { icon: Mail, label: "Email", value: links.emailLabel, href: links.email },
            { icon: Github, label: "GitHub", value: "github.com/…", href: links.github },
            { icon: Linkedin, label: "LinkedIn", value: "linkedin.com/in/…", href: links.linkedin },
          ].map(({ icon: Icon, label, value, href }) => (
            <a key={label} href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer"
              className="group flex items-center justify-between rounded-2xl border border-border bg-card p-6 hover:border-primary/40">
              <div className="flex items-center gap-4">
                <Icon className="h-5 w-5 text-primary" />
                <div><p className="text-sm text-muted-foreground">{label}</p><p>{value}</p></div>
              </div>
              <ArrowUpRight className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
            </a>
          ))}
        </div>
      </Section>

      <footer className="border-t border-border py-10">
        <div className="mx-auto flex max-w-6xl justify-between px-6 font-mono text-xs text-muted-foreground">
          <span>© 2026 Ardian Agoes</span><span>Providence, RI</span>
        </div>
      </footer>
    </div>
  );
}

function ChipGraphic() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-sm">
      <svg viewBox="0 0 300 300" className="h-full w-full" fill="none" aria-hidden>
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const p = 95 + i * 22;
          return (
            <g key={i} className="stroke-foreground/25" strokeWidth="1.5">
              <line x1={p} y1="20" x2={p} y2="70" /><line x1={p} y1="230" x2={p} y2="280" />
              <line x1="20" y1={p} x2="70" y2={p} /><line x1="230" y1={p} x2="280" y2={p} />
            </g>
          );
        })}
        <rect x="70" y="70" width="160" height="160" rx="14" className="fill-card stroke-border" strokeWidth="1.5" />
        <rect x="105" y="105" width="90" height="90" rx="6" className="stroke-primary" strokeWidth="1.5" />
        <path d="M105 150 H130 V125 H170 V175 H195" className="stroke-signal/70" strokeWidth="1.5" />
        <circle cx="150" cy="150" r="5" className="fill-primary" />
        <circle cx="20" cy="117" r="3" className="fill-primary" />
        <circle cx="205" cy="280" r="3" className="fill-signal" />
      </svg>
    </div>
  );
}
