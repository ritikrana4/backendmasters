import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/courses";
import { content } from "@/content/http/graphql";
import TopicContent from "@/components/TopicContent";

export const metadata: Metadata = {
  title: "GraphQL",
  description:
    "Learn GraphQL: schema definition language, queries, mutations, subscriptions, and how GraphQL compares to REST. Understand when to use GraphQL and how to avoid common pitfalls like N+1 queries.",
  keywords: ["graphql tutorial", "graphql vs rest", "graphql schema", "graphql queries", "graphql mutations"],
};

export default function GraphQlPage() {
  const topic = getTopic("http", "graphql");
  if (!topic) notFound();

  return (
    <TopicContent
      title={content.title}
      sections={content.sections}
      accentColor="#58a6ff"
    />
  );
}
