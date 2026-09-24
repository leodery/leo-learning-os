"use client";

import { useState } from "react";
import MathText from "./MathText";
import { askAi } from "@/lib/client";
import type { AiResponse } from "@/lib/types";

const SAMPLE = `scores = [78, 92, 65, 88]
total = 0
for s in scores:
    total = total + s
print("平均分：", total / len(scores))`;

/**
 * AI 代码导师。
 * 关键是顺序：先讲整体目的，再讲结构，最后才逐行——
 * 初学者最怕的就是一上来就被逐行解释淹没。
 */
export default function CodeTutor({ stageTitle }: { stageTitle?: string }) {
  const [code, setCode] = useState(SAMPLE);
  const [question, setQuestion] = useState("");
  const [res, setRes] = useState<AiResponse | null>(null);
  const [busy, setBusy] = useState(false);

  async function run() {
    if (busy) return;
    const trimmed = code.trim();
    if (!trimmed) return;
    setBusy(true);
    const q = question.trim();
    const payload = q ? `${trimmed}\n\n# ---- 我的问题 ----\n# ${q}` : trimmed;
    const out = await askAi({ task: "code", input: payload });
    setRes(out);
    setBusy(false);
  }

  return (
    <div className="ai-panel">
      <div className="ai-panel-head">
        <span className="t">
          <span className="spark">✳</span> AI 代码导师
          {stageTitle ? <span className="badge">{stageTitle}</span> : null}
        </span>
        <span className="small muted">先讲目的 → 再讲结构 → 最后逐行</span>
      </div>

      <div className="card-body">
        <div className="field">
          <label>把你的代码粘进来</label>
          <textarea
            className="input code"
            rows={9}
            spellCheck={false}
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        </div>

        <div className="field">
          <label>想问的问题（可选）</label>
          <input
            className="input"
            value={question}
            placeholder="例如：为什么 total 要写在循环外面？"
            onChange={(e) => setQuestion(e.target.value)}
          />
          <div className="hint">不填也可以，只讲解代码本身。</div>
        </div>

        <div className="btn-row">
          <button
            type="button"
            className="btn btn-primary"
            disabled={busy}
            onClick={() => void run()}
          >
            {busy ? "讲解中…" : "讲解这段代码"}
          </button>
          <button
            type="button"
            className="btn btn-sm"
            onClick={() => {
              setCode(SAMPLE);
              setQuestion("");
              setRes(null);
            }}
          >
            恢复示例
          </button>
        </div>
      </div>

      <div className="ai-body" style={{ borderTop: "1px solid var(--line)" }}>
        {busy ? (
          <div className="ai-loading">
            <span className="spinner" /> 正在按「整体 → 结构 → 逐行」的顺序拆解…
          </div>
        ) : null}

        {!busy && !res ? (
          <div className="ai-idle">
            粘贴任何 Python 代码。没有基础也没关系——讲解会假设你是第一次见这段代码。
          </div>
        ) : null}

        {res ? (
          <>
            <div className="ai-answer">
              <MathText text={res.text} />
            </div>
            <div className="ai-note">
              {res.source === "ai" ? (
                <>
                  <span className="badge brand">{res.model ?? "AI"}</span>{" "}
                  由模型生成。
                </>
              ) : (
                <>
                  <span className="badge warn">内置模式</span>{" "}
                  需要在 .env.local 里配置 AI_API_KEY 才能使用代码导师。
                </>
              )}
              {res.error ? ` 上次调用出错：${res.error}` : ""}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}