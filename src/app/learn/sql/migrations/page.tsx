import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTopic } from "@/lib/courses";
import { content } from "@/content/sql/migrations";
import TopicContent from "@/components/TopicContent";

export const metadata: Metadata = {
  title: "Database Migrations",
  description:
    "Learn database migrations: versioned schema changes, migration tools (Alembic, Prisma, Flyway), zero-downtime migration patterns, and safe column/index changes in production.",
  keywords: ["database migrations", "alembic migrations", "prisma migrate", "zero downtime migration", "schema migration"],
};

export default function MigrationsPage() {
  const topic = getTopic("sql", "migrations");
  if (!topic) notFound();
  return <TopicContent title={content.title} sections={content.sections} accentColor="#f79e1a" />;
}
