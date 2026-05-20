"use client";

import { useState, useEffect } from "react";

export interface BoxItem {
  label: string;
  active?: boolean;
}

export interface ConceptPanel {
  title: string;
  color: string;
  items: BoxItem[];
  note?: string; // shown when items is empty
}

export interface ConceptStep {
  description: string;
  panels?: ConceptPanel[];
  code?: string;
  phase?: string;
}

interface Props {
  steps: ConceptStep[];
  accentColor?: string;
}

export default function ConceptVisualizer({ steps, accentColor = "#58a6ff" }: Props) {
  const [step, setStep] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const current = steps[step];
  const isFirst = step === 0;
  const isLast = step === steps.length - 1;

  const go = (next: number) => {
    setStep(next);
    setAnimKey((k) => k + 1);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" && !isLast) go(step + 1);
      if (e.key === "ArrowLeft" && !isFirst) go(step - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div style={{ border: "1px solid #21262d", borderRadius: 12, overflow: "hidden", background: "#0d1117", margin: "24px 0" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", borderBottom: "1px solid #21262d", background: "#161b22" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: "0.75rem", color: accentColor, fontWeight: 700, letterSpacing: "0.08em" }}>◎ VISUALIZER</span>
          {current.phase && (
            <span style={{ fontSize: "0.6875rem", color: "#e3b341", background: "#2d2200", border: "1px solid #4a3700", borderRadius: 4, padding: "1px 7px", fontWeight: 600 }}>
              {current.phase}
            </span>
          )}
        </div>
        <span style={{ fontSize: "0.75rem", color: "#484f58", fontWeight: 500 }}>step {step + 1} / {steps.length}</span>
      </div>

      {/* Description */}
      <div style={{ padding: "16px 20px 12px", borderBottom: current.panels || current.code ? "1px solid #21262d" : undefined }}>
        <p key={animKey} style={{ color: "#cdd9e5", fontSize: "0.9rem", lineHeight: 1.7, margin: 0, animation: "fadeIn 0.2s ease-out" }}>
          {current.description}
        </p>
      </div>

      {/* Panels */}
      {current.panels && current.panels.length > 0 && (
        <div
          key={`panels-${animKey}`}
          style={{
            display: "flex",
            gap: 10,
            padding: "14px 16px",
            overflowX: "auto",
            borderBottom: current.code ? "1px solid #21262d" : undefined,
            animation: "fadeIn 0.2s ease-out",
          }}
        >
          {current.panels.map((panel, pi) => (
            <div
              key={pi}
              style={{
                flex: "1 1 0",
                minWidth: 110,
                border: `1.5px solid ${panel.color}40`,
                borderTop: `3px solid ${panel.color}`,
                borderRadius: "0 0 8px 8px",
                background: "#161b22",
                padding: "10px 10px 8px",
              }}
            >
              <div style={{ fontSize: "0.625rem", fontWeight: 700, color: panel.color, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
                {panel.title}
              </div>
              {panel.items.length === 0 ? (
                <div style={{ fontSize: "0.75rem", color: "#30363d", fontStyle: "italic", textAlign: "center", padding: "4px 0" }}>
                  {panel.note ?? "empty"}
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {panel.items.map((item, ii) => (
                    <div
                      key={ii}
                      style={{
                        fontSize: "0.8125rem",
                        fontFamily: '"SFMono-Regular", Consolas, monospace',
                        color: item.active ? panel.color : "#8b949e",
                        background: item.active ? `${panel.color}18` : "#0d1117",
                        border: `1px solid ${item.active ? panel.color + "60" : "#21262d"}`,
                        borderRadius: 5,
                        padding: "4px 8px",
                        fontWeight: item.active ? 700 : 400,
                        transition: "all 0.15s",
                      }}
                    >
                      {item.active && <span style={{ marginRight: 4, fontSize: "0.625rem" }}>▶</span>}
                      {item.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Code block */}
      {current.code && (
        <pre key={`code-${animKey}`} style={{ background: "#0d1117", borderBottom: "1px solid #21262d", padding: "12px 16px", overflowX: "auto", margin: 0, animation: "fadeIn 0.2s ease-out" }}>
          <code style={{ fontFamily: '"SFMono-Regular", Consolas, monospace', fontSize: "0.8125rem", color: "#e6edf3", lineHeight: 1.7, whiteSpace: "pre" }}>
            {current.code}
          </code>
        </pre>
      )}

      {/* Controls */}
      <div style={{ padding: "12px 16px 14px" }}>
        <div style={{ display: "flex", gap: 4, justifyContent: "center", marginBottom: 10 }}>
          {steps.map((_, i) => (
            <button
              key={i}
              onClick={() => go(i)}
              style={{ width: i === step ? 18 : 6, height: 6, borderRadius: 3, border: "none", background: i === step ? accentColor : "#30363d", cursor: "pointer", padding: 0, transition: "width 0.2s, background 0.2s" }}
            />
          ))}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => go(step - 1)} disabled={isFirst} style={{ flex: 1, padding: "8px 0", borderRadius: 7, border: "1px solid #30363d", background: isFirst ? "transparent" : "#161b22", color: isFirst ? "#30363d" : "#8b949e", cursor: isFirst ? "not-allowed" : "pointer", fontSize: "0.8125rem", fontWeight: 500 }}>← Prev</button>
          <button onClick={() => go(step + 1)} disabled={isLast} style={{ flex: 1, padding: "8px 0", borderRadius: 7, border: `1px solid ${isLast ? "#30363d" : accentColor + "60"}`, background: isLast ? "transparent" : accentColor + "18", color: isLast ? "#30363d" : accentColor, cursor: isLast ? "not-allowed" : "pointer", fontSize: "0.8125rem", fontWeight: 600 }}>Next →</button>
        </div>
        <p style={{ textAlign: "center", margin: "8px 0 0", fontSize: "0.6875rem", color: "#484f58" }}>or use ← → arrow keys</p>
      </div>

      <style>{`@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
    </div>
  );
}
