import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/courses";
import { content } from "@/content/backend/config-and-secrets";
import TopicContent from "@/components/TopicContent";

export const metadata: Metadata = {
  title: "Config & Secrets",
  description:
    "Learn how to manage configuration and secrets in backend systems: environment variables, secrets managers, feature flags, and preventing credentials from leaking into source code.",
  keywords: ["config management", "secrets management", "environment variables", "AWS Secrets Manager", "Vault", "feature flags"],
};

export default function ConfigAndSecretsPage() {
  const topic = getTopic("backend", "config-and-secrets");
  if (!topic) notFound();
  return (
    <TopicContent
      title={content.title}
      sections={content.sections}
      accentColor="#a371f7"
    />
  );
}
