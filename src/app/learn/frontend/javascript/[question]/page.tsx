import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSubtopic, getTopic } from "@/lib/courses";
import FrontendQuestionContent from "@/components/FrontendQuestionContent";

import { content as eventLoop } from "@/content/frontend/javascript/event-loop";
import { content as closures } from "@/content/frontend/javascript/closures";
import { content as varLetConst } from "@/content/frontend/javascript/var-let-const";
import { content as hoisting } from "@/content/frontend/javascript/hoisting";
import { content as thisKeyword } from "@/content/frontend/javascript/this-keyword";
import { content as promises } from "@/content/frontend/javascript/promises";
import { content as prototypes } from "@/content/frontend/javascript/prototypes";
import { content as currying } from "@/content/frontend/javascript/currying";
import type { FrontendQuestionData } from "@/components/FrontendQuestionContent";

const contentMap: Record<string, FrontendQuestionData> = {
  "event-loop": eventLoop,
  closures,
  "var-let-const": varLetConst,
  hoisting,
  "this-keyword": thisKeyword,
  promises,
  prototypes,
  currying,
};

export async function generateStaticParams() {
  const topic = getTopic("frontend", "javascript");
  return (topic?.subtopics ?? []).map((s) => ({ question: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ question: string }>;
}): Promise<Metadata> {
  const { question } = await params;
  const sub = getSubtopic("frontend", "javascript", question);
  if (!sub) return {};
  return {
    title: sub.title,
    description: sub.description,
    keywords: ["javascript", question, "frontend", "interview", "js"],
  };
}

export default async function JavaScriptQuestionPage({
  params,
}: {
  params: Promise<{ question: string }>;
}) {
  const { question } = await params;
  const questionContent = contentMap[question];
  if (!questionContent) notFound();

  const topic = getTopic("frontend", "javascript");
  const subtopics = topic?.subtopics ?? [];
  const currentIndex = subtopics.findIndex((s) => s.slug === question);

  const prevSub = currentIndex > 0 ? subtopics[currentIndex - 1] : undefined;
  const nextSub = currentIndex < subtopics.length - 1 ? subtopics[currentIndex + 1] : undefined;

  return (
    <FrontendQuestionContent
      data={questionContent}
      questionNumber={currentIndex + 1}
      totalQuestions={subtopics.length}
      prev={prevSub ? { href: `/learn/frontend/javascript/${prevSub.slug}`, label: prevSub.title } : undefined}
      next={nextSub ? { href: `/learn/frontend/javascript/${nextSub.slug}`, label: nextSub.title } : undefined}
      accentColor="#f0db4f"
    />
  );
}
