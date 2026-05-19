import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import { courses } from "@/lib/courses";

export const metadata: Metadata = {
  title: "Learn",
  description:
    "Choose a programming language and start learning with interactive exercises.",
};

export default function LearnPage() {
  return (
    <>
      <Header />
      <main
        style={{
          paddingTop: "var(--header-height)",
          minHeight: "100vh",
          background: "#0d1117",
          padding: "calc(var(--header-height) + 48px) 24px 64px",
        }}
      >
        <div style={{ maxWidth: 880, margin: "0 auto" }}>
          <h1
            style={{
              fontSize: "1.75rem",
              fontWeight: 700,
              color: "#e6edf3",
              margin: "0 0 8px",
              letterSpacing: "-0.02em",
            }}
          >
            Choose a Course
          </h1>
          <p
            style={{
              color: "#8b949e",
              fontSize: "0.9375rem",
              margin: "0 0 40px",
              lineHeight: 1.6,
            }}
          >
            Start from the basics and work your way up with interactive
            exercises.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "16px",
            }}
          >
            {courses.map((course) => {
              const card = (
                <div
                  style={{
                    background: "#161b22",
                    border: `1px solid ${course.disabled ? "#21262d" : "#30363d"}`,
                    borderRadius: 12,
                    padding: "24px",
                    opacity: course.disabled ? 0.55 : 1,
                    cursor: course.disabled ? "not-allowed" : "pointer",
                    transition: "border-color 0.15s, transform 0.15s",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      fontSize: "2rem",
                      marginBottom: 14,
                      lineHeight: 1,
                    }}
                  >
                    {course.icon}
                  </div>
                  <h2
                    style={{
                      fontSize: "1.0625rem",
                      fontWeight: 600,
                      color: "#e6edf3",
                      margin: "0 0 8px",
                    }}
                  >
                    {course.name}
                  </h2>
                  <p
                    style={{
                      fontSize: "0.875rem",
                      color: "#8b949e",
                      lineHeight: 1.6,
                      margin: "0 0 16px",
                    }}
                  >
                    {course.description}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.75rem",
                        color: "#6e7681",
                      }}
                    >
                      {course.disabled
                        ? "Coming soon"
                        : `${course.topics.length} topics`}
                    </span>
                    {!course.disabled && (
                      <span
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          color: "#3fb950",
                        }}
                      >
                        Start →
                      </span>
                    )}
                  </div>
                </div>
              );

              if (course.disabled) return <div key={course.slug}>{card}</div>;

              return (
                <Link
                  key={course.slug}
                  href={`/learn/${course.slug}`}
                  style={{ textDecoration: "none" }}
                >
                  {card}
                </Link>
              );
            })}
          </div>
        </div>
      </main>
    </>
  );
}
