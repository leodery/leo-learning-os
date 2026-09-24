import { NextResponse } from "next/server";
import { aiConfig, aiEnabled } from "@/lib/ai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SYSTEM = `你是高数出题老师。根据学生给的原题，生成一道【结构相同、数字/函数不同、难度相当】的变式题。

严格按 JSON 格式输出：
{"question": "变式题题干（LaTeX）", "hint": "解题思路提示（不要给完整答案）", "answer": "最终答案（LaTeX）"}

规则：
- 数学公式一律用 LaTeX
- 原题是计算题就换数字、换系数；原题是证明题就换函数形式
- 难度和原题严格一致，不要变难也不要变简单
- hint 只说方法方向，不给完整解答过程`;

export async function POST(req: Request) {
  if (!aiEnabled()) {
    return NextResponse.json({ ok: false, error: "未配置 API Key" }, { status: 400 });
  }

  let body: { original?: string; pointId?: string };
  try {
    body = (await req.json()) as { original?: string; pointId?: string };
  } catch {
    return NextResponse.json({ ok: false, error: "请求格式错误" }, { status: 400 });
  }

  if (!body.original) {
    return NextResponse.json(
      { ok: false, error: "请提供原题" },
      { status: 400 }
    );
  }

  const { baseUrl, apiKey, model } = aiConfig();

  try {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: SYSTEM },
          {
            role: "user",
            content: body.pointId
              ? `原题（关联知识点 ${body.pointId}）：\n\n${body.original}`
              : `原题：\n\n${body.original}`,
          },
        ],
        temperature: 0.8,
        max_tokens: 1500,
      }),
    });

    if (!res.ok) {
      const raw = await res.text().catch(() => "");
      return NextResponse.json(
        { ok: false, error: `模型接口 ${res.status}: ${raw.slice(0, 300)}` },
        { status: 502 }
      );
    }

    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const rawText = data?.choices?.[0]?.message?.content ?? "";

    // 解析 JSON
    const start = rawText.indexOf("{");
    const end = rawText.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        const parsed = JSON.parse(rawText.slice(start, end + 1));
        return NextResponse.json({ ok: true, ...parsed });
      } catch {}
    }

    return NextResponse.json({ ok: true, question: rawText, hint: "", answer: "" });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
