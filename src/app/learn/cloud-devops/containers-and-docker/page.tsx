import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/courses";
import { content } from "@/content/cloud-devops/containers-and-docker";
import TopicContent from "@/components/TopicContent";

export const metadata: Metadata = {
  title: "Containers & Docker",
  description: "What containers are, how they differ from VMs, Docker architecture, writing Dockerfiles, and essential docker commands to build, run, and manage containers.",
  keywords: ["docker", "containers", "dockerfile", "containerization", "virtual machines", "devops"],
};

export default function ContainersAndDockerPage() {
  const topic = getTopic("cloud-devops", "containers-and-docker");
  if (!topic) notFound();
  return <TopicContent title={content.title} sections={content.sections} accentColor="#0ea5e9" />;
}
