import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/courses";
import { content } from "@/content/python/async-await";
import TopicContent from "@/components/TopicContent";

export const metadata: Metadata = {
  title: "Async / Await — Python",
  description:
    "Write concurrent Python with async def, await, asyncio.gather(), and create_task(). Understand the event loop and when to use async over threads.",
  keywords: ["python async await", "python asyncio", "python coroutines", "asyncio.gather", "python concurrent"],
};

export default function AsyncAwaitPage() {
  const topic = getTopic("python", "async-await");
  if (!topic) notFound();
  return (
    <TopicContent
      title={content.title}
      sections={content.sections}
      starterCode={content.starterCode}
    />
  );
}
