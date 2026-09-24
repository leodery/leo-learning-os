"use client";

import { useCallback, useEffect, useState } from "react";

/** 错题记录（轻量版，不存整张图） */
export type WrongItem = {
  id: string;
  /** 题目原文（AI 提取或用户输入） */
  question: string;
  /** AI 给出的解答 */
  solution: string;
  /** 错题分类 */
  pointIds: string[];
  mistakeType: string;
  /** AI 自动生成的同类变式题 */
  similarQ?: string;
  /** 创建时间 ISO 字符串 */
  createdAt: string;
  /** 是否已重做 */
  redone?: boolean;
};

const KEY = "leo.wrong.items.v1";

function load(): WrongItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as WrongItem[];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function save(items: WrongItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(items));
}

export function useWrongItems() {
  const [items, setItems] = useState<WrongItem[]>([]);

  useEffect(() => {
    setItems(load());
  }, []);

  const add = useCallback((item: Omit<WrongItem, "id" | "createdAt">) => {
    const full: WrongItem = {
      ...item,
      id: `w-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    setItems((prev) => {
      const next = [full, ...prev];
      save(next);
      return next;
    });
    return full;
  }, []);

  const remove = useCallback((id: string) => {
    setItems((prev) => {
      const next = prev.filter((i) => i.id !== id);
      save(next);
      return next;
    });
  }, []);

  const markRedone = useCallback((id: string) => {
    setItems((prev) => {
      const next = prev.map((i) =>
        i.id === id ? { ...i, redone: !i.redone } : i
      );
      save(next);
      return next;
    });
  }, []);

  return { items, add, remove, markRedone };
}
