import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSubtopic, getTopic } from "@/lib/courses";
import QuestionContent from "@/components/QuestionContent";

import { content as factorial } from "@/content/dsa/recursion/factorial";
import { content as fibonacci } from "@/content/dsa/recursion/fibonacci";

type ContentMap = Record<string, typeof factorial>;

const contentMap: ContentMap = {
  factorial,
  fibonacci,
};

export async function generateStaticParams() {
  const topic = getTopic("dsa", "recursion");
  return (topic?.subtopics ?? []).map((s) => ({ question: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ question: string }>;
}): Promise<Metadata> {
  const { question } = await params;
  const sub = getSubtopic("dsa", "recursion", question);
  if (!sub) return {};
  return {
    title: sub.title,
    description: sub.description,
    keywords: ["recursion", question, "dsa", "algorithms", "call stack", "interview"],
  };
}

export default async function RecursionQuestionPage({
  params,
}: {
  params: Promise<{ question: string }>;
}) {
  const { question } = await params;
  const questionContent = contentMap[question];
  if (!questionContent) notFound();

  const topic = getTopic("dsa", "recursion");
  const subtopics = topic?.subtopics ?? [];
  const currentIndex = subtopics.findIndex((s) => s.slug === question);

  const prevSub = currentIndex > 0 ? subtopics[currentIndex - 1] : undefined;
  const nextSub = currentIndex < subtopics.length - 1 ? subtopics[currentIndex + 1] : undefined;

  return (
    <QuestionContent
      data={questionContent}
      questionNumber={currentIndex + 1}
      totalQuestions={subtopics.length}
      prev={prevSub ? { href: `/learn/dsa/recursion/${prevSub.slug}`, label: prevSub.title } : undefined}
      next={nextSub ? { href: `/learn/dsa/recursion/${nextSub.slug}`, label: nextSub.title } : undefined}
      accentColor="#a371f7"
    />
  );
}
