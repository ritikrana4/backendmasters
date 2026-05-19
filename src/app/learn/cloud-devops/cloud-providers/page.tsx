import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/courses";
import { content } from "@/content/cloud-devops/cloud-providers";
import TopicContent from "@/components/TopicContent";

export const metadata: Metadata = {
  title: "Cloud Providers & Core Services",
  description: "AWS, GCP, and Azure service landscape: compute, storage, networking, and managed databases. Shared responsibility model and when to use managed services.",
  keywords: ["aws", "cloud providers", "ec2", "s3", "gcp", "azure", "cloud computing", "managed services"],
};

export default function CloudProvidersPage() {
  const topic = getTopic("cloud-devops", "cloud-providers");
  if (!topic) notFound();
  return <TopicContent title={content.title} sections={content.sections} accentColor="#0ea5e9" />;
}
