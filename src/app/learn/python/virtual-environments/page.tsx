import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/courses";
import { content } from "@/content/python/virtual-environments";
import TopicContent from "@/components/TopicContent";

export const metadata: Metadata = {
  title: "Virtual Environments & pip — Python",
  description:
    "Isolate Python project dependencies with venv, install packages with pip, manage requirements.txt, and understand modern tools like uv and poetry.",
  keywords: ["python virtual environment", "python venv", "pip install", "requirements.txt", "python packages"],
};

export default function VirtualEnvironmentsPage() {
  const topic = getTopic("python", "virtual-environments");
  if (!topic) notFound();
  return (
    <TopicContent
      title={content.title}
      sections={content.sections}
    />
  );
}
