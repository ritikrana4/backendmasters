import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/courses";
import { content } from "@/content/backend/ci-cd";
import TopicContent from "@/components/TopicContent";

export const metadata: Metadata = {
  title: "CI/CD Pipelines",
  description:
    "Learn CI/CD for backend engineers: continuous integration, continuous deployment, GitHub Actions, automated testing in pipelines, deployment strategies, and rollback.",
  keywords: ["CI/CD", "continuous integration", "continuous deployment", "GitHub Actions", "deployment pipeline", "automated testing"],
};

export default function CiCdPage() {
  const topic = getTopic("backend", "ci-cd");
  if (!topic) notFound();
  return (
    <TopicContent
      title={content.title}
      sections={content.sections}
      accentColor="#a371f7"
    />
  );
}
