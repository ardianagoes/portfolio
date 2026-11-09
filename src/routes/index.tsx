import { createFileRoute } from "@tanstack/react-router";
import { ArrowDown, ArrowUpRight, Github, Linkedin, FileText } from "lucide-react";
import { experience, interests, links, projects, skills } from "@/components/portfolio/data";
import { ProjectVisual } from "@/components/portfolio/ProjectVisual";
import { PillLink, Section } from "@/components/portfolio/Section";
import { ContactForm } from "@/components/portfolio/ContactForm";

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
      <header className="absolute inset-x-0 top-0 z-20">
        <div className="mx-auto flex h-20 max-w-5xl items-center justify-between px-6">
          <a href="#top" aria-label="Ardian Agoes — home" className="font-display text-2xl">ardian.</a>
          <nav aria-label="Main navigation" className="hidden gap-7 text-sm text-muted-foreground md:flex">
            {nav.map(([l, h]) => <a key={h} href={h} className="hover:text-foreground">{l}</a>)}
          </nav>
          <a href="#contact" className="text-sm underline decoration-border underline-offset-4 hover:decoration-primary md:hidden">Contact</a>
        </div>
      </header>

      <section id="top" className="relative overflow-hidden pb-8 pt-32 md:pb-10 md:pt-40">
        <div className="relative mx-auto w-full max-w-5xl px-6">
          <div aria-hidden="true" className="absolute right-6 top-1 hidden border-l border-border pl-4 font-mono text-xs leading-6 text-muted-foreground lg:block">01 / FIELD NOTES<br />Circuits ↔ code</div>
          <h1 className="max-w-3xl text-[42px] font-normal leading-[1.12] sm:text-6xl md:text-[68px]">I build things where<br className="hidden sm:block" /> hardware meets<br className="hidden sm:block" /> <em className="text-primary">software.</em></h1>
          <p className="mt-7 max-w-[540px] text-base leading-7 text-muted-foreground md:text-lg md:leading-8">
            <span className="text-foreground">I'm Ardian Agoes,</span> an Electrical Engineering student at Brown University. I enjoy building projects that connect circuits, code, and the physical world.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-x-2 gap-y-3">
            <PillLink href="#projects" primary>See my work <ArrowDown className="h-4 w-4" /></PillLink>
            <PillLink href={links.resume}><FileText className="h-4 w-4" />Resume</PillLink>
            <PillLink href={links.github}><Github className="h-4 w-4" />GitHub</PillLink>
            <PillLink href={links.linkedin}><Linkedin className="h-4 w-4" />LinkedIn</PillLink>
          </div>
          <div className="exploring-strip mt-12 border-t border-border py-6 md:mt-14">
            <h2 className="mb-3 font-sans text-sm font-medium text-primary">Currently exploring</h2>
            <ul className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm leading-6 text-foreground md:text-base">
              {interests.map((interest, index) => <li key={interest} className="flex items-center gap-3">{index > 0 && <span aria-hidden="true" className="text-primary">·</span>}{interest}</li>)}
            </ul>
          </div>
        </div>
      </section>

      <Section id="projects" label="Selected work" title="Projects I’ve been building">
        <div className="space-y-10">
          {projects.map((p) => (
            <article key={p.id} className="grid gap-6 border-t border-border pt-7 md:grid-cols-[1fr_1.15fr] md:items-start">
              <div className={`project-art project-art-${p.kind} aspect-[16/9] overflow-hidden rounded-md`}>
                <ProjectVisual kind={p.kind} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{p.id}</p>
                <h3 className="mt-2 text-3xl font-normal">{p.title}</h3>
                <p className="mt-2 text-primary">{p.tagline}</p>
                <p className="mt-5 leading-7 text-muted-foreground">{p.description}</p>
                <p className="mt-5 text-sm text-muted-foreground">{p.tags.join(" · ")}</p>
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section id="about" label="02 — About" title="Curious about how things work, down to the gate.">
        <div className="grid gap-8 text-lg leading-8 text-muted-foreground md:grid-cols-2">
          <p>I like figuring out why something works — or why it doesn't. A timing constraint, a noisy sensor, or a stubborn control loop is often where a project gets interesting.</p>
          <p>Lately, I've been drawn to digital design and systems where latency matters. Outside of class, I build with embedded boards, robots, and the occasional app that solves a problem I have myself.</p>
        </div>
      </Section>

      <Section id="experience" label="03 — Experience" title="Experience & activities">
        <div className="divide-y divide-border border-y border-border">
          {experience.map((e) => (
            <div key={e.org} className="grid gap-2 py-7 md:grid-cols-[1fr_1fr_auto] md:items-center">
              <h3 className="text-xl font-normal">{e.org}</h3>
              <div><p>{e.role}</p><p className="text-sm text-muted-foreground">{e.note}</p></div>
              <span className="font-mono text-xs text-muted-foreground">{e.period}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section id="skills" label="04 — Toolkit" title="Skills">
        <div className="grid gap-10 sm:grid-cols-2">
          {skills.map((s) => (
            <div key={s.group} className="border-t border-border pt-5">
              <h3 className="mb-4 text-sm font-medium text-primary">{s.group}</h3>
              <ul className="space-y-2 text-muted-foreground">{s.items.map((i) => <li key={i}>{i}</li>)}</ul>
            </div>
          ))}
        </div>
      </Section>

      <Section id="contact" label="05 — Contact" title="Let's build something.">
        <ContactForm />
        <div className="mt-8 grid gap-x-8 border-t border-border sm:grid-cols-2">
          {[
            { icon: Github, label: "GitHub", value: "github.com/…", href: links.github },
            { icon: Linkedin, label: "LinkedIn", value: "linkedin.com/in/…", href: links.linkedin },
          ].map(({ icon: Icon, label, value, href }) => (
            <a key={label} href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer"
              className="group flex min-h-20 items-center justify-between py-5">
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
        <div className="mx-auto flex max-w-5xl justify-between px-6 text-sm text-muted-foreground">
          <span>© 2026 Ardian Agoes</span><span>Providence, RI</span>
        </div>
      </footer>
    </div>
  );
}

