import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSubtopic, getTopic } from "@/lib/courses";
import FrontendQuestionContent from "@/components/FrontendQuestionContent";

import { content as virtualDom } from "@/content/frontend/react/virtual-dom";
import { content as useState } from "@/content/frontend/react/use-state";
import { content as useEffect } from "@/content/frontend/react/use-effect";
import { content as useMemoCallback } from "@/content/frontend/react/use-memo-callback";
import { content as keys } from "@/content/frontend/react/keys";
import { content as contextApi } from "@/content/frontend/react/context-api";
import { content as customHooks } from "@/content/frontend/react/custom-hooks";
import { content as controlledComponents } from "@/content/frontend/react/controlled-components";
import type { FrontendQuestionData } from "@/components/FrontendQuestionContent";

const contentMap: Record<string, FrontendQuestionData> = {
  "virtual-dom": virtualDom,
  "use-state": useState,
  "use-effect": useEffect,
  "use-memo-callback": useMemoCallback,
  keys,
  "context-api": contextApi,
  "custom-hooks": customHooks,
  "controlled-components": controlledComponents,
};

export async function generateStaticParams() {
  const topic = getTopic("frontend", "react");
  return (topic?.subtopics ?? []).map((s) => ({ question: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ question: string }>;
}): Promise<Metadata> {
  const { question } = await params;
  const sub = getSubtopic("frontend", "react", question);
  if (!sub) return {};
  return {
    title: sub.title,
    description: sub.description,
    keywords: ["react", question, "frontend", "interview", "hooks"],
  };
}

export default async function ReactQuestionPage({
  params,
}: {
  params: Promise<{ question: string }>;
}) {
  const { question } = await params;
  const questionContent = contentMap[question];
  if (!questionContent) notFound();

  const topic = getTopic("frontend", "react");
  const subtopics = topic?.subtopics ?? [];
  const currentIndex = subtopics.findIndex((s) => s.slug === question);

  const prevSub = currentIndex > 0 ? subtopics[currentIndex - 1] : undefined;
  const nextSub = currentIndex < subtopics.length - 1 ? subtopics[currentIndex + 1] : undefined;

  return (
    <FrontendQuestionContent
      data={questionContent}
      questionNumber={currentIndex + 1}
      totalQuestions={subtopics.length}
      prev={prevSub ? { href: `/learn/frontend/react/${prevSub.slug}`, label: prevSub.title } : undefined}
      next={nextSub ? { href: `/learn/frontend/react/${nextSub.slug}`, label: nextSub.title } : undefined}
      accentColor="#61dafb"
    />
  );
}
