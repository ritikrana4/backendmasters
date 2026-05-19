import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/courses";
import { content } from "@/content/backend/api-gateway";
import TopicContent from "@/components/TopicContent";

export const metadata: Metadata = {
  title: "API Gateway Patterns",
  description: "Learn how API gateways centralise routing, authentication, rate limiting, and SSL termination. Covers Nginx, Kong, AWS API Gateway, and when to build vs buy.",
  keywords: ["api gateway", "reverse proxy", "kong api gateway", "nginx gateway", "rate limiting", "ssl termination"],
};

export default function ApiGatewayPage() {
  const topic = getTopic("backend", "api-gateway");
  if (!topic) notFound();
  return <TopicContent title={content.title} sections={content.sections} accentColor="#a371f7" />;
}
