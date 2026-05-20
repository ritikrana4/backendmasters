import type { Metadata } from "next";
import Header from "@/components/Header";
import { courses } from "@/lib/courses";
import LearnTimeline from "@/components/LearnTimeline";

export const metadata: Metadata = {
  title: "Learn",
  description:
    "A structured fullstack learning path — from Python to AI Engineering, one course at a time.",
};

export default function LearnPage() {
  return (
    <>
      <Header />
      <main
        style={{
          minHeight: "100vh",
          background: "#0d1117",
          padding: "calc(var(--header-height) + 48px) 24px 80px",
        }}
      >
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
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

          <LearnTimeline courses={courses} />
        </div>
      </main>
    </>
  );
}
