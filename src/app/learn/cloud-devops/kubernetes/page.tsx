import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/courses";
import { content } from "@/content/cloud-devops/kubernetes";
import TopicContent from "@/components/TopicContent";

export const metadata: Metadata = {
  title: "Kubernetes Fundamentals",
  description: "Container orchestration with Kubernetes: Pods, Deployments, Services, Ingress, control plane architecture, and kubectl basics for managing containerized applications.",
  keywords: ["kubernetes", "k8s", "pods", "deployments", "container orchestration", "devops"],
};

export default function KubernetesPage() {
  const topic = getTopic("cloud-devops", "kubernetes");
  if (!topic) notFound();
  return <TopicContent title={content.title} sections={content.sections} accentColor="#0ea5e9" />;
}
