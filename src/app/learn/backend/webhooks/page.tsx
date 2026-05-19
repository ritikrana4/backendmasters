import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/courses";
import { content } from "@/content/backend/webhooks";
import TopicContent from "@/components/TopicContent";

export const metadata: Metadata = {
  title: "Webhooks",
  description:
    "Learn how to build and consume webhooks: event-driven HTTP callbacks, payload verification with HMAC signatures, idempotency, retry handling, and webhook security.",
  keywords: ["webhooks", "event-driven", "HMAC", "webhook security", "idempotency", "HTTP callbacks"],
};

export default function WebhooksPage() {
  const topic = getTopic("backend", "webhooks");
  if (!topic) notFound();
  return (
    <TopicContent
      title={content.title}
      sections={content.sections}
      accentColor="#a371f7"
    />
  );
}
