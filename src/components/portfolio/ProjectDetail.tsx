import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Project } from "./data";
import { ProjectVisual } from "./ProjectVisual";
import { PillLink, Section } from "./Section";

/** Render only supplied facts and authentic media; absent content is not invented. */
export function ProjectDetail({ project }: { project: Project }) {
  const details = project.details;
  const sections = [
    { id: "motivation", title: "Problem and motivation", text: details?.motivation },
    { id: "contribution", title: "My contribution", text: details?.contribution },
    { id: "challenges", title: "Technical challenges", text: details?.challenges },
  ];
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex min-h-20 max-w-5xl items-center justify-between gap-4 px-6">
        <Link to="/" className="font-display text-2xl" aria-label="Ardian Agoes — home">ardian.</Link>
        <Button asChild variant="link" className="min-h-11 text-foreground">
          <Link to="/" hash="projects"><ArrowLeft aria-hidden="true" />All projects</Link>
        </Button>
      </header>
      <main>
        <section className="mx-auto max-w-5xl px-6 pb-10 pt-12 md:pt-20">
          <p className="mb-3 text-sm text-muted-foreground">Selected work / {project.id}</p>
          <h1 className="break-words text-4xl leading-tight md:text-6xl">{project.title}</h1>
          <p className="mt-5 text-lg text-primary">{project.tagline}</p>
          <div className={`project-art project-art-${project.kind} mt-8 aspect-[16/9] max-w-2xl overflow-hidden rounded-md`}>
            <ProjectVisual kind={project.kind} />
          </div>
        </section>
        <Section id="overview" label="Overview" title="Project overview">
          <p className="max-w-2xl leading-7 text-muted-foreground">{details?.overview ?? project.description}</p>
          <p className="mt-5 text-sm text-muted-foreground">{project.tags.join(" · ")}</p>
          {(details?.github || details?.demo) && <div className="mt-6 flex flex-wrap gap-2">
            {details.github && <PillLink href={details.github}><Github aria-hidden="true" />GitHub</PillLink>}
            {details.demo && <PillLink href={details.demo}>Live demo<ArrowUpRight aria-hidden="true" /></PillLink>}
          </div>}
        </Section>
        {sections.map(({ id, title, text }) => text ? <Section key={id} id={id} label="Project notes" title={title}>
          <p className="max-w-2xl whitespace-pre-line leading-7 text-muted-foreground">{text}</p>
        </Section> : null)}
        {details?.technologies?.length ? <Section id="technologies" label="Toolkit" title="Technologies used">
          <ul className="space-y-2 text-muted-foreground">{details.technologies.map((technology) => <li key={technology}>{technology}</li>)}</ul>
        </Section> : null}
        {details?.media?.length ? <Section id="media" label="In practice" title="Screenshots and photos">
          <div className="space-y-8">{details.media.map((media) => <figure key={media.src}>
            <img src={media.src} alt={media.alt} loading="lazy" className="h-auto w-full rounded-md" />
            {media.caption && <figcaption className="mt-3 text-sm text-muted-foreground">{media.caption}</figcaption>}
          </figure>)}</div>
        </Section> : null}
      </main>
      <footer className="border-t border-border py-10">
        <div className="mx-auto flex max-w-5xl justify-between gap-4 px-6 text-sm text-muted-foreground">
          <span>© 2026 Ardian Agoes</span><span>Providence, RI</span>
        </div>
      </footer>
    </div>
  );
}