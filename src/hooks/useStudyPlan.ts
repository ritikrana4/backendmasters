"use client";

import { useState, useEffect } from "react";
import type { Course } from "@/lib/courses";

export interface StudyPlan {
  courseSlug: string;
  startDate: string;   // YYYY-MM-DD
  days: number;
  schedule: string[][]; // schedule[dayIndex] = [unitKey, ...unitKey]
  completed: string[]; // unit keys the user has checked off
}

// unitKey: "topicSlug" for plain topics, "topicSlug/subtopicSlug" for subtopics
export function getLessonUnits(course: Course): Array<{
  key: string;
  label: string;
  topicLabel: string;
}> {
  const units: Array<{ key: string; label: string; topicLabel: string }> = [];
  for (const topic of course.topics) {
    if (topic.subtopics && topic.subtopics.length > 0) {
      for (const sub of topic.subtopics) {
        units.push({ key: `${topic.slug}/${sub.slug}`, label: sub.title, topicLabel: topic.title });
      }
    } else {
      units.push({ key: topic.slug, label: topic.title, topicLabel: topic.title });
    }
  }
  return units;
}

export function buildSchedule(units: string[], days: number): string[][] {
  const schedule: string[][] = Array.from({ length: days }, () => []);
  units.forEach((unit, i) => {
    // distribute evenly: topic i goes to floor(i * days / total)
    const day = Math.min(Math.floor((i * days) / units.length), days - 1);
    schedule[day].push(unit);
  });
  return schedule;
}

const STORAGE_KEY = "fsm_study_plans";

function load(): Record<string, StudyPlan> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

function save(plans: Record<string, StudyPlan>) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(plans)); } catch {}
}

export function useStudyPlan() {
  const [plans, setPlans] = useState<Record<string, StudyPlan>>({});

  useEffect(() => {
    setPlans(load());
  }, []);

  const getPlan = (courseSlug: string): StudyPlan | null =>
    plans[courseSlug] ?? null;

  const createPlan = (plan: StudyPlan) => {
    const next = { ...plans, [plan.courseSlug]: plan };
    setPlans(next);
    save(next);
  };

  const deletePlan = (courseSlug: string) => {
    const next = { ...plans };
    delete next[courseSlug];
    setPlans(next);
    save(next);
  };

  const toggleUnit = (courseSlug: string, unitKey: string) => {
    const plan = plans[courseSlug];
    if (!plan) return;
    const completed = plan.completed.includes(unitKey)
      ? plan.completed.filter((k) => k !== unitKey)
      : [...plan.completed, unitKey];
    const next = { ...plans, [courseSlug]: { ...plan, completed } };
    setPlans(next);
    save(next);
  };

  return { getPlan, createPlan, deletePlan, toggleUnit };
}
