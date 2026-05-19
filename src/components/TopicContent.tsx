"use client";

import dynamic from "next/dynamic";
import TopicProgressButton from "@/components/TopicProgressButton";
import FlowDiagram, { type DiagramConfig } from "@/components/FlowDiagram";

const CodeEditor = dynamic(() => import("@/components/CodeEditor"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        background: "#161b22",
        border: "1px solid #30363d",
        borderRadius: 8,
        height: 320,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#6e7681",
        fontSize: "0.875rem",
      }}
    >
      Loading editor…
    </div>
  ),
});

interface Section {
  heading: string;
  body: string;
  diagram?: DiagramConfig;
  code?: string;
  items?: string[];
}

interface TopicContentProps {
  title: string;
  sections: Section[];
  starterCode?: string;
  playgroundUrl?: string;
  playgroundLabel?: string;
  accentColor?: string;
}

function renderInline(text: string): React.ReactNode[] {
  // Split on **bold** and `code` spans
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} style={{ color: "#e6edf3", fontWeight: 600 }}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={i}
          style={{
            background: "#161b22",
            border: "1px solid #30363d",
            borderRadius: 4,
            padding: "1px 6px",
            fontSize: "0.875em",
            fontFamily:
              '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace',
            color: "#79c0ff",
          }}
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

export default function TopicContent({
  title,
  sections,
  starterCode,
  playgroundUrl,
  playgroundLabel = "Open Playground",
  accentColor = "#238636",
}: TopicContentProps) {
  const accentEnd = accentColor === "#238636" ? "#2ea043" : accentColor + "cc";

  return (
    <div style={{ maxWidth: 820 }}>
      <h1
        style={{
          fontSize: "1.875rem",
          fontWeight: 700,
          color: "#e6edf3",
          margin: "0 0 8px",
          letterSpacing: "-0.02em",
        }}
      >
        {title}
      </h1>
      <div
        style={{
          width: 40,
          height: 3,
          background: `linear-gradient(90deg, ${accentColor}, ${accentEnd})`,
          borderRadius: 2,
          marginBottom: 20,
        }}
      />

      <TopicProgressButton />

      {/* Theory sections */}
      {sections.map((section, i) => (
        <section key={i} style={{ marginBottom: "2rem" }}>
          <h2
            style={{
              fontSize: "1.125rem",
              fontWeight: 600,
              color: "#e6edf3",
              margin: "0 0 10px",
            }}
          >
            {section.heading}
          </h2>
          {section.diagram && <FlowDiagram config={section.diagram} />}
          <p
            style={{
              color: "#8b949e",
              lineHeight: 1.75,
              margin: "0 0 12px",
              fontSize: "0.9375rem",
            }}
          >
            {renderInline(section.body)}
          </p>
          {section.items && (
            <ul
              style={{
                paddingLeft: "1.5rem",
                margin: "0 0 12px",
                listStyleType: "disc",
              }}
            >
              {section.items.map((item, j) => (
                <li
                  key={j}
                  style={{
                    color: "#8b949e",
                    lineHeight: 1.75,
                    marginBottom: "0.25rem",
                    fontSize: "0.9375rem",
                  }}
                >
                  {renderInline(item)}
                </li>
              ))}
            </ul>
          )}
          {section.code && (
            <pre
              style={{
                background: "#0d1117",
                border: "1px solid #21262d",
                borderRadius: 8,
                padding: "1rem 1.25rem",
                overflowX: "auto",
                margin: "0 0 4px",
              }}
            >
              <code
                style={{
                  fontFamily:
                    '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace',
                  fontSize: "0.8125rem",
                  color: "#e6edf3",
                  lineHeight: 1.7,
                  whiteSpace: "pre",
                }}
              >
                {section.code}
              </code>
            </pre>
          )}
        </section>
      ))}

      {/* Try it yourself — in-browser editor */}
      {starterCode && (
        <div
          style={{
            background: "#161b22",
            border: "1px solid #30363d",
            borderRadius: 12,
            padding: "24px",
            marginTop: "2.5rem",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "16px",
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                background: `${accentColor}26`,
                border: `1px solid ${accentColor}66`,
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1rem",
              }}
            >
              ⚡
            </div>
            <div>
              <h3
                style={{
                  margin: 0,
                  fontSize: "0.9375rem",
                  fontWeight: 600,
                  color: "#e6edf3",
                }}
              >
                Try it yourself
              </h3>
              <p style={{ margin: 0, fontSize: "0.8125rem", color: "#6e7681" }}>
                Edit the code and click Run — runs right in your browser.
              </p>
            </div>
          </div>
          <CodeEditor initialCode={starterCode} />
        </div>
      )}

      {/* Playground CTA — for languages without an in-browser runtime */}
      {!starterCode && playgroundUrl && (
        <div
          style={{
            background: "#161b22",
            border: "1px solid #30363d",
            borderRadius: 12,
            padding: "24px",
            marginTop: "2.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: 36,
                height: 36,
                background: `${accentColor}1a`,
                border: `1px solid ${accentColor}4d`,
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.1rem",
                flexShrink: 0,
              }}
            >
              ▶
            </div>
            <div>
              <h3
                style={{
                  margin: 0,
                  fontSize: "0.9375rem",
                  fontWeight: 600,
                  color: "#e6edf3",
                }}
              >
                Run code in the Go Playground
              </h3>
              <p style={{ margin: 0, fontSize: "0.8125rem", color: "#6e7681" }}>
                The official Go Playground lets you write and run Go in your
                browser — no install needed.
              </p>
            </div>
          </div>
          <a
            href={playgroundUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              background: accentColor,
              color: "#fff",
              textDecoration: "none",
              padding: "8px 18px",
              borderRadius: 7,
              fontWeight: 600,
              fontSize: "0.875rem",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            {playgroundLabel}
            <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
              <path d="M3.75 2h3.5a.75.75 0 0 1 0 1.5h-3.5a.25.25 0 0 0-.25.25v8.5c0 .138.112.25.25.25h8.5a.25.25 0 0 0 .25-.25v-3.5a.75.75 0 0 1 1.5 0v3.5A1.75 1.75 0 0 1 12.25 14h-8.5A1.75 1.75 0 0 1 2 12.25v-8.5C2 2.784 2.784 2 3.75 2Zm6.854-1h4.146a.25.25 0 0 1 .25.25v4.146a.75.75 0 0 1-1.5 0V2.561l-5.22 5.22a.749.749 0 0 1-1.06-1.06l5.22-5.22H10.604a.75.75 0 0 1 0-1.5Z" />
            </svg>
          </a>
        </div>
      )}
    </div>
  );
}
