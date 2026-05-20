"use client";

import { useState } from "react";
import Link from "next/link";
import type { Course } from "@/lib/courses";
import { useProgress } from "@/hooks/useProgress";
import { useStudyPlan, getLessonUnits } from "@/hooks/useStudyPlan";
import dynamic from "next/dynamic";

const StudyPlanModal = dynamic(() => import("@/components/StudyPlanModal"), { ssr: false });

const LEARNING_PATH = [
  "python",
  "http",
  "sql",
  "backend",
  "frontend",
  "system-design",
  "cloud-devops",
  "dsa",
  "ai",
];

const ACCENT_COLORS: Record<string, string> = {
  python:          "#3b82f6",
  http:            "#22d3ee",
  sql:             "#a78bfa",
  backend:         "#34d399",
  frontend:        "#f0db4f",
  "system-design": "#fb923c",
  "cloud-devops":  "#38bdf8",
  dsa:             "#c084fc",
  ai:              "#f472b6",
};

interface Props {
  courses: Course[];
}

export default function LearnTimeline({ courses }: Props) {
  const { getStatus } = useProgress();
  const { getPlan } = useStudyPlan();
  const [planCourse, setPlanCourse] = useState<Course | null>(null);

  const courseMap = Object.fromEntries(courses.map((c) => [c.slug, c]));
  const orderedCourses = LEARNING_PATH.map((slug) => courseMap[slug]).filter(Boolean);

  return (
    <>
      <div style={{ position: "relative" }}>
        {orderedCourses.map((course, i) => {
          const accent = ACCENT_COLORS[course.slug] ?? "#58a6ff";
          const isLast = i === orderedCourses.length - 1;
          const plan = getPlan(course.slug);

          // Progress: plan completion takes priority; fall back to useProgress for topic-based courses
          const units = getLessonUnits(course);
          const totalUnits = units.length;
          let completedUnits = 0;

          if (plan) {
            completedUnits = plan.completed.length;
          } else {
            // Count via useProgress (works for courses without subtopics)
            completedUnits = course.topics.filter((t) =>
              !t.subtopics?.length && getStatus(course.slug, t.slug) === "completed"
            ).length;
          }

          const progressPct = totalUnits > 0 ? Math.round((completedUnits / totalUnits) * 100) : 0;
          const hasPlan = !!plan;

          const cardContent = (
            <div
              style={{
                background: "#161b22",
                border: `1px solid ${course.disabled ? "#21262d" : "#30363d"}`,
                borderLeft: `3px solid ${course.disabled ? "#30363d" : accent}`,
                borderRadius: "0 10px 10px 0",
                padding: "16px 18px",
                opacity: course.disabled ? 0.5 : 1,
                transition: "border-color 0.15s, background 0.15s",
                flex: 1,
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <span style={{ fontSize: "1.5rem", lineHeight: 1, flexShrink: 0, marginTop: 1 }}>
                  {course.icon}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
                    <h2 style={{ fontSize: "1rem", fontWeight: 600, color: "#e6edf3", margin: 0 }}>
                      {course.name}
                    </h2>
                    {course.disabled && (
                      <span style={{ fontSize: "0.6875rem", color: "#6e7681", background: "#21262d", border: "1px solid #30363d", borderRadius: 4, padding: "1px 6px" }}>
                        Coming soon
                      </span>
                    )}
                    {hasPlan && (
                      <span style={{ fontSize: "0.6875rem", color: "#3fb950", background: "#3fb95018", border: "1px solid #3fb95030", borderRadius: 4, padding: "1px 6px" }}>
                        📅 Plan active
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: "0.875rem", color: "#8b949e", lineHeight: 1.6, margin: "0 0 12px" }}>
                    {course.description}
                  </p>

                  {/* Progress row */}
                  {!course.disabled && (
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                        <span style={{ fontSize: "0.75rem", color: "#6e7681" }}>
                          {completedUnits} / {totalUnits} {plan ? "done" : "topics"}
                        </span>
                        <span style={{ fontSize: "0.75rem", color: progressPct > 0 ? accent : "#484f58", fontWeight: 600 }}>
                          {progressPct > 0 ? `${progressPct}%` : "Not started"}
                        </span>
                      </div>
                      <div style={{ background: "#21262d", borderRadius: 3, height: 4, overflow: "hidden" }}>
                        <div
                          style={{
                            width: `${progressPct}%`,
                            height: "100%",
                            background: `linear-gradient(90deg, ${accent}cc, ${accent})`,
                            borderRadius: 3,
                            transition: "width 0.4s",
                            minWidth: progressPct > 0 ? 4 : 0,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Action row */}
                  {!course.disabled && (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: "0.75rem", fontWeight: 600, color: accent }}>
                        {progressPct === 100 ? "Completed ✓" : progressPct > 0 ? "Continue →" : "Start →"}
                      </span>
                      <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setPlanCourse(course); }}
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: 500,
                          padding: "4px 10px",
                          borderRadius: 5,
                          border: `1px solid ${hasPlan ? "#3fb95050" : "#30363d"}`,
                          background: hasPlan ? "#3fb95012" : "#0d1117",
                          color: hasPlan ? "#3fb950" : "#8b949e",
                          cursor: "pointer",
                          transition: "all 0.15s",
                        }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = hasPlan ? "#3fb950" : "#58a6ff"; (e.currentTarget as HTMLButtonElement).style.color = hasPlan ? "#3fb950" : "#58a6ff"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = hasPlan ? "#3fb95050" : "#30363d"; (e.currentTarget as HTMLButtonElement).style.color = hasPlan ? "#3fb950" : "#8b949e"; }}
                      >
                        📅 {hasPlan ? "View Plan" : "Plan"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );

          return (
            <div
              key={course.slug}
              style={{ display: "flex", alignItems: "stretch", gap: 16 }}
            >
              {/* Timeline spine */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0, width: 36 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: progressPct === 100 ? `${accent}30` : course.disabled ? "#21262d" : `${accent}18`,
                    border: `2px solid ${progressPct === 100 ? accent : course.disabled ? "#30363d" : `${accent}80`}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    color: progressPct === 100 ? accent : course.disabled ? "#6e7681" : `${accent}cc`,
                    flexShrink: 0,
                    zIndex: 1,
                  }}
                >
                  {progressPct === 100 ? "✓" : i + 1}
                </div>
                {!isLast && (
                  <div style={{ width: 2, flex: 1, minHeight: 20, background: "#21262d", margin: "4px 0" }} />
                )}
              </div>

              {/* Card */}
              <div style={{ flex: 1, paddingBottom: isLast ? 0 : 16 }}>
                {course.disabled ? (
                  cardContent
                ) : (
                  <Link href={`/learn/${course.slug}`} style={{ textDecoration: "none", display: "block" }}>
                    {cardContent}
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {planCourse && (
        <StudyPlanModal course={planCourse} onClose={() => setPlanCourse(null)} />
      )}
    </>
  );
}
