import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSubtopic, getTopic } from "@/lib/courses";
import TopicContent from "@/components/TopicContent";

import { content as iam } from "@/content/cloud-devops/aws/iam";
import { content as ec2 } from "@/content/cloud-devops/aws/ec2";
import { content as s3 } from "@/content/cloud-devops/aws/s3";
import { content as vpc } from "@/content/cloud-devops/aws/vpc";
import { content as rds } from "@/content/cloud-devops/aws/rds";
import { content as lambda } from "@/content/cloud-devops/aws/lambda";
import { content as ecs } from "@/content/cloud-devops/aws/ecs";
import { content as cloudwatch } from "@/content/cloud-devops/aws/cloudwatch";
import { content as sqsSns } from "@/content/cloud-devops/aws/sqs-sns";
import { content as cloudfront } from "@/content/cloud-devops/aws/cloudfront";

type ContentData = {
  title: string;
  sections: { heading: string; body: string; code?: string; items?: string[] }[];
};

const contentMap: Record<string, ContentData> = {
  iam,
  ec2,
  s3,
  vpc,
  rds,
  lambda,
  ecs,
  cloudwatch,
  "sqs-sns": sqsSns,
  cloudfront,
};

export async function generateStaticParams() {
  const topic = getTopic("cloud-devops", "aws");
  return (topic?.subtopics ?? []).map((s) => ({ subtopic: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ subtopic: string }>;
}): Promise<Metadata> {
  const { subtopic } = await params;
  const sub = getSubtopic("cloud-devops", "aws", subtopic);
  if (!sub) return {};
  return {
    title: sub.title,
    description: sub.description,
    keywords: ["aws", subtopic, "cloud", "devops", "amazon web services"],
  };
}

export default async function AWSSubtopicPage({
  params,
}: {
  params: Promise<{ subtopic: string }>;
}) {
  const { subtopic } = await params;
  const sub = getSubtopic("cloud-devops", "aws", subtopic);
  const topicContent = contentMap[subtopic];
  if (!sub || !topicContent) notFound();

  return (
    <TopicContent
      title={topicContent.title}
      sections={topicContent.sections}
      accentColor="#f59e0b"
    />
  );
}
