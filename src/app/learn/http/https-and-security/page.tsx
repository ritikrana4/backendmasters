import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/courses";
import { content } from "@/content/http/https-and-security";
import TopicContent from "@/components/TopicContent";

export const metadata: Metadata = {
  title: "HTTPS & Security",
  description:
    "Learn how TLS encrypts HTTP traffic, how certificate authorities work, how CORS protects browsers from cross-origin attacks, and which security headers every API should set.",
  keywords: ["https tls", "tls handshake", "cors", "security headers", "ssl certificate", "api security"],
};

export default function HttpsAndSecurityPage() {
  const topic = getTopic("http", "https-and-security");
  if (!topic) notFound();

  return (
    <TopicContent
      title={content.title}
      sections={content.sections}
      accentColor="#58a6ff"
    />
  );
}
