"use client";

import katex from "katex";
import { useMemo } from "react";

/**
 * 把一段文本里的 $...$ 与 $$...$$ 渲染成真正的数学公式。
 * 后端（模型）只负责输出 LaTeX，渲染交给 KaTeX——
 * 这样公式和文字混排也不会乱，而且离线可用、不依赖网络。
 */

type Seg =
  | { type: "text" | "inline" | "block"; value: string }
  | { type: "code"; lang: string; value: string };

const MATH = /\$\$([\s\S]+?)\$\$|\$([^$\n]+?)\$/g;
const FENCE = /```([a-zA-Z0-9+#-]*)\n?([\s\S]*?)```/g;

/** 先把 ``` 代码块切出来，剩下的文字再切数学公式 */
function split(text: string): Seg[] {
  const segs: Seg[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  FENCE.lastIndex = 0;

  while ((m = FENCE.exec(text)) !== null) {
    if (m.index > last) segs.push(...splitMath(text.slice(last, m.index)));
    segs.push({ type: "code", lang: m[1] ?? "", value: m[2].replace(/\n$/, "") });
    last = m.index + m[0].length;
  }
  if (last < text.length) segs.push(...splitMath(text.slice(last)));
  return segs;
}

function splitMath(text: string): Seg[] {
  const segs: Seg[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  MATH.lastIndex = 0;
  while ((m = MATH.exec(text)) !== null) {
    if (m.index > last) {
      segs.push({ type: "text", value: text.slice(last, m.index) });
    }
    if (m[1] !== undefined) segs.push({ type: "block", value: m[1] });
    else if (m[2] !== undefined) segs.push({ type: "inline", value: m[2] });
    last = m.index + m[0].length;
  }
  if (last < text.length) segs.push({ type: "text", value: text.slice(last) });
  return segs;
}

function toHtml(tex: string, display: boolean): string | null {
  try {
    return katex.renderToString(tex.trim(), {
      displayMode: display,
      throwOnError: false,
      strict: false,
    });
  } catch {
    return null;
  }
}

export default function MathText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const segs = useMemo(() => split(text), [text]);

  return (
    <span className={className}>
      {segs.map((s, i) => {
        if (s.type === "code") {
          return (
            <pre key={i}>
              <code>{s.value}</code>
            </pre>
          );
        }
        if (s.type === "text") {
          return (
            <span key={i} style={{ whiteSpace: "pre-wrap" }}>
              {s.value}
            </span>
          );
        }
        const html = toHtml(s.value, s.type === "block");
        if (!html) {
          // 公式写错了也照样把原文显示出来，不吞掉内容
          return (
            <span key={i} className="code-inline">
              {s.type === "block" ? `$$${s.value}$$` : `$${s.value}$`}
            </span>
          );
        }
        if (s.type === "block") {
          return (
            <span
              key={i}
              className="math-block"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        }
        return <span key={i} dangerouslySetInnerHTML={{ __html: html }} />;
      })}
    </span>
  );
}