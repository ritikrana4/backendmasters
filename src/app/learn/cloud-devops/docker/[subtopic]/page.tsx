import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSubtopic, getTopic } from "@/lib/courses";
import TopicContent from "@/components/TopicContent";

import { content as architecture } from "@/content/cloud-devops/docker/architecture";
import { content as dockerfile } from "@/content/cloud-devops/docker/dockerfile";
import { content as networking } from "@/content/cloud-devops/docker/networking";
import { content as volumes } from "@/content/cloud-devops/docker/volumes";
import { content as multiStage } from "@/content/cloud-devops/docker/multi-stage";
import { content as registry } from "@/content/cloud-devops/docker/registry";
import { content as security } from "@/content/cloud-devops/docker/security";

type ContentData = {
  title: string;
  sections: { heading: string; body: string; code?: string; items?: string[] }[];
};

const contentMap: Record<string, ContentData> = {
  architecture,
  dockerfile,
  networking,
  volumes,
  "multi-stage": multiStage,
  registry,
  security,
};

export async function generateStaticParams() {
  const topic = getTopic("cloud-devops", "docker");
  return (topic?.subtopics ?? []).map((s) => ({ subtopic: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ subtopic: string }>;
}): Promise<Metadata> {
  const { subtopic } = await params;
  const sub = getSubtopic("cloud-devops", "docker", subtopic);
  if (!sub) return {};
  return {
    title: sub.title,
    description: sub.description,
    keywords: ["docker", subtopic, "containers", "devops", "containerization"],
  };
}

export default async function DockerSubtopicPage({
  params,
}: {
  params: Promise<{ subtopic: string }>;
}) {
  const { subtopic } = await params;
  const sub = getSubtopic("cloud-devops", "docker", subtopic);
  const topicContent = contentMap[subtopic];
  if (!sub || !topicContent) notFound();

  return (
    <TopicContent
      title={topicContent.title}
      sections={topicContent.sections}
      accentColor="#2496ed"
    />
  );
}
