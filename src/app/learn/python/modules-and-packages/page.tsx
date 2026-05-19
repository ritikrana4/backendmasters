import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/courses";
import { content } from "@/content/python/modules-and-packages";
import TopicContent from "@/components/TopicContent";

export const metadata: Metadata = {
  title: "Modules & Packages — Python",
  description:
    "Organise Python code with modules and explore the standard library: math, random, datetime, os, collections, json, and more.",
  keywords: ["python modules", "python standard library", "python import", "python packages", "python tutorial"],
};

export default function ModulesAndPackagesPage() {
  const topic = getTopic("python", "modules-and-packages");
  if (!topic) notFound();
  return (
    <TopicContent
      title={content.title}
      sections={content.sections}
      starterCode={content.starterCode}
    />
  );
}
