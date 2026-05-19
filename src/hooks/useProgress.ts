"use client";

import { useState, useEffect, useCallback } from "react";

export type ProgressStatus = "not-started" | "in-progress" | "completed";

const STORAGE_KEY = "panel_progress";
export const PROGRESS_EVENT = "panel_progress_update";

function readStorage(): Record<string, ProgressStatus> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function useProgress() {
  const [progress, setProgress] = useState<Record<string, ProgressStatus>>({});

  useEffect(() => {
    setProgress(readStorage());

    const onUpdate = () => setProgress(readStorage());
    window.addEventListener(PROGRESS_EVENT, onUpdate);
    window.addEventListener("storage", onUpdate); // cross-tab sync
    return () => {
      window.removeEventListener(PROGRESS_EVENT, onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
  }, []);

  const setStatus = useCallback(
    (courseSlug: string, topicSlug: string, status: ProgressStatus) => {
      const key = `${courseSlug}:${topicSlug}`;
      const updated = { ...readStorage(), [key]: status };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      setProgress(updated);
      window.dispatchEvent(new Event(PROGRESS_EVENT));
    },
    []
  );

  const getStatus = useCallback(
    (courseSlug: string, topicSlug: string): ProgressStatus =>
      progress[`${courseSlug}:${topicSlug}`] ?? "not-started",
    [progress]
  );

  return { setStatus, getStatus };
}
