import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "Fullstack Masters — Learn to Code",
  description:
    "Structured fullstack courses with interactive exercises. Learn Python, SQL, Backend, Frontend, and more — step by step.",
};

export default function HomePage() {
  return (
    <>
      <Header />
      <main
        style={{
          paddingTop: "var(--header-height)",
          minHeight: "100vh",
          background: "#0d1117",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "calc(var(--header-height) + 48px) 24px 64px",
        }}
      >
        <div style={{ maxWidth: 640, textAlign: "center" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "rgba(35,134,54,0.12)",
              border: "1px solid rgba(35,134,54,0.35)",
              borderRadius: 20,
              padding: "4px 14px",
              fontSize: "0.75rem",
              fontWeight: 600,
              color: "#3fb950",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              marginBottom: 24,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#3fb950",
                display: "inline-block",
              }}
            />
            Beta
          </div>
          <h1
            style={{
              fontSize: "clamp(2rem, 5vw, 3.25rem)",
              fontWeight: 800,
              color: "#e6edf3",
              margin: "0 0 20px",
              lineHeight: 1.15,
              letterSpacing: "-0.03em",
            }}
          >
            Learn to code.
            <br />
            <span
              style={{
                background: "linear-gradient(90deg, #238636, #58a6ff)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Build real skills.
            </span>
          </h1>
          <p
            style={{
              fontSize: "1.0625rem",
              color: "#8b949e",
              lineHeight: 1.7,
              margin: "0 0 36px",
            }}
          >
            Interactive programming courses with hands-on exercises — run code
            right in your browser, no setup required.
          </p>
          <Link
            href="/learn"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "#238636",
              color: "#fff",
              textDecoration: "none",
              padding: "12px 28px",
              borderRadius: 8,
              fontWeight: 600,
              fontSize: "0.9375rem",
              transition: "background 0.15s",
            }}
          >
            Start Learning
            <svg
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M6.22 3.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L9.94 8 6.22 4.28a.75.75 0 0 1 0-1.06Z"
              />
            </svg>
          </Link>
        </div>
      </main>
    </>
  );
}
