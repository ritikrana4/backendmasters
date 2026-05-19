import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/courses";
import { content } from "@/content/cloud-devops/docker-compose";
import TopicContent from "@/components/TopicContent";

export const metadata: Metadata = {
  title: "Docker Compose",
  description: "Orchestrate multi-service development environments: docker-compose.yml syntax, service networking, volumes, environment variables, and workflow commands.",
  keywords: ["docker compose", "multi-container", "docker-compose.yml", "service networking", "devops"],
};

export default function DockerComposePage() {
  const topic = getTopic("cloud-devops", "docker-compose");
  if (!topic) notFound();
  return <TopicContent title={content.title} sections={content.sections} accentColor="#0ea5e9" />;
}
