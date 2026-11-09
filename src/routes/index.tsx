import { createFileRoute } from "@tanstack/react-router";
import { ArrowDown, ArrowUpRight, Github, Linkedin, Mail, FileText } from "lucide-react";
import { experience, interests, links, projects, skills } from "@/components/portfolio/data";
import { ProjectVisual } from "@/components/portfolio/ProjectVisual";
import { PillLink, Section } from "@/components/portfolio/Section";
import islandCoast from "@/assets/island-coast.jpg";

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
          <a href="#top" className="font-display text-lg">Ardian Agoes</a>
          <nav aria-label="Main navigation" className="hidden gap-7 text-sm text-muted-foreground md:flex">
            {nav.map(([l, h]) => <a key={h} href={h} className="hover:text-foreground">{l}</a>)}
          </nav>
          <a href="#contact" className="text-sm underline decoration-border underline-offset-4 hover:decoration-primary md:hidden">Contact</a>
        </div>
      </header>

      <section id="top" className="relative flex min-h-[760px] items-center overflow-hidden pb-48 pt-32 md:min-h-[820px]">
        <img src={islandCoast} alt="" width={1920} height={1024} className="hero-landscape absolute inset-0 h-full w-full object-cover" />
        <div className="relative mx-auto w-full max-w-5xl px-6">
          <p className="mb-7 text-sm text-muted-foreground">Electrical Engineering · Brown University</p>
          <h1 className="max-w-3xl text-5xl font-normal leading-[1.08] md:text-7xl">Hello, I’m Ardian. I like making hardware feel thoughtful.</h1>
          <p className="mt-8 max-w-xl text-lg leading-8 text-muted-foreground">
            I study electrical engineering and build things where circuits, code, and the physical world meet — sensors, robots, and fast digital systems.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-x-2 gap-y-3">
            <PillLink href="#projects" primary>See my work <ArrowDown className="h-4 w-4" /></PillLink>
            <PillLink href={links.resume}><FileText className="h-4 w-4" />Resume</PillLink>
            <PillLink href={links.github}><Github className="h-4 w-4" />GitHub</PillLink>
            <PillLink href={links.linkedin}><Linkedin className="h-4 w-4" />LinkedIn</PillLink>
          </div>
          <p className="mt-16 max-w-xl text-sm leading-7 text-muted-foreground">Currently curious about {interests.join(", ").replace(/, ([^,]*)$/, ", and $1")}.</p>
        </div>
      </section>

      <Section id="projects" label="Selected work" title="Projects I’ve been building">
        <div className="space-y-16">
          {projects.map((p) => (
            <article key={p.id} className="grid gap-6 border-t border-border pt-8 md:grid-cols-[1fr_1.15fr] md:items-start">
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
          <p>I'm an Electrical Engineering student at Brown University. I like projects where hardware and code meet — where a timing constraint, a noisy sensor, or a control loop decides whether something actually works.</p>
          <p>Lately I've been drawn to FPGAs, ASIC design, and semiconductors, especially systems where latency matters. Outside of class I build with embedded boards, robots, and the occasional app that solves a problem I have myself.</p>
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
        <div className="divide-y divide-border border-y border-border">
          {[
            { icon: Mail, label: "Email", value: links.emailLabel, href: links.email },
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

