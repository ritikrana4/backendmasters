import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSubtopic, getTopic } from "@/lib/courses";
import FrontendQuestionContent from "@/components/FrontendQuestionContent";

import { content as debounce } from "@/content/frontend/machine-coding/debounce";
import { content as throttle } from "@/content/frontend/machine-coding/throttle";
import { content as promiseAll } from "@/content/frontend/machine-coding/promise-all";
import { content as eventEmitter } from "@/content/frontend/machine-coding/event-emitter";
import { content as flatten } from "@/content/frontend/machine-coding/flatten";
import { content as curry } from "@/content/frontend/machine-coding/curry";
import type { FrontendQuestionData } from "@/components/FrontendQuestionContent";

const contentMap: Record<string, FrontendQuestionData> = {
  debounce,
  throttle,
  "promise-all": promiseAll,
  "event-emitter": eventEmitter,
  flatten,
  curry,
};

export async function generateStaticParams() {
  const topic = getTopic("frontend", "machine-coding");
  return (topic?.subtopics ?? []).map((s) => ({ question: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ question: string }>;
}): Promise<Metadata> {
  const { question } = await params;
  const sub = getSubtopic("frontend", "machine-coding", question);
  if (!sub) return {};
  return {
    title: sub.title,
    description: sub.description,
    keywords: ["machine coding", question, "frontend", "interview", "javascript"],
  };
}

export default async function MachineCodingQuestionPage({
  params,
}: {
  params: Promise<{ question: string }>;
}) {
  const { question } = await params;
  const questionContent = contentMap[question];
  if (!questionContent) notFound();

  const topic = getTopic("frontend", "machine-coding");
  const subtopics = topic?.subtopics ?? [];
  const currentIndex = subtopics.findIndex((s) => s.slug === question);

  const prevSub = currentIndex > 0 ? subtopics[currentIndex - 1] : undefined;
  const nextSub = currentIndex < subtopics.length - 1 ? subtopics[currentIndex + 1] : undefined;

  return (
    <FrontendQuestionContent
      data={questionContent}
      questionNumber={currentIndex + 1}
      totalQuestions={subtopics.length}
      prev={prevSub ? { href: `/learn/frontend/machine-coding/${prevSub.slug}`, label: prevSub.title } : undefined}
      next={nextSub ? { href: `/learn/frontend/machine-coding/${nextSub.slug}`, label: nextSub.title } : undefined}
      accentColor="#a371f7"
    />
  );
}
