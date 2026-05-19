import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/courses";
import { content } from "@/content/backend/security";
import TopicContent from "@/components/TopicContent";

export const metadata: Metadata = {
  title: "Backend Security",
  description:
    "Learn backend security fundamentals: OWASP top 10, SQL injection, XSS, CSRF, input validation, HTTPS, security headers, dependency scanning, and secure coding practices.",
  keywords: ["backend security", "OWASP", "SQL injection", "XSS", "CSRF", "secure coding", "input validation"],
};

export default function SecurityPage() {
  const topic = getTopic("backend", "security");
  if (!topic) notFound();
  return (
    <TopicContent
      title={content.title}
      sections={content.sections}
      accentColor="#a371f7"
    />
  );
}
