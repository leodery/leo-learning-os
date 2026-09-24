"use client";

import { useSyncExternalStore } from "react";
import type { StudyLog } from "./types";

/**
 * 学习记录存在浏览器本地（localStorage），不上传。
 * 知识内容（data/*.json）是静态的，可以和记录彻底分开——
 * 前者可以提交到 GitHub 当作品，后者只属于你自己。
 */

const KEY = "leo-learning-os/v1";

export type ProgressState = {
  /** 知识点掌握度：1 未学 / 2 有印象 / 3 能独立做 */
  mastery: Record<string, 1 | 2 | 3>;
  /** 学习日志，最新的在前 */
  logs: StudyLog[];
  /** Python 进度：topic 勾选 + 阶段项目是否完成 */
  py: Record<string, { topics: string[]; project: boolean }>;
};

const EMPTY: ProgressState = { mastery: {}, logs: [], py: {} };

let state: ProgressState = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function loadFromStorage() {
  if (loaded) return;
  loaded = true;
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as Partial<ProgressState>;
    state = {
      mastery: parsed.mastery ?? {},
      logs: Array.isArray(parsed.logs) ? parsed.logs : [],
      py: parsed.py ?? {},
    };
  } catch {
    state = EMPTY;
  }
}

function commit(next: ProgressState) {
  state = next;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* 存不下就只保存在内存里，不影响使用 */
    }
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): ProgressState {
  loadFromStorage();
  return state;
}

function getServerSnapshot(): ProgressState {
  return EMPTY;
}

export function useProgress(): ProgressState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/* ---------------- 掌握度 ---------------- */

export function setMastery(pointId: string, level: 1 | 2 | 3) {
  loadFromStorage();
  const mastery = { ...state.mastery };
  if (mastery[pointId] === level) delete mastery[pointId];
  else mastery[pointId] = level;
  commit({ ...state, mastery });
}

/* ---------------- 学习日志 ---------------- */

export function addLog(log: StudyLog) {
  loadFromStorage();
  commit({ ...state, logs: [log, ...state.logs].slice(0, 400) });
}

export function removeLog(index: number) {
  loadFromStorage();
  commit({ ...state, logs: state.logs.filter((_, i) => i !== index) });
}

/* ---------------- Python 进度 ---------------- */

export function togglePyTopic(stageId: string, topic: string) {
  loadFromStorage();
  const cur = state.py[stageId] ?? { topics: [], project: false };
  const topics = cur.topics.includes(topic)
    ? cur.topics.filter((t) => t !== topic)
    : [...cur.topics, topic];
  commit({ ...state, py: { ...state.py, [stageId]: { ...cur, topics } } });
}

export function togglePyProject(stageId: string) {
  loadFromStorage();
  const cur = state.py[stageId] ?? { topics: [], project: false };
  commit({
    ...state,
    py: { ...state.py, [stageId]: { ...cur, project: !cur.project } },
  });
}

/* ---------------- 派生统计（纯函数） ---------------- */

function dayKey(d: Date): string {
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

/** 连续学习天数：从今天（或昨天）往前数 */
export function streakDays(logs: StudyLog[]): number {
  const days = new Set(logs.map((l) => l.date));
  const cursor = new Date();
  if (!days.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  let n = 0;
  while (days.has(dayKey(cursor))) {
    n += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return n;
}

/** 本周（周一至今）的日志 */
export function thisWeekLogs(logs: StudyLog[]): StudyLog[] {
  const now = new Date();
  const dow = (now.getDay() + 6) % 7; // 周一 = 0
  const start = new Date(now);
  start.setDate(now.getDate() - dow);
  start.setHours(0, 0, 0, 0);
  const startKey = dayKey(start);
  return logs.filter((l) => l.date >= startKey);
}

/** 把日志压成一段文字，交给 /api/chat 的 review 任务 */
export function logsToText(logs: StudyLog[]): string {
  if (!logs.length) return "";
  return logs
    .map((l) => {
      const subject =
        l.subject === "math" ? "高数" : l.subject === "python" ? "Python" : "其他";
      return `【${l.date}】${subject} ${l.minutes} 分钟｜掌握度 ${l.mastery}/3\n学到：${l.content || "（未填）"}\n卡住：${l.blocked || "（无）"}`;
    })
    .join("\n\n");
}

/** 今天已累计的学习分钟数 */
export function todayMinutes(logs: StudyLog[]): number {
  const today = dayKey(new Date());
  return logs.filter((l) => l.date === today).reduce((s, l) => s + l.minutes, 0);
}

export { dayKey };