import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/courses";
import { content } from "@/content/http/rest-principles";
import TopicContent from "@/components/TopicContent";

export const metadata: Metadata = {
  title: "REST Principles",
  description:
    "Learn the six constraints of REST architecture: statelessness, uniform interface, client-server separation, cacheability, layered systems, and code on demand. Understand what makes an API truly RESTful.",
  keywords: ["rest principles", "restful api", "rest constraints", "stateless api", "uniform interface"],
};

export default function RestPrinciplesPage() {
  const topic = getTopic("http", "rest-principles");
  if (!topic) notFound();

  return (
    <TopicContent
      title={content.title}
      sections={content.sections}
      accentColor="#58a6ff"
    />
  );
}
