"use client";

import Link from "next/link";
import { useState } from "react";
import { Pips } from "./Mastery";
import { LEVEL_LABEL } from "@/lib/labels";

type PointLite = { id: string; title: string; level: 1 | 2 | 3; summary: string };
type TreeNode = {
  id: string;
  index: string;
  title: string;
  summary: string;
  points: PointLite[];
};

const FILTERS = [
  { v: 0, label: "全部" },
  { v: 1, label: "必会" },
  { v: 2, label: "重点" },
  { v: 3, label: "难点" },
];

export default function MathTree({ tree }: { tree: TreeNode[] }) {
  const [q, setQ] = useState("");
  const [level, setLevel] = useState(0);

  const keyword = q.trim().toLowerCase();

  const shown = tree
    .map((c) => ({
      ...c,
      points: c.points.filter((p) => {
        if (level && p.level !== level) return false;
        if (!keyword) return true;
        return (
          p.title.toLowerCase().includes(keyword) ||
          p.summary.toLowerCase().includes(keyword)
        );
      }),
    }))
    .filter((c) => c.points.length > 0);

  return (
    <>
      <div className="card tight mb-16">
        <div className="composer-row">
          <input
            className="input"
            value={q}
            placeholder="搜知识点，比如「极限」「连续」「中值定理」"
            onChange={(e) => setQ(e.target.value)}
          />
          <div className="seg">
            {FILTERS.map((f) => (
              <button
                key={f.v}
                type="button"
                className={level === f.v ? "on" : ""}
                onClick={() => setLevel(f.v)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {shown.length === 0 ? (
        <div className="card">
          <div className="empty">没有匹配的知识点。换个关键词，或把筛选切回「全部」。</div>
        </div>
      ) : null}

      {shown.map((c) => (
        <div key={c.id} className="tree-chapter">
          <div className="tree-chapter-head">
            <span className="idx">{c.index}</span>
            <span className="name">{c.title}</span>
            <span className="meta">{c.points.length} 个知识点</span>
          </div>
          <div className="tree-points">
            {c.points.map((p) => (
              <Link key={p.id} href={`/math/${p.id}`} className="tree-point">
                <Pips pointId={p.id} />
                <span className="name">{p.title}</span>
                <span className="lv">
                  L{p.level} {LEVEL_LABEL[p.level]}
                </span>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}