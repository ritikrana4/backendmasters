"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { Course, Topic } from "@/lib/courses";
import { useProgress, type ProgressStatus } from "@/hooks/useProgress";
import { sidebarStore } from "@/lib/sidebarStore";

interface SidebarProps {
  courses: Course[];
  activeCourse?: string;
}

export default function Sidebar({ courses, activeCourse }: SidebarProps) {
  const pathname = usePathname();
  const { getStatus } = useProgress();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    return sidebarStore.subscribe(setIsOpen);
  }, []);

  // Close sidebar when navigating (mobile)
  useEffect(() => {
    sidebarStore.close();
  }, [pathname]);

  const activeCourseData = courses.find((c) => c.slug === activeCourse);

  return (
    <>
      {/* Backdrop — mobile only */}
      <div
        className={`sidebar-backdrop${isOpen ? " backdrop-visible" : ""}`}
        onClick={() => sidebarStore.close()}
      />

      <aside
        className={`sidebar${isOpen ? " sidebar-open" : ""}`}
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
        {/* Course name header */}
        <div
          style={{
            padding: "14px 14px 14px 16px",
            borderBottom: "1px solid #21262d",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            flexShrink: 0,
          }}
        >
          {activeCourseData && (
            <>
              <span style={{ fontSize: "1.25rem", lineHeight: 1, flexShrink: 0 }}>
                {activeCourseData.icon}
              </span>
              <span
                style={{
                  fontSize: "0.9375rem",
                  fontWeight: 600,
                  color: "#e6edf3",
                  flex: 1,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {activeCourseData.name}
              </span>
            </>
          )}

          {/* Close button — mobile only */}
          <button
            className="md:hidden"
            onClick={() => sidebarStore.close()}
            aria-label="Close sidebar"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px",
              color: "#8b949e",
              flexShrink: 0,
              lineHeight: 0,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.75.75 0 1 1 1.06 1.06L9.06 8l3.22 3.22a.75.75 0 1 1-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 0 1-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06z" />
            </svg>
          </button>
        </div>

        {/* Topics list */}
        <div
          className="sidebar-scroll"
          style={{ flex: 1, overflowY: "auto", padding: "12px 12px 24px" }}
        >
          {activeCourseData && !activeCourseData.disabled && (
            <div>
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
              {activeCourseData.topics.map((topic, idx) =>
                topic.subtopics && topic.subtopics.length > 0 ? (
                  <TopicGroup
                    key={topic.slug}
                    topic={topic}
                    courseSlug={activeCourseData.slug}
                    index={idx + 1}
                    pathname={pathname}
                  />
                ) : (
                  <TopicLink
                    key={topic.slug}
                    topic={topic}
                    courseSlug={activeCourseData.slug}
                    index={idx + 1}
                    active={pathname === `/learn/${activeCourseData.slug}/${topic.slug}`}
                    status={getStatus(activeCourseData.slug, topic.slug)}
                  />
                )
              )}
            </div>
          )}
        </div>
      </aside>
    </>
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
          <span style={{ fontSize: "0.75rem", color: dot.color, flexShrink: 0, lineHeight: 1 }}>
            {dot.symbol}
          </span>
        )}
      </div>
    </Link>
  );
}

function TopicGroup({
  topic,
  courseSlug,
  index,
  pathname,
}: {
  topic: Topic;
  courseSlug: string;
  index: number;
  pathname: string;
}) {
  const isInGroup = pathname.startsWith(`/learn/${courseSlug}/${topic.slug}/`);
  const [expanded, setExpanded] = useState(isInGroup);

  useEffect(() => {
    if (isInGroup) setExpanded(true);
  }, [isInGroup]);

  return (
    <div style={{ marginBottom: "2px" }}>
      <button
        onClick={() => setExpanded((v) => !v)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "7px 10px",
          borderRadius: 6,
          background: isInGroup ? "#161b22" : "transparent",
          border: "none",
          borderLeft: isInGroup ? "2px solid #0ea5e9" : "2px solid transparent",
          cursor: "pointer",
          transition: "background 0.15s",
          textAlign: "left",
        }}
      >
        <span
          style={{
            fontSize: "0.6875rem",
            fontWeight: 600,
            color: isInGroup ? "#0ea5e9" : "#6e7681",
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
            color: isInGroup ? "#e6edf3" : "#8b949e",
            fontWeight: isInGroup ? 500 : 400,
            flex: 1,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {topic.title}
        </span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 16 16"
          fill="currentColor"
          style={{
            color: "#6e7681",
            flexShrink: 0,
            transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
            transition: "transform 0.15s",
          }}
        >
          <path d="M6.22 3.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.749.749 0 0 1-1.06-1.06L9.94 8 6.22 4.28a.75.75 0 0 1 0-1.06Z" />
        </svg>
      </button>

      {expanded && topic.subtopics && (
        <div
          style={{
            marginLeft: "28px",
            borderLeft: "1px solid #21262d",
            paddingLeft: "8px",
            marginBottom: "4px",
          }}
        >
          {topic.subtopics.map((sub, si) => {
            const href = `/learn/${courseSlug}/${topic.slug}/${sub.slug}`;
            const active = pathname === href;
            return (
              <Link
                key={sub.slug}
                href={href}
                style={{ textDecoration: "none", display: "block", marginBottom: "1px" }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "6px 8px",
                    borderRadius: 5,
                    background: active ? "#1f2937" : "transparent",
                    borderLeft: active ? "2px solid #0ea5e9" : "2px solid transparent",
                    transition: "background 0.15s",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.625rem",
                      fontWeight: 600,
                      color: active ? "#0ea5e9" : "#4b5563",
                      width: 14,
                      textAlign: "center",
                      flexShrink: 0,
                    }}
                  >
                    {String(si + 1).padStart(2, "0")}
                  </span>
                  <span
                    style={{
                      fontSize: "0.8125rem",
                      color: active ? "#e6edf3" : "#6e7681",
                      fontWeight: active ? 500 : 400,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {sub.title}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
