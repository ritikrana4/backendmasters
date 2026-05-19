"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Course, Topic } from "@/lib/courses";
import { useProgress, type ProgressStatus } from "@/hooks/useProgress";

interface SidebarProps {
  courses: Course[];
  activeCourse?: string;
}

export default function Sidebar({ courses, activeCourse }: SidebarProps) {
  const pathname = usePathname();
  const { getStatus } = useProgress();

  return (
    <aside
      style={{
        position: "fixed",
        top: "var(--header-height)",
        left: 0,
        bottom: 0,
        width: "var(--sidebar-width)",
        background: "#0d1117",
        borderRight: "1px solid #21262d",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        zIndex: 50,
      }}
    >
      {/* Course selector */}
      <div
        style={{
          padding: "16px 12px 8px",
          borderBottom: "1px solid #21262d",
        }}
      >
        <p
          style={{
            fontSize: "0.6875rem",
            fontWeight: 600,
            color: "#8b949e",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            margin: "0 0 8px 8px",
          }}
        >
          Courses
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          {courses.map((course) => (
            <CourseTab
              key={course.slug}
              course={course}
              active={activeCourse === course.slug}
            />
          ))}
        </div>
      </div>

      {/* Topics list */}
      <div
        className="sidebar-scroll"
        style={{ flex: 1, overflowY: "auto", padding: "12px 12px 24px" }}
      >
        {courses.map((course) => {
          if (activeCourse !== course.slug || course.disabled) return null;
          return (
            <div key={course.slug}>
              <p
                style={{
                  fontSize: "0.6875rem",
                  fontWeight: 600,
                  color: "#8b949e",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  margin: "4px 0 8px 8px",
                }}
              >
                Topics
              </p>
              {course.topics.map((topic, idx) => (
                <TopicLink
                  key={topic.slug}
                  topic={topic}
                  courseSlug={course.slug}
                  index={idx + 1}
                  active={pathname === `/learn/${course.slug}/${topic.slug}`}
                  status={getStatus(course.slug, topic.slug)}
                />
              ))}
            </div>
          );
        })}
      </div>
    </aside>
  );
}

function CourseTab({
  course,
  active,
}: {
  course: Course;
  active: boolean;
}) {
  const inner = (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "8px 10px",
        borderRadius: 6,
        cursor: course.disabled ? "not-allowed" : "pointer",
        background: active ? "#161b22" : "transparent",
        border: active ? "1px solid #30363d" : "1px solid transparent",
        opacity: course.disabled ? 0.45 : 1,
        transition: "background 0.15s, border-color 0.15s",
      }}
    >
      <span style={{ fontSize: "1.1rem", lineHeight: 1 }}>{course.icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: "0.8125rem",
            fontWeight: 500,
            color: active ? "#e6edf3" : "#cdd9e5",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {course.name}
        </div>
        {course.disabled && (
          <div style={{ fontSize: "0.6875rem", color: "#6e7681", marginTop: 1 }}>
            Coming soon
          </div>
        )}
      </div>
    </div>
  );

  if (course.disabled) return <div>{inner}</div>;

  return (
    <Link
      href={`/learn/${course.slug}`}
      style={{ textDecoration: "none", display: "block" }}
    >
      {inner}
    </Link>
  );
}

const STATUS_DOT: Record<ProgressStatus, { symbol: string; color: string } | null> = {
  "not-started": null,
  "in-progress": { symbol: "◑", color: "#e3b341" },
  completed:     { symbol: "✓", color: "#3fb950" },
};

function TopicLink({
  topic,
  courseSlug,
  index,
  active,
  status,
}: {
  topic: Topic;
  courseSlug: string;
  index: number;
  active: boolean;
  status: ProgressStatus;
}) {
  const dot = STATUS_DOT[status];

  return (
    <Link
      href={`/learn/${courseSlug}/${topic.slug}`}
      style={{ textDecoration: "none", display: "block", marginBottom: "2px" }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "7px 10px",
          borderRadius: 6,
          background: active ? "#1f2937" : "transparent",
          borderLeft: active ? "2px solid #238636" : "2px solid transparent",
          transition: "background 0.15s",
        }}
      >
        <span
          style={{
            fontSize: "0.6875rem",
            fontWeight: 600,
            color: active ? "#238636" : "#6e7681",
            width: 18,
            textAlign: "center",
            flexShrink: 0,
          }}
        >
          {String(index).padStart(2, "0")}
        </span>
        <span
          style={{
            fontSize: "0.8125rem",
            color: active ? "#e6edf3" : "#8b949e",
            fontWeight: active ? 500 : 400,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            flex: 1,
          }}
        >
          {topic.title}
        </span>
        {dot && (
          <span
            style={{
              fontSize: "0.75rem",
              color: dot.color,
              flexShrink: 0,
              lineHeight: 1,
            }}
          >
            {dot.symbol}
          </span>
        )}
      </div>
    </Link>
  );
}
