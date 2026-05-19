import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/courses";
import { content } from "@/content/backend/authorization";
import TopicContent from "@/components/TopicContent";

export const metadata: Metadata = {
  title: "Authorization & RBAC",
  description: "Implement role-based access control (RBAC), attribute-based access control (ABAC), route guards, row-level security, and OAuth scopes in backend systems.",
  keywords: ["rbac authorization", "role based access control", "api authorization", "row level security", "oauth scopes"],
};

export default function AuthorizationPage() {
  const topic = getTopic("backend", "authorization");
  if (!topic) notFound();
  return <TopicContent title={content.title} sections={content.sections} accentColor="#a371f7" />;
}
