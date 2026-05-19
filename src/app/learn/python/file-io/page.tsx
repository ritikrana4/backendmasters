import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/courses";
import { content } from "@/content/python/file-io";
import TopicContent from "@/components/TopicContent";

export const metadata: Metadata = {
  title: "File I/O — Python",
  description:
    "Read and write files in Python using open(), the with statement, and the csv and json modules. Includes interactive browser exercises.",
  keywords: ["python file io", "python open file", "python read write file", "python csv", "python json file"],
};

export default function FileIOPage() {
  const topic = getTopic("python", "file-io");
  if (!topic) notFound();
  return (
    <TopicContent
      title={content.title}
      sections={content.sections}
      starterCode={content.starterCode}
    />
  );
}
