"use client";

import { useMemo, useState } from "react";
import MathText from "@/components/MathText";
import { useWrongItems } from "@/lib/wrong";
import { exportMarkdown, exportWord, printToPdf } from "@/lib/export";
import { orderedPointIds, pointMap } from "@/lib/data";

type PracticeItem = { q: string; a: string };
type PracticeMap = Record<string, { loading: boolean; list?: PracticeItem[]; error?: string }>;

export default function WrongPage() {
  const { items, remove, markRedone } = useWrongItems();
  const [filterPoint, setFilterPoint] = useState<string>("");
  const [practiceMap, setPracticeMap] = useState<PracticeMap>({});

  const groups = useMemo(() => {
    const map = new Map<string, typeof items>();
    for (const w of items) {
      const key = w.pointIds[0] ?? "__other__";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(w);
    }
    return Array.from(map.entries());
  }, [items]);

  const filteredGroups = filterPoint
    ? groups.filter(([k]) => k === filterPoint)
    : groups;

  const pointOptions = orderedPointIds()
    .map((id) => pointMap[id])
    .filter(Boolean);

  async function generatePractice(id: string, question: string) {
    setPracticeMap((m) => ({ ...m, [id]: { loading: true } }));
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task: "practice", input: question }),
      });
      const data = (await res.json()) as { text: string; source: string };
      // 解析 JSON（AI 可能返回 markdown 包裹）
      let jsonText = data.text.trim();
      if (jsonText.startsWith("```")) {
        const lines = jsonText.split("\n");
        jsonText = lines.slice(1, -1).join("\n").trim();
      }
      const parsed = JSON.parse(jsonText) as { questions: PracticeItem[] };
      setPracticeMap((m) => ({
        ...m,
        [id]: { loading: false, list: parsed.questions ?? [] },
      }));
    } catch (err) {
      setPracticeMap((m) => ({
        ...m,
        [id]: { loading: false, error: err instanceof Error ? err.message : "解析失败" },
      }));
    }
  }

  return (
    <div className="page">
      <div className="page-head">
        <div className="eyebrow">沉淀</div>
        <h1>错题本</h1>
        <div className="sub">
          AI 帮你分类的拍题记录。按知识点分组，重做标记。数据存本地，不上传。
        </div>
      </div>

      <div className="section" style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <select
          className="input"
          style={{ width: 260 }}
          value={filterPoint}
          onChange={(e) => setFilterPoint(e.target.value)}
        >
          <option value="">全部分组（{items.length} 题）</option>
          {groups.map(([pid, list]) => {
            const label = pointMap[pid]?.title ?? "未分类";
            return (
              <option key={pid} value={pid}>
                {label}（{list.length}）
              </option>
            );
          })}
        </select>

        {items.length > 0 ? (
          <>
            <div style={{ flex: 1 }} />
            <button className="btn" onClick={() => exportMarkdown(items)}>📄 导出 Markdown</button>
            <button className="btn" onClick={() => exportWord(items)}>📘 导出 Word</button>
            <button className="btn" onClick={() => printToPdf(items)}>🖨 导出 PDF</button>
            <button
              className="btn btn-ghost"
              onClick={() => {
                if (confirm("确定清空所有错题？此操作不可恢复。")) {
                  for (const w of items) remove(w.id);
                }
              }}
            >
              全部清空
            </button>
          </>
        ) : null}
      </div>

      {items.length === 0 ? (
        <div className="section">
          <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--muted)" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📷</div>
            <div style={{ fontSize: 16 }}>还没有错题记录</div>
            <div style={{ fontSize: 13, marginTop: 8 }}>
              去 <a href="/assistant" style={{ color: "var(--accent)" }}>AI 学习助手</a> 点 📷 拍照传题，AI 会自动帮你分类并存进这里。
            </div>
          </div>
        </div>
      ) : null}

      <div className="section">
        {filteredGroups.map(([pid, list]) => {
          const label = pointMap[pid]?.title ?? "未分类";
          return (
            <div key={pid} style={{ marginBottom: 32 }}>
              <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 12, color: "var(--accent)" }}>
                {label} · {list.length} 题
              </div>
              <div style={{ display: "grid", gap: 12 }}>
                {list.map((w) => (
                  <WrongCard
                    key={w.id}
                    item={w}
                    onRemove={remove}
                    onRedone={markRedone}
                    practice={practiceMap[w.id]}
                    onGeneratePractice={() => generatePractice(w.id, w.question)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WrongCard({
  item,
  onRemove,
  onRedone,
  practice,
  onGeneratePractice,
}: {
  item: ReturnType<typeof useWrongItems>["items"][number];
  onRemove: (id: string) => void;
  onRedone: (id: string) => void;
  practice?: { loading: boolean; list?: PracticeItem[]; error?: string };
  onGeneratePractice: () => void;
}) {
  const [showPractice, setShowPractice] = useState(false);
  const date = new Date(item.createdAt);
  const dateStr = `${date.getMonth() + 1}/${date.getDate()} ${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;

  return (
    <div
      style={{
        border: "1px solid var(--border)",
        borderRadius: 10,
        padding: 16,
        background: item.redone ? "var(--surface-2)" : "var(--bg)",
        opacity: item.redone ? 0.7 : 1,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ fontSize: 12, color: "var(--muted)" }}>
          {dateStr}
          {item.redone ? <span style={{ marginLeft: 8, color: "var(--accent)" }}>✓ 已重做</span> : null}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-ghost" onClick={onGeneratePractice} disabled={practice?.loading}>
            {practice?.loading ? "生成中..." : "🎲 生成同类题"}
          </button>
          <button className="btn btn-ghost" onClick={() => onRedone(item.id)}>
            {item.redone ? "取消重做" : "标记重做"}
          </button>
          <button className="btn btn-ghost" onClick={() => onRemove(item.id)}>
            删除
          </button>
        </div>
      </div>

      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 4 }}>📝 题目</div>
        <MathText text={item.question} />
      </div>

      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 4 }}>💡 解答</div>
        <MathText text={item.solution} />
      </div>

      {item.similarQ ? (
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px dashed var(--border)" }}>
          <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 4 }}>🎲 AI 生成的同类变式题</div>
          <MathText text={item.similarQ} />
        </div>
      ) : null}

      {practice?.list && practice.list.length > 0 ? (
        <div style={{ marginTop: 12, padding: 12, background: "var(--surface-2)", borderRadius: 8 }}>
          <div
            style={{
              fontWeight: 600,
              fontSize: 13,
              marginBottom: 10,
              color: "var(--accent)",
              cursor: "pointer",
            }}
            onClick={() => setShowPractice((s) => !s)}
          >
            🔄 AI 生成的 {practice.list.length} 道同类题 {showPractice ? "（收起）" : "（展开）"}
          </div>
          {showPractice ? (
            <div style={{ display: "grid", gap: 10 }}>
              {practice.list.map((p, i) => (
                <PracticeItemCard key={i} index={i + 1} item={p} />
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      {practice?.error ? (
        <div style={{ marginTop: 10, fontSize: 12, color: "#dc2626" }}>⚠ {practice.error}</div>
      ) : null}

      {item.mistakeType && item.mistakeType !== "未分类" ? (
        <div
          style={{
            marginTop: 10,
            padding: "6px 10px",
            background: "var(--surface-2)",
            borderRadius: 6,
            fontSize: 12,
            color: "var(--muted)",
          }}
        >
          🏷 <strong>错因</strong>：<MathText text={item.mistakeType} />
        </div>
      ) : null}
    </div>
  );
}

function PracticeItemCard({ index, item }: { index: number; item: PracticeItem }) {
  const [showAns, setShowAns] = useState(false);
  return (
    <div style={{ borderLeft: "2px solid var(--accent)", paddingLeft: 10 }}>
      <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 4 }}>第 {index} 题</div>
      <div style={{ marginBottom: 6 }}>
        <MathText text={item.q} />
      </div>
      <button className="btn btn-ghost" style={{ fontSize: 12, padding: "4px 10px" }} onClick={() => setShowAns((s) => !s)}>
        {showAns ? "隐藏解答" : "看解答"}
      </button>
      {showAns ? (
        <div style={{ marginTop: 8, padding: 10, background: "rgba(37,99,235,0.05)", borderRadius: 6 }}>
          <MathText text={item.a} />
        </div>
      ) : null}
    </div>
  );
}
