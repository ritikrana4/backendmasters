import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/courses";
import { content } from "@/content/python/slots-and-memory";
import TopicContent from "@/components/TopicContent";

export const metadata: Metadata = {
  title: "Slots & Memory — Python",
  description:
    "Optimise Python memory usage with __slots__, compare instance sizes using sys.getsizeof, and understand how Python stores object attributes.",
  keywords: ["python __slots__", "python memory optimisation", "python sys.getsizeof", "python slots", "python performance"],
};

export default function SlotsAndMemoryPage() {
  const topic = getTopic("python", "slots-and-memory");
  if (!topic) notFound();
  return (
    <TopicContent
      title={content.title}
      sections={content.sections}
      starterCode={content.starterCode}
    />
  );
}
