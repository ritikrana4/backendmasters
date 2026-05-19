import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/courses";
import { content } from "@/content/cloud-devops/infrastructure-as-code";
import TopicContent from "@/components/TopicContent";

export const metadata: Metadata = {
  title: "Infrastructure as Code",
  description: "Define and provision cloud infrastructure declaratively with Terraform: providers, resources, state management, variables, outputs, and remote backends.",
  keywords: ["terraform", "infrastructure as code", "iac", "cloud provisioning", "devops", "aws"],
};

export default function InfrastructureAsCodePage() {
  const topic = getTopic("cloud-devops", "infrastructure-as-code");
  if (!topic) notFound();
  return <TopicContent title={content.title} sections={content.sections} accentColor="#0ea5e9" />;
}
