"use client";

import { usePathname } from "next/navigation";
import { useProgress, type ProgressStatus } from "@/hooks/useProgress";

const CYCLE: ProgressStatus[] = ["not-started", "in-progress", "completed"];

const CONFIG: Record<
  ProgressStatus,
  { label: string; icon: string; color: string; bg: string; border: string }
> = {
  "not-started": {
    label: "Not started",
    icon: "○",
    color: "#6e7681",
    bg: "transparent",
    border: "#30363d",
  },
  "in-progress": {
    label: "In progress",
    icon: "◑",
    color: "#e3b341",
    bg: "rgba(227,179,65,0.1)",
    border: "rgba(227,179,65,0.4)",
  },
  completed: {
    label: "Completed",
    icon: "✓",
    color: "#3fb950",
    bg: "rgba(63,185,80,0.1)",
    border: "rgba(63,185,80,0.4)",
  },
};

export default function TopicProgressButton() {
  const pathname = usePathname();
  const { setStatus, getStatus } = useProgress();

  // Extract courseSlug and topicSlug from /learn/[course]/[topic]
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length < 3 || parts[0] !== "learn") return null;
  const courseSlug = parts[1];
  const topicSlug = parts[2];

  const current = getStatus(courseSlug, topicSlug);
  const cfg = CONFIG[current];

  function handleClick() {
    const next = CYCLE[(CYCLE.indexOf(current) + 1) % CYCLE.length];
    setStatus(courseSlug, topicSlug, next);
  }

  return (
    <button
      onClick={handleClick}
      title="Click to update progress"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "5px 12px",
        borderRadius: 20,
        border: `1px solid ${cfg.border}`,
        background: cfg.bg,
        color: cfg.color,
        fontSize: "0.8125rem",
        fontWeight: 500,
        cursor: "pointer",
        transition: "all 0.15s",
        marginBottom: "24px",
        fontFamily: "inherit",
      }}
    >
      <span style={{ fontSize: "0.875rem" }}>{cfg.icon}</span>
      {cfg.label}
    </button>
  );
}
