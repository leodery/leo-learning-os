import type { ExplainMode, MathPoint } from "./types";

/**
 * 未配置 API Key 时的降级内容。
 * 它不是"假 AI"，而是直接由知识点自身结构化的内容拼装，
 * 保证系统在没有模型的情况下依然可用、可读。
 */

export function builtinExplain(point: MathPoint, mode: ExplainMode): string {
  const parts: string[] = [];

  if (mode === "plain") {
    parts.push(
      `一、一句话理解\n${point.summary}`,
      `二、先说人话\n${point.plain}`
    );
    if (point.pitfalls.length) {
      parts.push(`三、容易踩的坑\n${point.pitfalls.map((x, i) => `${i + 1}. ${x}`).join("\n")}`);
    }
  } else if (mode === "formal") {
    parts.push(`一、严谨表述\n${point.formal}`);
    if (point.examples.length) {
      parts.push(
        `二、用它做一道题\n${point.examples
          .map((e, i) => `例 ${i + 1}：${e.q}\n${e.steps.map((s, j) => `  (${j + 1}) ${s}`).join("\n")}\n  结论：${e.a}`)
          .join("\n\n")}`
      );
    }
    if (point.pitfalls.length) {
      parts.push(`三、定义里最容易忽略的地方\n${point.pitfalls.map((x) => `· ${x}`).join("\n")}`);
    }
  } else {
    parts.push(`一、它有什么用\n${point.applied}`);
    if (point.pitfalls.length) {
      parts.push(`二、用错就会出问题\n${point.pitfalls.map((x) => `· ${x}`).join("\n")}`);
    }
  }

  parts.push(
    `下一步：${nextAction(point)}`
  );

  return parts.join("\n\n");
}

function nextAction(point: MathPoint): string {
  if (point.examples.length) {
    return `合上解答，把上面那道例题独立做一遍；做完再回来对照步骤，重点看自己卡在哪一步。`;
  }
  return `先用自己的话把这个概念讲一遍（对着空气讲也行）；讲不顺畅的地方，就是还没真懂的地方，回到「通俗解释」再看一遍。`;
}

export const BUILTIN_NOTE =
  "以上为「内置讲解」：由知识点本身的结构化内容拼装，不是模型生成的。配置 API Key 后，这里会由模型结合你的历史掌握度重新讲解。";

export const BUILTIN_ASK_NOTE =
  "当前未配置 API Key，自由问答不可用。请把 .env.example 复制为 .env.local 并填入 AI_API_KEY，然后重启服务。上面给出的是该知识点的内置内容，可先用来复习。";

export const BUILTIN_CODE_NOTE =
  "当前未配置 API Key，AI 代码导师不可用。配置 AI_API_KEY 后即可获得逐行讲解。";

export function builtinAsk(point: MathPoint | null, question: string): string {
  if (!point) {
    return BUILTIN_ASK_NOTE;
  }
  return `${builtinExplain(point, "plain")}\n\n——\n${BUILTIN_ASK_NOTE}\n\n你的问题：「${question}」`;
}