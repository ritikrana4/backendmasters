import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/courses";
import { content } from "@/content/cloud-devops/ci-cd-pipelines";
import TopicContent from "@/components/TopicContent";

export const metadata: Metadata = {
  title: "CI/CD Pipelines",
  description: "Automate build, test, and deploy with CI/CD pipelines. GitHub Actions workflow syntax, pipeline stages, deployment strategies: rolling, blue-green, and canary.",
  keywords: ["ci/cd", "github actions", "continuous integration", "continuous deployment", "devops", "pipelines"],
};

export default function CiCdPipelinesPage() {
  const topic = getTopic("cloud-devops", "ci-cd-pipelines");
  if (!topic) notFound();
  return <TopicContent title={content.title} sections={content.sections} accentColor="#0ea5e9" />;
}
