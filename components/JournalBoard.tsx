"use client";

import { useEffect, useState } from "react";
import MathText from "./MathText";
import { askAi } from "@/lib/client";
import {
  addLog,
  dayKey,
  logsToText,
  removeLog,
  streakDays,
  thisWeekLogs,
  useProgress,
} from "@/lib/store";
import type { AiResponse, StudyLog } from "@/lib/types";

const SUBJECTS: { v: StudyLog["subject"]; label: string }[] = [
  { v: "math", label: "高数" },
  { v: "python", label: "Python" },
  { v: "other", label: "其他" },
];

const MASTERY = [
  { v: 1 as const, label: "没懂" },
  { v: 2 as const, label: "有点懂" },
  { v: 3 as const, label: "懂了" },
];

function subjectLabel(s: StudyLog["subject"]) {
  return SUBJECTS.find((x) => x.v === s)?.label ?? "其他";
}

export default function JournalBoard() {
  const { logs } = useProgress();

  const [date, setDate] = useState("");
  const [subject, setSubject] = useState<StudyLog["subject"]>("math");
  const [minutes, setMinutes] = useState(45);
  const [content, setContent] = useState("");
  const [blocked, setBlocked] = useState("");
  const [mastery, setMastery] = useState<1 | 2 | 3>(2);

  const [review, setReview] = useState<AiResponse | null>(null);
  const [busy, setBusy] = useState(false);

  // 日期只能在浏览器里算，避免服务端和本地时区不一致
  useEffect(() => {
    setDate(dayKey(new Date()));
  }, []);

  const week = thisWeekLogs(logs);
  const weekMinutes = week.reduce((s, l) => s + l.minutes, 0);
  const streak = streakDays(logs);

  function save() {
    if (!date || !content.trim()) return;
    addLog({
      date,
      subject,
      minutes: Number(minutes) || 0,
      content: content.trim(),
      blocked: blocked.trim(),
      mastery,
    });
    setContent("");
    setBlocked("");
    setMastery(2);
    setMinutes(45);
  }

  async function makeReview() {
    if (busy) return;
    setBusy(true);
    const res = await askAi({ task: "review", input: logsToText(week) });
    setReview(res);
    setBusy(false);
  }

  return (
    <>
      <div className="grid grid-4 section">
        <div className="stat">
          <div className="k">连续学习</div>
          <div className="v mono">
            {streak}
            <small>天</small>
          </div>
        </div>
        <div className="stat">
          <div className="k">本周记录</div>
          <div className="v mono">
            {week.length}
            <small>条</small>
          </div>
        </div>
        <div className="stat">
          <div className="k">本周时长</div>
          <div className="v mono">
            {weekMinutes}
            <small>分钟</small>
          </div>
        </div>
        <div className="stat">
          <div className="k">累计记录</div>
          <div className="v mono">
            {logs.length}
            <small>条</small>
          </div>
        </div>
      </div>

      <div className="split">
        <div>
          <div className="section">
            <div className="section-head">
              <h2>记一条学习记录</h2>
              <span className="small muted">30 秒写完，重点是「卡在哪」</span>
            </div>
            <div className="card">
              <div className="grid grid-2">
                <div className="field">
                  <label>日期</label>
                  <input
                    className="input"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label>时长（分钟）</label>
                  <input
                    className="input"
                    type="number"
                    min={5}
                    step={5}
                    value={minutes}
                    onChange={(e) => setMinutes(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="grid grid-2">
                <div className="field">
                  <label>学什么</label>
                  <div className="seg">
                    {SUBJECTS.map((s) => (
                      <button
                        key={s.v}
                        type="button"
                        className={subject === s.v ? "on" : ""}
                        onClick={() => setSubject(s.v)}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="field">
                  <label>现在的状态</label>
                  <div className="seg">
                    {MASTERY.map((m) => (
                      <button
                        key={m.v}
                        type="button"
                        className={mastery === m.v ? "on" : ""}
                        onClick={() => setMastery(m.v)}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="field">
                <label>具体学了什么</label>
                <textarea
                  className="input"
                  rows={3}
                  value={content}
                  placeholder="例如：极限的四则运算法则，做了 6 道题，其中 2 道错在分母为零不能直接约。"
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>

              <div className="field">
                <label>卡在哪里（这条最重要）</label>
                <input
                  className="input"
                  value={blocked}
                  placeholder="例如：看不出什么时候要分子分母同除最高次幂。"
                  onChange={(e) => setBlocked(e.target.value)}
                />
                <div className="hint">
                  写不出「卡点」，复盘时就没法定位问题，周总结也只会变成空泛鼓励。
                </div>
              </div>

              <div className="btn-row">
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={!content.trim()}
                  onClick={save}
                >
                  保存记录
                </button>
              </div>
            </div>
          </div>

          <div className="section">
            <div className="section-head">
              <h2>学习时间线</h2>
              <span className="small muted">最近 {Math.min(logs.length, 30)} 条</span>
            </div>
            <div className="card">
              {logs.length === 0 ? (
                <div className="empty">
                  还没有记录。今天学完第一件事就回来写一条——哪怕只有一行。
                </div>
              ) : (
                logs.slice(0, 30).map((l, i) => (
                  <div key={`${l.date}-${i}`} className="tl-item">
                    <span className="tl-dot" />
                    <div className="grow">
                      <div className="row" style={{ padding: 0, border: 0 }}>
                        <div className="grow">
                          <div className="t">
                            {subjectLabel(l.subject)} · {l.minutes} 分钟
                          </div>
                          <div className="tl-date">{l.date}</div>
                        </div>
                        <span className="badge">
                          掌握度 {l.mastery}/3
                        </span>
                        <button
                          type="button"
                          className="btn btn-sm"
                          onClick={() => removeLog(i)}
                        >
                          删除
                        </button>
                      </div>
                      <div className="small" style={{ marginTop: 6 }}>
                        {l.content}
                      </div>
                      {l.blocked ? (
                        <div className="small muted" style={{ marginTop: 4 }}>
                          卡点：{l.blocked}
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div>
          <div className="ai-panel">
            <div className="ai-panel-head">
              <span className="t">
                <span className="spark">✳</span> 本周复盘
              </span>
            </div>
            <div className="card-body">
              <div className="small muted">
                基于本周 {week.length} 条记录生成：完成了什么 → 问题在哪 → 下周做哪三件事。
              </div>
              <div className="btn-row">
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={busy || week.length === 0}
                  onClick={() => void makeReview()}
                >
                  {busy ? "生成中…" : "生成本周复盘"}
                </button>
              </div>
              {week.length === 0 ? (
                <div className="hint small muted mt-8">本周还没有记录，先写一条。</div>
              ) : null}
            </div>
            {busy ? (
              <div className="ai-body" style={{ borderTop: "1px solid var(--line)" }}>
                <div className="ai-loading">
                  <span className="spinner" /> 正在读你的记录…
                </div>
              </div>
            ) : null}
            {!busy && review ? (
              <div className="ai-body" style={{ borderTop: "1px solid var(--line)" }}>
                <div className="ai-answer">
                  <MathText text={review.text} />
                </div>
                {review.source === "builtin" ? (
                  <div className="ai-note">
                    <span className="badge warn">内置模式</span> 配置 API Key 后才能自动生成复盘。
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}