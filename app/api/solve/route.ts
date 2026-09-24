import { NextResponse } from "next/server";
import { aiConfig, aiEnabled, chat } from "@/lib/ai";
import { orderedPointIds, pointMap } from "@/lib/data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SYSTEM = `你是李丹阳的私人高数导师。他是南开大学经济学类大一学生，正在学《高等数学 B（上）》。

请按以下 JSON 格式输出（严格 JSON，不要 markdown 包裹）：
{
  "extracted_text": "从图片里识别出的题目原文（LaTeX 格式，行内 $...$ 独立 $$...$$）",
  "solution": {
    "思路": "一句话说这道题考什么、用什么方法",
    "步骤": ["步骤 1", "步骤 2", ...],
    "答案": "最终答案（LaTeX）"
  },
  "mistake_category": {
    "point_ids": ["l-02", "l-04"],
    "mistake_type": "极限运算法则在 0/0 未定式上的误用",
    "explanation": "他错在 ...（1-2 句话）"
  },
  "similar": {
    "question": "一道结构相同但数字/函数不同的同类变式题（LaTeX）",
    "hint": "提示用什么方法，不要给完整解答"
  }
}

知识点 id 只能从这个列表里选：
${orderedPointIds()
  .map((id) => `${id}: ${pointMap[id]?.title ?? "?"}`)
  .join("\n")}

规则：
- 数学公式一律用 LaTeX
- 如果图片里不止一道题，选最主要的一道解析，extracted_text 里按主要题优先
- 如果图片是字写得很潦草或模糊，尽力识别，识别不出的部分写 [无法识别]
- 错题分类 point_ids 选 1-2 个最相关的`;

export async function POST(req: Request) {
  if (!aiEnabled()) {
    return NextResponse.json(
      { ok: false, error: "未配置 API Key，拍题功能不可用" },
      { status: 400 }
    );
  }

  let body: { image?: string; text?: string };
  try {
    body = (await req.json()) as { image?: string; text?: string };
  } catch {
    return NextResponse.json({ ok: false, error: "请求格式错误" }, { status: 400 });
  }

  const { image, text } = body;
  if (!image && !text) {
    return NextResponse.json(
      { ok: false, error: "请上传图片或输入题目" },
      { status: 400 }
    );
  }

  const userContent: any[] = [];
  if (image) {
    // image 已经是 data URI（data:image/png;base64,xxx 这种）
    userContent.push({
      type: "image_url",
      image_url: { url: image },
    });
    userContent.push({
      type: "text",
      text: "这是一道高数题的照片。请按系统提示的 JSON 格式输出。",
    });
  } else if (text) {
    userContent.push({
      type: "text",
      text: `这是一道高数题：\n\n${text}\n\n请按系统提示的 JSON 格式输出。`,
    });
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
          { role: "user", content: userContent },
        ],
        temperature: 0.1,
        max_tokens: 4000,
        stream: false,
        response_format: { type: "json_object" },
        thinking: { type: "disabled" },
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
    console.log("[solve] rawText preview:", rawText.slice(0, 500));

    // 尝试 JSON 解析
    let parsed: any = null;
    const start = rawText.indexOf("{");
    const end = rawText.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        parsed = JSON.parse(rawText.slice(start, end + 1));
      } catch {
        // JSON 解析失败，把原始文本返回
      }
    }

    if (!parsed) {
      return NextResponse.json({
        ok: true,
        fallback: true,
        text: rawText,
        model,
      });
    }

    return NextResponse.json({
      ok: true,
      ...parsed,
      model,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
