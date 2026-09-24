"use client";

import { useEffect, useRef, useState } from "react";
import MathText from "./MathText";
import { askAi } from "@/lib/client";
import { useWrongItems, type WrongItem } from "@/lib/wrong";

type Msg = {
  role: "user" | "assistant";
  text: string;
  source?: "ai" | "builtin";
  error?: string;
  /** user 消息里带的图片（data URI） */
  image?: string;
  /** AI 解析拍题的结构化结果 */
  solveResult?: SolveResult;
  /** AI 生成的变式题 */
  similarResult?: SimilarResult;
};

type SolveResult = {
  extracted_text?: string;
  solution?: { 思路?: string; 步骤?: string[]; 答案?: string };
  mistake_category?: {
    point_ids?: string[];
    mistake_type?: string;
    explanation?: string;
  };
  similar?: { question?: string; hint?: string };
  model?: string;
};

type SimilarResult = {
  question?: string;
  hint?: string;
  answer?: string;
};

const QUICK = [
  "我该先学极限还是先学导数？",
  "用一句话说清导数和微分的关系",
  "给我出一道极限的基础题，先别给答案",
  "我数学基础一般，怎么安排每天的学习？",
];

/** 图片压缩：保持长宽比，最大边 1200px，JPEG quality 0.8 */
async function compressImage(file: File): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  return await new Promise<string>((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const maxSide = 1200;
      let { width, height } = img;
      const scale = Math.min(1, maxSide / Math.max(width, height));
      width = Math.round(width * scale);
      height = Math.round(height * scale);

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("canvas 不可用"));
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", 0.8));
    };
    img.onerror = reject;
    img.src = dataUrl;
  });
}

/** 把拍题结果格式化成可读文本 */
function formatSolveResult(r: SolveResult): string {
  const parts: string[] = [];
  if (r.extracted_text) parts.push(`📝 识别到的题目：\n${r.extracted_text}`);
  if (r.solution?.思路) parts.push(`💡 思路：${r.solution.思路}`);
  if (r.solution?.步骤?.length) {
    parts.push(
      `📋 解题步骤：\n` +
        r.solution.步骤.map((s, i) => `  ${i + 1}. ${s}`).join("\n")
    );
  }
  if (r.solution?.答案) parts.push(`✅ 答案：${r.solution.答案}`);
  return parts.join("\n\n");
}

export default function AssistantChat({
  points,
  initialPointId = "",
}: {
  points: { id: string; title: string }[];
  initialPointId?: string;
}) {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [pointId, setPointId] = useState(initialPointId);
  const [busy, setBusy] = useState(false);
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { add: addWrong } = useWrongItems();

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [msgs, busy]);

  async function send(text: string, image?: string) {
    const value = text.trim();
    if (!value && !image) return;
    if (busy) return;
    setInput("");
    setPendingImage(null);
    setBusy(true);

    const userMsg: Msg = { role: "user", text: value || "📷 拍了一道题", image };
    setMsgs((m) => [...m, userMsg]);

    // 如果有图片，走 /api/solve（拍题流程）
    if (image) {
      try {
        const res = await fetch("/api/solve", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image }),
        });
        const data = (await res.json()) as any;

        if (!data.ok) {
          setMsgs((m) => [
            ...m,
            { role: "assistant", text: `❌ ${data.error ?? "识别失败"}` },
          ]);
          setBusy(false);
          return;
        }

        // 把结果塞进消息里
        const solve: SolveResult = data.fallback
          ? { model: data.model }
          : {
              extracted_text: data.extracted_text,
              solution: data.solution,
              mistake_category: data.mistake_category,
              similar: data.similar,
              model: data.model,
            };

        // 自动存错题
        if (data.ok && !data.fallback) {
          addWrong({
            question: data.extracted_text ?? "(图片识别失败)",
            solution: formatSolveResult(solve),
            pointIds: data.mistake_category?.point_ids ?? [],
            mistakeType: data.mistake_category?.mistake_type ?? "未分类",
            similarQ: data.similar?.question,
          });
        }

        const textReply = data.fallback
          ? data.text ?? "识别完成"
          : formatSolveResult(solve);

        setMsgs((m) => [
          ...m,
          { role: "assistant", text: textReply, source: "ai", solveResult: solve },
        ]);
      } catch (err) {
        setMsgs((m) => [
          ...m,
          {
            role: "assistant",
            text: `网络错误：${err instanceof Error ? err.message : String(err)}`,
          },
        ]);
      }
      setBusy(false);
      return;
    }

    // 纯文字问答走原有流程
    const history = msgs.map((m) => ({ role: m.role, content: m.text }));
    const res = await askAi({
      task: "ask",
      input: value,
      pointId: pointId || undefined,
      history,
    });
    setMsgs((m) => [
      ...m,
      { role: "assistant", text: res.text, source: res.source, error: res.error },
    ]);
    setBusy(false);
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("请上传图片（支持 jpg/png）");
      return;
    }
    try {
      const compressed = await compressImage(file);
      setPendingImage(compressed);
    } catch (err) {
      alert("图片处理失败：" + (err instanceof Error ? err.message : String(err)));
    }
    if (fileRef.current) fileRef.current.value = "";
  }

  async function generateSimilar(originalMsgIndex: number) {
    const msg = msgs[originalMsgIndex];
    if (!msg.solveResult?.extracted_text) return;
    setBusy(true);
    const pointIds = msg.solveResult.mistake_category?.point_ids ?? [];
    const pointId = pointIds[0] ?? "";

    try {
      const res = await fetch("/api/similar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          original: msg.solveResult.extracted_text,
          pointId,
        }),
      });
      const data = (await res.json()) as any;

      if (!data.ok) {
        setMsgs((m) => [
          ...m,
          { role: "assistant", text: `❌ 生成失败：${data.error ?? ""}` },
        ]);
      } else {
        setMsgs((m) => [
          ...m,
          {
            role: "assistant",
            text: `🎲 同类变式题：\n\n**题目**：${data.question ?? ""}\n\n**提示**：${data.hint ?? ""}\n\n**答案**：${data.answer ?? ""}`,
            source: "ai",
            similarResult: {
              question: data.question,
              hint: data.hint,
              answer: data.answer,
            },
          },
        ]);
      }
    } catch (err) {
      setMsgs((m) => [
        ...m,
        {
          role: "assistant",
          text: `网络错误：${err instanceof Error ? err.message : String(err)}`,
        },
      ]);
    }
    setBusy(false);
  }

  return (
    <div className="ai-panel">
      <div className="ai-panel-head">
        <span className="t">
          <span className="spark">✳</span> AI 学习助手
        </span>
        <select
          className="input"
          style={{ width: 210 }}
          value={pointId}
          onChange={(e) => setPointId(e.target.value)}
        >
          <option value="">不绑定知识点</option>
          {points.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title}
            </option>
          ))}
        </select>
      </div>

      <div className="chat">
        {msgs.length === 0 ? (
          <div className="ai-idle">
            这里是你的私人导师。可以问概念、问题目、问学习安排。
            <br />
            点 📷 可以拍照传题，AI 会识别 + 分类错题 + 给出同类变式题。
          </div>
        ) : null}

        {msgs.map((m, i) => (
          <div key={i} className={`msg ${m.role === "user" ? "me" : "ai"}`}>
            <span className="who">{m.role === "user" ? "我" : "AI"}</span>
            <div className="bubble">
              {m.image ? (
                <img
                  src={m.image}
                  alt="题目"
                  style={{
                    maxWidth: 320,
                    borderRadius: 8,
                    marginBottom: 8,
                    border: "1px solid var(--border)",
                  }}
                />
              ) : null}
              {m.role === "assistant" ? <MathText text={m.text} /> : m.text}
              {m.role === "assistant" && m.source === "builtin" ? (
                <div className="ai-note">
                  <span className="badge warn">内置模式</span> 未配置 API Key。
                </div>
              ) : null}
              {m.error ? <div className="ai-note">调用出错：{m.error}</div> : null}

              {/* 错题分类标签 */}
              {m.solveResult?.mistake_category &&
              m.solveResult.mistake_category.mistake_type ? (
                <div
                  style={{
                    marginTop: 12,
                    padding: "10px 12px",
                    background: "var(--surface-2)",
                    borderRadius: 8,
                    fontSize: 13,
                    borderLeft: "3px solid var(--accent)",
                  }}
                >
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>
                    🏷 错题分类
                  </div>
                  <div style={{ color: "var(--muted)", marginBottom: 4 }}>
                    <strong>错因</strong>：<MathText text={m.solveResult.mistake_category.mistake_type} />
                  </div>
                  {m.solveResult.mistake_category.explanation ? (
                    <div style={{ color: "var(--muted)" }}>
                      <MathText text={m.solveResult.mistake_category.explanation} />
                    </div>
                  ) : null}
                  {m.solveResult.mistake_category.point_ids?.length ? (
                    <div style={{ marginTop: 6, display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {m.solveResult.mistake_category.point_ids.map((pid) => (
                        <span
                          key={pid}
                          style={{
                            padding: "2px 8px",
                            background: "var(--accent)",
                            color: "#fff",
                            borderRadius: 12,
                            fontSize: 11,
                          }}
                        >
                          {points.find((p) => p.id === pid)?.title ?? pid}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : null}

              {/* 类似题按钮 */}
              {m.solveResult?.extracted_text && !m.similarResult ? (
                <div style={{ marginTop: 10 }}>
                  <button
                    className="btn btn-ghost"
                    disabled={busy}
                    onClick={() => void generateSimilar(i)}
                  >
                    🎲 给我一道同类变式题
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        ))}

        {busy ? (
          <div className="msg ai">
            <span className="who">AI</span>
            <div className="bubble">
              <span className="ai-loading">
                <span className="spinner" /> 正在思考…
              </span>
            </div>
          </div>
        ) : null}
        <div ref={endRef} />
      </div>

      <div className="composer">
        <div className="quick-row">
          {QUICK.map((s) => (
            <button key={s} type="button" className="quick" onClick={() => void send(s)}>
              {s}
            </button>
          ))}
        </div>

        {pendingImage ? (
          <div
            style={{
              marginBottom: 8,
              padding: 10,
              background: "var(--surface-2)",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <img src={pendingImage} alt="待发" style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 6 }} />
            <div style={{ flex: 1, fontSize: 13, color: "var(--muted)" }}>
              图片已就绪，点击发送开始识别
            </div>
            <button className="btn btn-ghost" onClick={() => setPendingImage(null)}>
              取消
            </button>
          </div>
        ) : null}

        <div className="composer-row">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            style={{ display: "none" }}
            onChange={handleFile}
          />
          <button
            type="button"
            className="btn btn-ghost"
            style={{ padding: "0 14px", fontSize: 20 }}
            onClick={() => fileRef.current?.click()}
            title="拍照上传"
          >
            📷
          </button>
          <textarea
            className="input"
            rows={2}
            value={input}
            placeholder={pendingImage ? "（已附图片，可加文字说明）" : "输入你的问题…"}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                void send(input, pendingImage ?? undefined);
              }
            }}
          />
          <button
            type="button"
            className="btn btn-primary"
            disabled={busy || (!input.trim() && !pendingImage)}
            onClick={() => void send(input, pendingImage ?? undefined)}
          >
            {pendingImage ? "识别" : "发送"}
          </button>
        </div>
        <div className="hint small muted mt-8">
          Ctrl + Enter 发送 · 📷 支持拍照或选相册图片
        </div>
      </div>
    </div>
  );
}
