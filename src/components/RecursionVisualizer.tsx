"use client";

import { useState, useEffect, useRef } from "react";

export interface StackFrame {
  label: string;
  status: "active" | "waiting" | "returning";
  returnValue?: string;
  note?: string;
}

export interface RecursionStep {
  description: string;
  stack: StackFrame[];
  phase?: "calling" | "unwinding";
}

interface Props {
  steps: RecursionStep[];
  accentColor?: string;
  title?: string;
}

const FRAME_COLORS = {
  active:    { border: "#a371f7", bg: "#1a1040", text: "#e2d9f3", label: "#a371f7" },
  waiting:   { border: "#30363d", bg: "#0d1117", text: "#6e7681", label: "#484f58" },
  returning: { border: "#3fb950", bg: "#0d1f12", text: "#aff3c1", label: "#3fb950" },
};

export default function RecursionVisualizer({ steps, accentColor = "#a371f7", title = "Call Stack" }: Props) {
  const [step, setStep] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const prevStepRef = useRef(0);

  const current = steps[step];
  const isFirst = step === 0;
  const isLast = step === steps.length - 1;

  // frames rendered newest-on-top (reverse of data order)
  const frames = [...current.stack].reverse();

  const go = (next: number) => {
    prevStepRef.current = step;
    setStep(next);
    setAnimKey((k) => k + 1);
  };

  // keyboard nav
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" && !isLast) go(step + 1);
      if (e.key === "ArrowLeft" && !isFirst) go(step - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const phase = current.phase ?? (step < steps.length / 2 ? "calling" : "unwinding");

  return (
    <div
      style={{
        border: "1px solid #21262d",
        borderRadius: 12,
        overflow: "hidden",
        background: "#0d1117",
        margin: "24px 0",
      }}
    >
      {/* Header bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 16px",
          borderBottom: "1px solid #21262d",
          background: "#161b22",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: "0.75rem", color: accentColor, fontWeight: 700, letterSpacing: "0.08em" }}>
            ◎ CALL STACK
          </span>
          <span
            style={{
              fontSize: "0.6875rem",
              color: phase === "calling" ? "#e3b341" : "#3fb950",
              background: phase === "calling" ? "#2d2200" : "#0d2d16",
              border: `1px solid ${phase === "calling" ? "#4a3700" : "#1a4a2a"}`,
              borderRadius: 4,
              padding: "1px 7px",
              fontWeight: 600,
            }}
          >
            {phase === "calling" ? "▼ building" : "▲ unwinding"}
          </span>
        </div>
        <span style={{ fontSize: "0.75rem", color: "#484f58", fontWeight: 500 }}>
          step {step + 1} / {steps.length}
        </span>
      </div>

      <div style={{ display: "flex", gap: 0, minHeight: 260 }}>
        {/* Stack frames panel */}
        <div
          style={{
            flex: "0 0 200px",
            borderRight: "1px solid #21262d",
            padding: "16px 12px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            gap: 6,
            minHeight: 260,
          }}
        >
          {/* Stack label */}
          <div
            style={{
              fontSize: "0.6rem",
              color: "#484f58",
              textAlign: "center",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: 4,
            }}
          >
            ↑ top
          </div>

          {frames.map((frame, i) => {
            const colors = FRAME_COLORS[frame.status];
            const isTop = i === 0;
            return (
              <div
                key={`${animKey}-${i}-${frame.label}`}
                style={{
                  border: `1.5px solid ${colors.border}`,
                  borderRadius: 7,
                  background: colors.bg,
                  padding: "8px 10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 6,
                  transition: "all 0.2s ease",
                  boxShadow: isTop ? `0 0 8px ${colors.border}40` : "none",
                  animation: i === 0 ? "slideIn 0.18s ease-out" : "none",
                }}
              >
                <span
                  style={{
                    fontSize: "0.8125rem",
                    fontFamily: '"SFMono-Regular", Consolas, monospace',
                    color: colors.label,
                    fontWeight: frame.status === "active" ? 700 : 500,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {frame.label}
                </span>
                {frame.returnValue !== undefined && (
                  <span
                    style={{
                      fontSize: "0.6875rem",
                      fontWeight: 700,
                      color: "#3fb950",
                      background: "#0d2d16",
                      border: "1px solid #1a4a2a",
                      borderRadius: 4,
                      padding: "1px 6px",
                      flexShrink: 0,
                    }}
                  >
                    → {frame.returnValue}
                  </span>
                )}
              </div>
            );
          })}

          {/* Bottom label */}
          <div
            style={{
              fontSize: "0.6rem",
              color: "#484f58",
              textAlign: "center",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginTop: 4,
            }}
          >
            ↓ bottom
          </div>
        </div>

        {/* Description panel */}
        <div
          style={{
            flex: 1,
            padding: "20px 20px 16px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            {/* Depth indicator */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
              <span style={{ fontSize: "0.6875rem", color: "#484f58" }}>Stack depth:</span>
              <div style={{ display: "flex", gap: 3 }}>
                {current.stack.map((_, di) => (
                  <div
                    key={di}
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 2,
                      background: di === current.stack.length - 1 ? accentColor : "#21262d",
                      border: `1px solid ${di === current.stack.length - 1 ? accentColor : "#30363d"}`,
                    }}
                  />
                ))}
              </div>
              <span style={{ fontSize: "0.6875rem", color: "#6e7681" }}>{current.stack.length}</span>
            </div>

            {/* Step description */}
            <p
              key={animKey}
              style={{
                color: "#cdd9e5",
                fontSize: "0.9rem",
                lineHeight: 1.7,
                margin: 0,
                animation: "fadeIn 0.2s ease-out",
              }}
            >
              {current.description}
            </p>
          </div>

          {/* Step progress dots + controls */}
          <div>
            {/* Progress dots */}
            <div style={{ display: "flex", gap: 4, justifyContent: "center", marginBottom: 14 }}>
              {steps.map((_, i) => (
                <button
                  key={i}
                  onClick={() => go(i)}
                  aria-label={`Go to step ${i + 1}`}
                  style={{
                    width: i === step ? 18 : 6,
                    height: 6,
                    borderRadius: 3,
                    border: "none",
                    background: i === step ? accentColor : "#30363d",
                    cursor: "pointer",
                    padding: 0,
                    transition: "width 0.2s, background 0.2s",
                  }}
                />
              ))}
            </div>

            {/* Prev / Next */}
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => go(step - 1)}
                disabled={isFirst}
                style={{
                  flex: 1,
                  padding: "8px 0",
                  borderRadius: 7,
                  border: "1px solid #30363d",
                  background: isFirst ? "transparent" : "#161b22",
                  color: isFirst ? "#30363d" : "#8b949e",
                  cursor: isFirst ? "not-allowed" : "pointer",
                  fontSize: "0.8125rem",
                  fontWeight: 500,
                  transition: "background 0.15s",
                }}
              >
                ← Prev
              </button>
              <button
                onClick={() => go(step + 1)}
                disabled={isLast}
                style={{
                  flex: 1,
                  padding: "8px 0",
                  borderRadius: 7,
                  border: `1px solid ${isLast ? "#30363d" : accentColor + "60"}`,
                  background: isLast ? "transparent" : accentColor + "18",
                  color: isLast ? "#30363d" : accentColor,
                  cursor: isLast ? "not-allowed" : "pointer",
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  transition: "background 0.15s",
                }}
              >
                Next →
              </button>
            </div>
            <p style={{ textAlign: "center", margin: "8px 0 0", fontSize: "0.6875rem", color: "#484f58" }}>
              or use ← → arrow keys
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
