import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/courses";
import { content } from "@/content/backend/authentication";
import TopicContent from "@/components/TopicContent";

export const metadata: Metadata = {
  title: "Authentication — Sessions & Tokens",
  description: "Learn session-based auth with Redis, JWT authentication, refresh token rotation, secure storage best practices, and multi-factor authentication (MFA).",
  keywords: ["jwt authentication", "session authentication", "refresh token", "bearer token", "mfa authentication", "backend auth"],
};

export default function AuthenticationPage() {
  const topic = getTopic("backend", "authentication");
  if (!topic) notFound();
  return <TopicContent title={content.title} sections={content.sections} accentColor="#a371f7" />;
}
