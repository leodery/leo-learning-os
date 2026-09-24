"use client";

import { useCallback, useEffect, useState } from "react";
import MathText from "./MathText";
import { askAi } from "@/lib/client";
import type { AiResponse, ExplainMode } from "@/lib/types";

const MODES: { v: ExplainMode; label: string }[] = [
  { v: "plain", label: "通俗理解" },
  { v: "formal", label: "严谨定义" },
  { v: "applied", label: "现实应用" },
];

function SourceTag({ res }: { res: AiResponse }) {
  if (res.source === "ai") {
    return <span className="badge brand">{res.model ?? "AI"}</span>;
  }
  if (res.error) {
    return <span className="badge danger">降级讲解</span>;
  }
  return <span className="badge">内置讲解</span>;
}

/**
 * 知识点详情页的 AI 面板。
 * 三个档位不是"详略程度"，而是三种理解路径：
 * 先看清长什么样 → 再看数学怎么说 → 最后看它能干什么。
 */
export default function AiPanel({
  pointId,
  pointTitle,
}: {
  pointId: string;
  pointTitle: string;
}) {
  const [mode, setMode] = useState<ExplainMode>("plain");
  const [main, setMain] = useState<AiResponse | null>(null);
  const [busy, setBusy] = useState(false);
  const [thread, setThread] = useState<{ q: string; a: AiResponse }[]>([]);
  const [q, setQ] = useState("");

  const explain = useCallback(
    async (m: ExplainMode) => {
      setMode(m);
      setBusy(true);
      const res = await askAi({ task: "explain", mode: m, pointId });
      setMain(res);
      setBusy(false);
    },
    [pointId]
  );

  useEffect(() => {
    void explain("plain");
  }, [explain]);

  async function send(text: string) {
    const value = text.trim();
    if (!value || busy) return;
    setQ("");
    setBusy(true);
    const history = thread.flatMap((t) => [
      { role: "user" as const, content: t.q },
      { role: "assistant" as const, content: t.a.text },
    ]);
    const res = await askAi({ task: "ask", pointId, input: value, history });
    setThread((t) => [...t, { q: value, a: res }]);
    setBusy(false);
  }

  return (
    <div className="ai-panel">
      <div className="ai-panel-head">
        <span className="t">
          <span className="spark">✳</span> AI 导师讲解
        </span>
        <div className="seg">
          {MODES.map((m) => (
            <button
              key={m.v}
              type="button"
              className={mode === m.v ? "on" : ""}
              disabled={busy}
              onClick={() => void explain(m.v)}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="ai-body">
        {busy && !main ? (
          <div className="ai-loading">
            <span className="spinner" /> 正在讲解「{pointTitle}」…
          </div>
        ) : null}

        {main ? (
          <>
            <div className="ai-answer">
              <MathText text={main.text} />
            </div>
            <div className="ai-note">
              <SourceTag res={main} />{" "}
              {main.source === "builtin"
                ? "当前是内置内容（来自知识点自身），配置 API Key 后由模型重新讲解。"
                : "由模型结合知识库素材生成。"}
              {main.error ? ` 上次调用出错：${main.error}` : ""}
            </div>
          </>
        ) : null}

        {thread.map((t, i) => (
          <div key={i} className="mt-16">
            <div className="ai-note" style={{ borderTop: 0, marginTop: 0 }}>
              你问：{t.q}
            </div>
            <div className="ai-answer mt-8">
              <MathText text={t.a.text} />
            </div>
            <div className="ai-note">
              <SourceTag res={t.a} />
              {t.a.error ? ` 上次调用出错：${t.a.error}` : ""}
            </div>
          </div>
        ))}
      </div>

      <div className="composer">
        <div className="quick-row">
          {[
            "这个条件去掉之后会怎样？",
            "给我一个最直观的例子",
            "考试里这里最容易错在哪？",
          ].map((s) => (
            <button key={s} type="button" className="quick" onClick={() => void send(s)}>
              {s}
            </button>
          ))}
        </div>
        <div className="composer-row">
          <textarea
            className="input"
            rows={2}
            value={q}
            placeholder="问一个具体问题。比如：为什么连续一定需要极限？"
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                void send(q);
              }
            }}
          />
          <button
            type="button"
            className="btn btn-primary"
            disabled={busy}
            onClick={() => void send(q)}
          >
            {busy ? "思考中" : "提问"}
          </button>
        </div>
        <div className="hint small muted mt-8">Ctrl + Enter 发送</div>
      </div>
    </div>
  );
}