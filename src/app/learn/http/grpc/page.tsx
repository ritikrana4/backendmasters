import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/courses";
import { content } from "@/content/http/grpc";
import TopicContent from "@/components/TopicContent";

export const metadata: Metadata = {
  title: "gRPC & Protocol Buffers",
  description:
    "Learn gRPC and Protocol Buffers: how to define services in .proto files, the four streaming patterns (unary, server, client, bidirectional), and when to choose gRPC over REST or GraphQL.",
  keywords: ["grpc tutorial", "protocol buffers", "protobuf", "grpc vs rest", "grpc streaming", "grpc golang"],
};

export default function GrpcPage() {
  const topic = getTopic("http", "grpc");
  if (!topic) notFound();

  return (
    <TopicContent
      title={content.title}
      sections={content.sections}
      accentColor="#58a6ff"
    />
  );
}
