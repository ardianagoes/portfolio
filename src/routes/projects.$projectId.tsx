import { createFileRoute, notFound } from "@tanstack/react-router";
import { projects } from "@/components/portfolio/data";
import { ProjectDetail } from "@/components/portfolio/ProjectDetail";

export const Route = createFileRoute("/projects/$projectId")({
  loader: ({ params }) => {
    const project = projects.find((item) => item.id === params.projectId);
    if (!project) throw notFound();
    return project;
  },
  head: ({ loaderData }) => {
    const title = loaderData ? `${loaderData.title} — Ardian Agoes` : "Project unavailable — Ardian Agoes";
    const description = loaderData?.description ?? "Engineering projects by Ardian Agoes.";
    return { meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      ...(!loaderData ? [{ name: "robots", content: "noindex" }] : []),
    ] };
  },
  component: ProjectPage,
});

function ProjectPage() {
  const project = Route.useLoaderData();
  return <ProjectDetail project={project} />;
}