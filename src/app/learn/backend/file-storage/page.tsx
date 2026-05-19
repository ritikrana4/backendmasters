import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/courses";
import { content } from "@/content/backend/file-storage";
import TopicContent from "@/components/TopicContent";

export const metadata: Metadata = {
  title: "File Storage",
  description:
    "Learn file storage strategies for backend systems: local disk vs cloud storage, S3-compatible APIs, CDN integration, pre-signed URLs, and handling uploads securely.",
  keywords: ["file storage", "S3", "object storage", "CDN", "pre-signed URLs", "file uploads"],
};

export default function FileStoragePage() {
  const topic = getTopic("backend", "file-storage");
  if (!topic) notFound();
  return (
    <TopicContent
      title={content.title}
      sections={content.sections}
      accentColor="#a371f7"
    />
  );
}
