import chaptersData from "@/data/math/chapters.json";
import pointsData from "@/data/math/points.json";
import trackData from "@/data/python/track.json";
import type { Chapter, MathPoint, PythonStage } from "./types";

export const chapters = chaptersData as Chapter[];
export const points = pointsData as MathPoint[];
export const pythonStages = (trackData as unknown as { stages: PythonStage[] }).stages;

export const pointMap: Record<string, MathPoint> = Object.fromEntries(
  points.map((p) => [p.id, p])
);

export function getPoint(id: string): MathPoint | null {
  return pointMap[id] ?? null;
}

export function getChapter(id: string): Chapter | null {
  return chapters.find((c) => c.id === id) ?? null;
}

export function pointsOfChapter(chapterId: string): MathPoint[] {
  return points.filter((p) => p.chapterId === chapterId);
}

/** 章 + 该章知识点，用于知识树 */
export function buildTree() {
  return chapters.map((c) => ({
    ...c,
    points: pointsOfChapter(c.id),
  }));
}

/** 全站知识点顺序，用于“上一个 / 下一个” */
export function orderedPointIds(): string[] {
  return chapters.flatMap((c) => pointsOfChapter(c.id).map((p) => p.id));
}

export function neighbours(id: string): { prev: string | null; next: string | null } {
  const ids = orderedPointIds();
  const i = ids.indexOf(id);
  if (i === -1) return { prev: null, next: null };
  return { prev: i > 0 ? ids[i - 1] : null, next: i < ids.length - 1 ? ids[i + 1] : null };
}

/** 把关联 id 列表转成 {id,title}，找不到的直接丢掉，不让页面炸掉 */
export function neighbourTitles(ids: string[]): { id: string; title: string }[] {
  return ids
    .map((id) => pointMap[id])
    .filter((p): p is MathPoint => Boolean(p))
    .map((p) => ({ id: p.id, title: p.title }));
}

export function stats() {
  const byLevel = { 1: 0, 2: 0, 3: 0 };
  for (const p of points) byLevel[p.level] += 1;
  return {
    chapters: chapters.length,
    points: points.length,
    byLevel,
    covered: chapters.filter((c) => pointsOfChapter(c.id).length > 0).length,
  };
}