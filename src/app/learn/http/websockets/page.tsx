import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/courses";
import { content } from "@/content/http/websockets";
import TopicContent from "@/components/TopicContent";

export const metadata: Metadata = {
  title: "WebSockets & Real-Time",
  description:
    "Learn how WebSockets enable real-time bidirectional communication between client and server. Covers the upgrade handshake, WebSocket vs HTTP polling, and Server-Sent Events (SSE).",
  keywords: ["websockets tutorial", "real-time web", "websocket vs http", "server-sent events", "sse", "socket.io"],
};

export default function WebSocketsPage() {
  const topic = getTopic("http", "websockets");
  if (!topic) notFound();

  return (
    <TopicContent
      title={content.title}
      sections={content.sections}
      accentColor="#58a6ff"
    />
  );
}
