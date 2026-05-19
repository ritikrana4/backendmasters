import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/courses";
import { content } from "@/content/backend/docker";
import TopicContent from "@/components/TopicContent";

export const metadata: Metadata = {
  title: "Docker & Containers",
  description:
    "Learn Docker and containerization for backend engineers: Dockerfiles, images, containers, docker-compose, multi-stage builds, and container best practices for production.",
  keywords: ["Docker", "containers", "Dockerfile", "docker-compose", "containerization", "multi-stage build"],
};

export default function DockerPage() {
  const topic = getTopic("backend", "docker");
  if (!topic) notFound();
  return (
    <TopicContent
      title={content.title}
      sections={content.sections}
      accentColor="#a371f7"
    />
  );
}
