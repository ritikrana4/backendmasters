"use client";

import { useState, useEffect, useRef } from "react";
import type { Course } from "@/lib/courses";
import { useStudyPlan, getLessonUnits, buildSchedule } from "@/hooks/useStudyPlan";

const DAY_PRESETS = [7, 14, 21, 30];

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function addDays(dateStr: string, n: number): Date {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + n);
  return d;
}

function dayLabel(dateStr: string, n: number): string {
  const d = addDays(dateStr, n);
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function daysSinceStart(startDate: string): number {
  const start = new Date(startDate);
  const now = new Date();
  start.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  return Math.floor((now.getTime() - start.getTime()) / 86400000);
}

interface Props {
  course: Course;
  onClose: () => void;
}

export default function StudyPlanModal({ course, onClose }: Props) {
  const { getPlan, createPlan, deletePlan, toggleUnit } = useStudyPlan();
  const plan = getPlan(course.slug);
  const [mode, setMode] = useState<"view" | "create">(plan ? "view" : "create");
  const [selectedDays, setSelectedDays] = useState(14);
  const [customDays, setCustomDays] = useState("");
  const backdropRef = useRef<HTMLDivElement>(null);

  const units = getLessonUnits(course);
  const unitMap = Object.fromEntries(units.map((u) => [u.key, u]));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleCreate = () => {
    const days = Math.max(1, Math.min(365, customDays ? parseInt(customDays) || selectedDays : selectedDays));
    const schedule = buildSchedule(units.map((u) => u.key), days);
    createPlan({ courseSlug: course.slug, startDate: todayStr(), days, schedule, completed: [] });
    setMode("view");
  };

  const handleDelete = () => {
    deletePlan(course.slug);
    onClose();
  };

  const effectiveDays = customDays ? parseInt(customDays) || selectedDays : selectedDays;
  const previewSchedule = buildSchedule(units.map((u) => u.key), Math.max(1, Math.min(365, effectiveDays)));

  return (
    <div
      ref={backdropRef}
      onClick={(e) => { if (e.target === backdropRef.current) onClose(); }}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
    >
      <div
        style={{
          background: "#161b22",
          border: "1px solid #30363d",
          borderRadius: 12,
          width: "100%",
          maxWidth: 520,
          maxHeight: "85vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            borderBottom: "1px solid #21262d",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: "1.25rem" }}>{course.icon}</span>
            <div>
              <div style={{ fontSize: "0.9375rem", fontWeight: 600, color: "#e6edf3" }}>
                {mode === "create" ? "Plan your study" : "Study Plan"}
              </div>
              <div style={{ fontSize: "0.75rem", color: "#8b949e" }}>{course.name}</div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#8b949e", padding: 4, lineHeight: 0 }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.75.75 0 1 1 1.06 1.06L9.06 8l3.22 3.22a.75.75 0 1 1-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 0 1-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06z" />
            </svg>
          </button>
        </div>

        {mode === "create" ? (
          <CreateView
            units={units}
            selectedDays={selectedDays}
            setSelectedDays={(d) => { setSelectedDays(d); setCustomDays(""); }}
            customDays={customDays}
            setCustomDays={setCustomDays}
            previewSchedule={previewSchedule}
            unitMap={unitMap}
            onStart={handleCreate}
            effectiveDays={effectiveDays}
          />
        ) : plan ? (
          <ViewPlan
            course={course}
            plan={plan}
            unitMap={unitMap}
            onToggle={(key) => toggleUnit(course.slug, key)}
            onDelete={handleDelete}
            onEdit={() => setMode("create")}
          />
        ) : null}
      </div>
    </div>
  );
}

function CreateView({
  units, selectedDays, setSelectedDays, customDays, setCustomDays,
  previewSchedule, unitMap, onStart, effectiveDays,
}: {
  units: ReturnType<typeof getLessonUnits>;
  selectedDays: number;
  setSelectedDays: (d: number) => void;
  customDays: string;
  setCustomDays: (s: string) => void;
  previewSchedule: string[][];
  unitMap: Record<string, { label: string; topicLabel: string }>;
  onStart: () => void;
  effectiveDays: number;
}) {
  return (
    <>
      <div style={{ padding: "20px", borderBottom: "1px solid #21262d", flexShrink: 0 }}>
        <div style={{ fontSize: "0.8125rem", color: "#8b949e", marginBottom: 16 }}>
          <strong style={{ color: "#e6edf3" }}>{units.length}</strong> lessons to cover
        </div>

        <div style={{ fontSize: "0.75rem", color: "#8b949e", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
          Complete in
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          {DAY_PRESETS.map((d) => (
            <button
              key={d}
              onClick={() => { setSelectedDays(d); setCustomDays(""); }}
              style={{
                padding: "6px 14px",
                borderRadius: 6,
                border: `1px solid ${!customDays && selectedDays === d ? "#58a6ff" : "#30363d"}`,
                background: !customDays && selectedDays === d ? "#58a6ff18" : "#0d1117",
                color: !customDays && selectedDays === d ? "#58a6ff" : "#8b949e",
                cursor: "pointer",
                fontSize: "0.875rem",
                fontWeight: !customDays && selectedDays === d ? 600 : 400,
                transition: "all 0.15s",
              }}
            >
              {d} days
            </button>
          ))}
          <input
            type="number"
            min={1}
            max={365}
            placeholder="Custom"
            value={customDays}
            onChange={(e) => setCustomDays(e.target.value)}
            style={{
              width: 80,
              padding: "6px 10px",
              borderRadius: 6,
              border: `1px solid ${customDays ? "#58a6ff" : "#30363d"}`,
              background: "#0d1117",
              color: "#e6edf3",
              fontSize: "0.875rem",
              outline: "none",
            }}
          />
          <span style={{ fontSize: "0.8125rem", color: "#6e7681" }}>
            ≈ {Math.round(units.length / Math.max(1, effectiveDays) * 10) / 10} lessons/day
          </span>
        </div>
      </div>

      {/* Schedule preview */}
      <div className="sidebar-scroll" style={{ flex: 1, overflowY: "auto", padding: "12px 20px" }}>
        <div style={{ fontSize: "0.75rem", color: "#8b949e", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
          Schedule preview
        </div>
        {previewSchedule.map((dayUnits, i) => (
          dayUnits.length === 0 ? null : (
            <div key={i} style={{ marginBottom: 12 }}>
              <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#cdd9e5", marginBottom: 4 }}>
                Day {i + 1}
              </div>
              {dayUnits.map((key) => {
                const unit = unitMap[key];
                return (
                  <div key={key} style={{ display: "flex", alignItems: "center", gap: 6, padding: "3px 0 3px 8px", fontSize: "0.8125rem", color: "#8b949e" }}>
                    <span style={{ color: "#30363d", fontSize: "0.6875rem" }}>•</span>
                    {unit?.label ?? key}
                  </div>
                );
              })}
            </div>
          )
        ))}
      </div>

      <div style={{ padding: "16px 20px", borderTop: "1px solid #21262d", flexShrink: 0 }}>
        <button
          onClick={onStart}
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: 8,
            border: "1px solid #238636",
            background: "#238636",
            color: "#fff",
            fontWeight: 600,
            fontSize: "0.9375rem",
            cursor: "pointer",
          }}
        >
          Start Plan — {Math.max(1, Math.min(365, effectiveDays))} days
        </button>
      </div>
    </>
  );
}

function ViewPlan({
  course, plan, unitMap, onToggle, onDelete, onEdit,
}: {
  course: Course;
  plan: ReturnType<typeof useStudyPlan>["getPlan"] extends (s: string) => infer R ? NonNullable<R> : never;
  unitMap: Record<string, { label: string; topicLabel: string }>;
  onToggle: (key: string) => void;
  onDelete: () => void;
  onEdit: () => void;
}) {
  const today = daysSinceStart(plan.startDate);
  const currentDay = Math.max(0, Math.min(today, plan.days - 1));
  const daysCompleted = Math.min(today, plan.days);
  const daysRemaining = Math.max(0, plan.days - today);
  const totalUnits = plan.schedule.flat().length;
  const completedCount = plan.completed.length;
  const progressPct = totalUnits === 0 ? 0 : Math.round((completedCount / totalUnits) * 100);

  const dayRefs = useRef<Record<number, HTMLDivElement | null>>({});
  // Scroll to today on mount
  useEffect(() => {
    const el = dayRefs.current[currentDay];
    if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "center" }), 100);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {/* Stats bar */}
      <div style={{ padding: "16px 20px", borderBottom: "1px solid #21262d", flexShrink: 0 }}>
        <div style={{ display: "flex", gap: 20, marginBottom: 12, flexWrap: "wrap" }}>
          <Stat label="Days" value={`${plan.days}`} />
          <Stat label="Done" value={`${completedCount}/${totalUnits}`} accent="#3fb950" />
          <Stat label="Remaining" value={`${daysRemaining} days`} />
          <Stat label="Progress" value={`${progressPct}%`} accent="#58a6ff" />
        </div>
        {/* Progress bar */}
        <div style={{ background: "#21262d", borderRadius: 4, height: 6, overflow: "hidden" }}>
          <div
            style={{
              width: `${progressPct}%`,
              height: "100%",
              background: "linear-gradient(90deg, #238636, #3fb950)",
              borderRadius: 4,
              transition: "width 0.3s",
            }}
          />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
          <span style={{ fontSize: "0.6875rem", color: "#6e7681" }}>
            Started {new Date(plan.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </span>
          <span style={{ fontSize: "0.6875rem", color: "#6e7681" }}>
            {daysRemaining > 0 ? `${daysRemaining} days left` : "Completed!"}
          </span>
        </div>
      </div>

      {/* Day list */}
      <div className="sidebar-scroll" style={{ flex: 1, overflowY: "auto", padding: "12px 20px" }}>
        {plan.schedule.map((dayUnits, i) => {
          if (dayUnits.length === 0) return null;
          const isPast = i < currentDay;
          const isToday = i === currentDay;
          const isFuture = i > currentDay;
          const dayDone = dayUnits.every((k) => plan.completed.includes(k));
          const dayDate = dayLabel(plan.startDate, i);

          return (
            <div
              key={i}
              ref={(el) => { dayRefs.current[i] = el; }}
              style={{
                marginBottom: 12,
                borderRadius: 8,
                border: isToday ? "1px solid #58a6ff40" : "1px solid transparent",
                background: isToday ? "#58a6ff08" : "transparent",
                padding: isToday ? "10px 12px" : "0",
              }}
            >
              {/* Day header */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: isToday ? 8 : 4 }}>
                <span style={{ fontSize: "0.9rem", lineHeight: 1 }}>
                  {isPast && dayDone ? "✓" : isPast ? "◑" : isToday ? "▶" : "○"}
                </span>
                <span style={{
                  fontSize: "0.8125rem",
                  fontWeight: isToday ? 700 : 500,
                  color: isToday ? "#58a6ff" : isPast ? "#3fb950" : "#8b949e",
                }}>
                  Day {i + 1}
                  {isToday && <span style={{ marginLeft: 6, fontSize: "0.6875rem", color: "#58a6ff99" }}>TODAY</span>}
                </span>
                <span style={{ fontSize: "0.75rem", color: "#6e7681", marginLeft: "auto" }}>
                  {dayDate}
                </span>
              </div>

              {/* Topics for this day */}
              {(!isFuture || isToday) && dayUnits.map((key) => {
                const unit = unitMap[key];
                const done = plan.completed.includes(key);
                return (
                  <button
                    key={key}
                    onClick={() => onToggle(key)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      width: "100%",
                      padding: "5px 8px",
                      borderRadius: 5,
                      border: "none",
                      background: "transparent",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "background 0.1s",
                    }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#21262d")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "transparent")}
                  >
                    <span style={{
                      width: 16, height: 16, borderRadius: 4, border: `1.5px solid ${done ? "#238636" : "#30363d"}`,
                      background: done ? "#238636" : "transparent", flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {done && <svg width="10" height="10" viewBox="0 0 10 10" fill="white"><path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>}
                    </span>
                    <span style={{ fontSize: "0.8125rem", color: done ? "#3fb950" : "#8b949e", textDecoration: done ? "line-through" : "none" }}>
                      {unit?.label ?? key}
                    </span>
                  </button>
                );
              })}
              {isFuture && !isToday && (
                <div style={{ fontSize: "0.75rem", color: "#484f58", paddingLeft: 24 }}>
                  {dayUnits.length} lesson{dayUnits.length !== 1 ? "s" : ""}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div style={{ padding: "14px 20px", borderTop: "1px solid #21262d", display: "flex", gap: 8, flexShrink: 0 }}>
        <button
          onClick={onEdit}
          style={{
            flex: 1, padding: "8px", borderRadius: 7, border: "1px solid #30363d",
            background: "#0d1117", color: "#8b949e", cursor: "pointer", fontSize: "0.875rem",
          }}
        >
          Edit Plan
        </button>
        <button
          onClick={onDelete}
          style={{
            flex: 1, padding: "8px", borderRadius: 7, border: "1px solid #f8514930",
            background: "transparent", color: "#f85149", cursor: "pointer", fontSize: "0.875rem",
          }}
        >
          Delete Plan
        </button>
      </div>
    </>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div>
      <div style={{ fontSize: "0.6875rem", color: "#6e7681", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</div>
      <div style={{ fontSize: "1rem", fontWeight: 700, color: accent ?? "#e6edf3" }}>{value}</div>
    </div>
  );
}
