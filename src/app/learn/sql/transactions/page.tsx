import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/courses";
import { content } from "@/content/sql/transactions";
import TopicContent from "@/components/TopicContent";

export const metadata: Metadata = {
  title: "Transactions & ACID",
  description:
    "Understand database transactions and ACID properties: atomicity, consistency, isolation, durability. Covers isolation levels, dirty reads, deadlocks, and SAVEPOINTs.",
  keywords: ["database transactions", "acid properties", "isolation levels", "sql deadlock", "database consistency"],
};

export default function TransactionsPage() {
  const topic = getTopic("sql", "transactions");
  if (!topic) notFound();
  return <TopicContent title={content.title} sections={content.sections} accentColor="#f79e1a" />;
}
