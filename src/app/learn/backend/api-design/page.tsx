import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/courses";
import { content } from "@/content/backend/api-design";
import TopicContent from "@/components/TopicContent";

export const metadata: Metadata = {
  title: "API Design Patterns",
  description: "Learn REST, RPC, and GraphQL patterns. Master URL design, HTTP methods, versioning, cursor pagination, idempotency keys, and consistent error responses.",
  keywords: ["api design", "rest api best practices", "api versioning", "pagination api", "idempotency", "api error handling"],
};

export default function ApiDesignPage() {
  const topic = getTopic("backend", "api-design");
  if (!topic) notFound();
  return <TopicContent title={content.title} sections={content.sections} accentColor="#a371f7" />;
}
