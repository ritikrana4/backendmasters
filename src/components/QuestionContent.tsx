"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import type { RecursionStep } from "@/components/RecursionVisualizer";

const RecursionVisualizer = dynamic(() => import("@/components/RecursionVisualizer"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        border: "1px solid #21262d",
        borderRadius: 12,
        height: 300,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#484f58",
        fontSize: "0.875rem",
        background: "#0d1117",
        margin: "24px 0",
      }}
    >
      Loading visualizer…
    </div>
  ),
});

export interface ExplanationSection {
  heading: string;
  body: string;
  items?: string[];
  code?: string;
}

export interface QuestionData {
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  topic: string;
  problem: string;
  constraints?: string[];
  explanation: ExplanationSection[];
  visualizerSteps: RecursionStep[];
  solution: string;
  complexity: { time: string; space: string; note?: string };
}

interface NavLink {
  href: string;
  label: string;
}

interface QuestionContentProps {
  data: QuestionData;
  prev?: NavLink;
  next?: NavLink;
  questionNumber: number;
  totalQuestions: number;
  accentColor?: string;
}

function renderInline(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**"))
      return <strong key={i} style={{ color: "#e6edf3", fontWeight: 600 }}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("`") && part.endsWith("`"))
      return (
        <code key={i} style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: 4, padding: "1px 6px", fontSize: "0.875em", fontFamily: '"SFMono-Regular", Consolas, monospace', color: "#79c0ff" }}>
          {part.slice(1, -1)}
        </code>
      );
    return part;
  });
}

const DIFFICULTY_COLORS = {
  Easy:   { color: "#3fb950", bg: "#0d2d16", border: "#1a4a2a" },
  Medium: { color: "#e3b341", bg: "#2d2200", border: "#4a3700" },
  Hard:   { color: "#f85149", bg: "#2d0e0e", border: "#4a1a1a" },
};

export default function QuestionContent({
  data, prev, next, questionNumber, totalQuestions, accentColor = "#a371f7",
}: QuestionContentProps) {
  const diff = DIFFICULTY_COLORS[data.difficulty];

  return (
    <div style={{ maxWidth: 820 }}>
      {/* Breadcrumb badges */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        <span style={{ fontSize: "0.75rem", color: "#484f58" }}>
          Q{questionNumber}/{totalQuestions}
        </span>
        <span style={{ fontSize: "0.75rem", color: "#484f58" }}>·</span>
        <span style={{ fontSize: "0.75rem", color: "#8b949e", background: "#161b22", border: "1px solid #30363d", borderRadius: 4, padding: "2px 8px" }}>
          {data.topic}
        </span>
        <span
          style={{
            fontSize: "0.75rem",
            fontWeight: 600,
            color: diff.color,
            background: diff.bg,
            border: `1px solid ${diff.border}`,
            borderRadius: 4,
            padding: "2px 8px",
          }}
        >
          {data.difficulty}
        </span>
      </div>

      {/* Title */}
      <h1 style={{ fontSize: "1.875rem", fontWeight: 700, color: "#e6edf3", margin: "0 0 8px", letterSpacing: "-0.02em" }}>
        {data.title}
      </h1>
      <div style={{ width: 40, height: 3, background: `linear-gradient(90deg, ${accentColor}, ${accentColor}99)`, borderRadius: 2, marginBottom: 28 }} />

      {/* Problem statement */}
      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#484f58", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 12px" }}>
          Problem
        </h2>
        <div
          style={{
            background: "#161b22",
            border: "1px solid #30363d",
            borderLeft: `3px solid ${accentColor}`,
            borderRadius: "0 8px 8px 0",
            padding: "16px 20px",
          }}
        >
          <p style={{ color: "#cdd9e5", lineHeight: 1.75, margin: 0, fontSize: "0.9375rem" }}>
            {renderInline(data.problem)}
          </p>
          {data.constraints && data.constraints.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <p style={{ fontSize: "0.75rem", color: "#484f58", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 6px" }}>Constraints</p>
              <ul style={{ margin: 0, paddingLeft: "1.25rem", listStyleType: "disc" }}>
                {data.constraints.map((c, i) => (
                  <li key={i} style={{ color: "#6e7681", fontSize: "0.875rem", lineHeight: 1.6 }}>
                    {renderInline(c)}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      {/* Mental model explanation */}
      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#484f58", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 16px" }}>
          Mental Model
        </h2>
        {data.explanation.map((sec, i) => (
          <div key={i} style={{ marginBottom: "1.5rem" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "#e6edf3", margin: "0 0 8px" }}>
              {sec.heading}
            </h3>
            <p style={{ color: "#8b949e", lineHeight: 1.75, margin: "0 0 10px", fontSize: "0.9375rem" }}>
              {renderInline(sec.body)}
            </p>
            {sec.items && (
              <ul style={{ paddingLeft: "1.5rem", margin: "0 0 10px", listStyleType: "disc" }}>
                {sec.items.map((item, j) => (
                  <li key={j} style={{ color: "#8b949e", lineHeight: 1.75, marginBottom: "0.25rem", fontSize: "0.9375rem" }}>
                    {renderInline(item)}
                  </li>
                ))}
              </ul>
            )}
            {sec.code && (
              <pre style={{ background: "#0d1117", border: "1px solid #21262d", borderRadius: 8, padding: "1rem 1.25rem", overflowX: "auto", margin: 0 }}>
                <code style={{ fontFamily: '"SFMono-Regular", Consolas, monospace', fontSize: "0.8125rem", color: "#e6edf3", lineHeight: 1.7, whiteSpace: "pre" }}>
                  {sec.code}
                </code>
              </pre>
            )}
          </div>
        ))}
      </section>

      {/* Call stack visualizer */}
      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#484f58", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 4px" }}>
          Step-by-Step Visualization
        </h2>
        <p style={{ color: "#484f58", fontSize: "0.8125rem", margin: "0 0 4px" }}>
          Walk through each recursive call. Watch the stack build up, then unwind.
        </p>
        <RecursionVisualizer steps={data.visualizerSteps} accentColor={accentColor} />
      </section>

      {/* Solution */}
      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#484f58", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 12px" }}>
          Solution
        </h2>
        <pre style={{ background: "#0d1117", border: "1px solid #21262d", borderRadius: 8, padding: "1rem 1.25rem", overflowX: "auto", margin: 0 }}>
          <code style={{ fontFamily: '"SFMono-Regular", Consolas, monospace', fontSize: "0.8125rem", color: "#e6edf3", lineHeight: 1.7, whiteSpace: "pre" }}>
            {data.solution}
          </code>
        </pre>
      </section>

      {/* Complexity */}
      <section style={{ marginBottom: "3rem" }}>
        <h2 style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#484f58", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 12px" }}>
          Complexity
        </h2>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {[
            { label: "Time", value: data.complexity.time },
            { label: "Space", value: data.complexity.space },
          ].map(({ label, value }) => (
            <div key={label} style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: 8, padding: "12px 20px", minWidth: 120 }}>
              <div style={{ fontSize: "0.6875rem", color: "#484f58", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: "1.0625rem", fontWeight: 700, color: accentColor, fontFamily: '"SFMono-Regular", Consolas, monospace' }}>{value}</div>
            </div>
          ))}
        </div>
        {data.complexity.note && (
          <p style={{ color: "#6e7681", fontSize: "0.875rem", marginTop: 10, lineHeight: 1.6 }}>
            {renderInline(data.complexity.note)}
          </p>
        )}
      </section>

      {/* Prev / Next navigation */}
      <div
        style={{
          borderTop: "1px solid #21262d",
          paddingTop: 24,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
        }}
      >
        {prev ? (
          <Link
            href={prev.href}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 18px",
              borderRadius: 8,
              border: "1px solid #30363d",
              background: "#161b22",
              color: "#8b949e",
              textDecoration: "none",
              fontSize: "0.875rem",
              fontWeight: 500,
              transition: "border-color 0.15s, color 0.15s",
            }}
          >
            <span style={{ fontSize: "1rem" }}>←</span>
            <div>
              <div style={{ fontSize: "0.6875rem", color: "#484f58" }}>Previous</div>
              <div>{prev.label}</div>
            </div>
          </Link>
        ) : (
          <div />
        )}

        {next ? (
          <Link
            href={next.href}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 18px",
              borderRadius: 8,
              border: `1px solid ${accentColor}60`,
              background: accentColor + "18",
              color: accentColor,
              textDecoration: "none",
              fontSize: "0.875rem",
              fontWeight: 600,
              transition: "background 0.15s",
            }}
          >
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "0.6875rem", color: accentColor + "99" }}>Next</div>
              <div>{next.label}</div>
            </div>
            <span style={{ fontSize: "1rem" }}>→</span>
          </Link>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}
