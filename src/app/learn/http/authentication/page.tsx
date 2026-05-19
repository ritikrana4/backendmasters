import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/courses";
import { content } from "@/content/http/authentication";
import TopicContent from "@/components/TopicContent";

export const metadata: Metadata = {
  title: "Authentication & Authorization",
  description:
    "Understand API authentication patterns: API keys, JWTs (JSON Web Tokens), OAuth 2.0 authorization code flow, and refresh token strategies for secure, stateless APIs.",
  keywords: ["api authentication", "jwt token", "oauth 2.0", "api keys", "bearer token", "refresh token"],
};

export default function AuthenticationPage() {
  const topic = getTopic("http", "authentication");
  if (!topic) notFound();

  return (
    <TopicContent
      title={content.title}
      sections={content.sections}
      accentColor="#58a6ff"
    />
  );
}
