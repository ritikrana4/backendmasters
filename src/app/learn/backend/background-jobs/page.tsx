import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/courses";
import { content } from "@/content/backend/background-jobs";
import TopicContent from "@/components/TopicContent";

export const metadata: Metadata = {
  title: "Background Jobs & Task Queues",
  description: "Learn background job processing with Celery: task queues, scheduled jobs with Celery Beat, idempotent tasks, retry logic, and job monitoring with Flower.",
  keywords: ["celery python", "background jobs", "task queue", "celery beat", "async tasks", "job queue"],
};

export default function BackgroundJobsPage() {
  const topic = getTopic("backend", "background-jobs");
  if (!topic) notFound();
  return <TopicContent title={content.title} sections={content.sections} accentColor="#a371f7" />;
}
