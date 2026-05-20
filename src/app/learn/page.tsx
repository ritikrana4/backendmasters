import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import { courses } from "@/lib/courses";

export const metadata: Metadata = {
  title: "Learn",
  description:
    "A structured fullstack learning path — from Python to AI Engineering, one course at a time.",
};

// Explicit timeline order: foundation → web → data → backend → frontend → architecture → infra → algorithms → ai
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
  python:        "#3b82f6",
  http:          "#22d3ee",
  sql:           "#a78bfa",
  backend:       "#34d399",
  frontend:      "#f0db4f",
  "system-design": "#fb923c",
  "cloud-devops":  "#38bdf8",
  dsa:           "#c084fc",
  ai:            "#f472b6",
};

export default function LearnPage() {
  const courseMap = Object.fromEntries(courses.map((c) => [c.slug, c]));
  const orderedCourses = LEARNING_PATH.map((slug) => courseMap[slug]).filter(Boolean);

  return (
    <>
      <Header />
      <main
        style={{
          paddingTop: "var(--header-height)",
          minHeight: "100vh",
          background: "#0d1117",
          padding: "calc(var(--header-height) + 48px) 24px 80px",
        }}
      >
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <h1
            style={{
              fontSize: "1.75rem",
              fontWeight: 700,
              color: "#e6edf3",
              margin: "0 0 8px",
              letterSpacing: "-0.02em",
            }}
          >
            Learning Path
          </h1>
          <p
            style={{
              color: "#8b949e",
              fontSize: "0.9375rem",
              margin: "0 0 48px",
              lineHeight: 1.6,
            }}
          >
            A structured path from Python fundamentals to AI Engineering. Work through each course in order or jump to what you need.
          </p>

          <div style={{ position: "relative" }}>
            {orderedCourses.map((course, i) => {
              const accent = ACCENT_COLORS[course.slug] ?? "#58a6ff";
              const isLast = i === orderedCourses.length - 1;

              const cardInner = (
                <div
                  style={{
                    background: "#161b22",
                    border: `1px solid ${course.disabled ? "#21262d" : "#30363d"}`,
                    borderLeft: `3px solid ${course.disabled ? "#30363d" : accent}`,
                    borderRadius: "0 10px 10px 0",
                    padding: "18px 20px",
                    opacity: course.disabled ? 0.5 : 1,
                    cursor: course.disabled ? "not-allowed" : "pointer",
                    transition: "border-color 0.15s, background 0.15s",
                    flex: 1,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
                    <span style={{ fontSize: "1.5rem", lineHeight: 1, flexShrink: 0, marginTop: 1 }}>
                      {course.icon}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: 4, flexWrap: "wrap" }}>
                        <h2
                          style={{
                            fontSize: "1rem",
                            fontWeight: 600,
                            color: "#e6edf3",
                            margin: 0,
                          }}
                        >
                          {course.name}
                        </h2>
                        {course.disabled && (
                          <span
                            style={{
                              fontSize: "0.6875rem",
                              color: "#6e7681",
                              background: "#21262d",
                              border: "1px solid #30363d",
                              borderRadius: 4,
                              padding: "1px 6px",
                            }}
                          >
                            Coming soon
                          </span>
                        )}
                      </div>
                      <p
                        style={{
                          fontSize: "0.875rem",
                          color: "#8b949e",
                          lineHeight: 1.6,
                          margin: "0 0 10px",
                        }}
                      >
                        {course.description}
                      </p>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <span style={{ fontSize: "0.75rem", color: "#6e7681" }}>
                          {course.topics.length} topics
                        </span>
                        {!course.disabled && (
                          <span style={{ fontSize: "0.75rem", fontWeight: 600, color: accent }}>
                            Start →
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );

              return (
                <div
                  key={course.slug}
                  style={{ display: "flex", alignItems: "stretch", gap: "16px", marginBottom: isLast ? 0 : 0 }}
                >
                  {/* Timeline spine */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      flexShrink: 0,
                      width: 36,
                    }}
                  >
                    {/* Step number badge */}
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        background: course.disabled ? "#21262d" : `${accent}18`,
                        border: `2px solid ${course.disabled ? "#30363d" : accent}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        color: course.disabled ? "#6e7681" : accent,
                        flexShrink: 0,
                        zIndex: 1,
                      }}
                    >
                      {i + 1}
                    </div>
                    {/* Connecting line */}
                    {!isLast && (
                      <div
                        style={{
                          width: 2,
                          flex: 1,
                          minHeight: 20,
                          background: "#21262d",
                          margin: "4px 0",
                        }}
                      />
                    )}
                  </div>

                  {/* Card */}
                  <div style={{ flex: 1, paddingBottom: isLast ? 0 : 16 }}>
                    {course.disabled ? (
                      cardInner
                    ) : (
                      <Link
                        href={`/learn/${course.slug}`}
                        style={{ textDecoration: "none", display: "block" }}
                      >
                        {cardInner}
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </>
  );
}
