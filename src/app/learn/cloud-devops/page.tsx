import type { Metadata } from "next";
import Link from "next/link";
import { getCourse } from "@/lib/courses";

export const metadata: Metadata = {
  title: "Cloud & DevOps",
  description:
    "Containers, Kubernetes, CI/CD, Terraform, and cloud infrastructure. Everything needed to ship and operate backend systems reliably at scale.",
  keywords: ["docker", "kubernetes", "devops", "ci/cd", "terraform", "cloud", "aws", "infrastructure as code"],
};

export default function CloudDevOpsIndexPage() {
  const course = getCourse("cloud-devops")!;

  return (
    <div style={{ maxWidth: 720 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
        <span style={{ fontSize: "2.5rem", lineHeight: 1 }}>{course.icon}</span>
        <div>
          <h1
            style={{
              fontSize: "1.875rem",
              fontWeight: 700,
              color: "#e6edf3",
              margin: 0,
              letterSpacing: "-0.02em",
            }}
          >
            Cloud &amp; DevOps
          </h1>
          <p style={{ margin: "4px 0 0", color: "#8b949e", fontSize: "0.875rem" }}>
            {course.topics.length} topics · Language agnostic
          </p>
        </div>
      </div>

      <p style={{ color: "#8b949e", fontSize: "0.9375rem", lineHeight: 1.7, margin: "0 0 36px", maxWidth: 560 }}>
        {course.description}
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {course.topics.map((topic, idx) => (
          <Link key={topic.slug} href={`/learn/cloud-devops/${topic.slug}`} style={{ textDecoration: "none" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                background: "#161b22",
                border: "1px solid #30363d",
                borderRadius: 10,
                padding: "18px 20px",
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  background: "rgba(14,165,233,0.1)",
                  border: "1px solid rgba(14,165,233,0.25)",
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  color: "#0ea5e9",
                  flexShrink: 0,
                }}
              >
                {String(idx + 1).padStart(2, "0")}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "0.9375rem", fontWeight: 600, color: "#e6edf3", marginBottom: 3 }}>
                  {topic.title}
                </div>
                <div style={{ fontSize: "0.8125rem", color: "#8b949e", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {topic.description}
                </div>
              </div>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="#6e7681" style={{ flexShrink: 0 }}>
                <path fillRule="evenodd" d="M6.22 3.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L9.94 8 6.22 4.28a.75.75 0 0 1 0-1.06Z" />
              </svg>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
