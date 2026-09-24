import { NextResponse } from "next/server";
import { aiEnabled, aiProviderName, chat, type ChatMessage } from "@/lib/ai";
import { getPoint } from "@/lib/data";
import {
  askSystem,
  codeSystem,
  explainSystem,
  explainUser,
  practiceSystem,
  reviewSystem,
} from "@/lib/prompts";
import {
  BUILTIN_ASK_NOTE,
  BUILTIN_CODE_NOTE,
  BUILTIN_NOTE,
  builtinAsk,
  builtinExplain,
} from "@/lib/fallback";
import type { AiRequest, AiResponse, ExplainMode, MathPoint } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** 没有 Key、或调用失败时，退回内置内容 */
function fallback(body: AiRequest, point: MathPoint | null): AiResponse {
  const mode = (body.mode ?? "plain") as ExplainMode;

  if (body.task === "explain" && point) {
    return {
      text: `${builtinExplain(point, mode)}\n\n——\n${BUILTIN_NOTE}`,
      source: "builtin",
    };
  }
  if (body.task === "ask") {
    return { text: builtinAsk(point, body.input ?? ""), source: "builtin" };
  }
  if (body.task === "code") {
    return { text: BUILTIN_CODE_NOTE, source: "builtin" };
  }
  return {
    text: `当前未配置 API Key，周复盘不可用。\n\n请把 .env.example 复制为 .env.local，填入 AI_API_KEY 后重启服务。\n之后这里会根据你的学习记录自动生成周总结：完成了什么、问题在哪、下周做哪三件事。\n\n——\n${BUILTIN_ASK_NOTE}`,
    source: "builtin",
  };
}

function buildMessages(body: AiRequest, point: MathPoint | null): ChatMessage[] {
  switch (body.task) {
    case "explain": {
      if (!point) throw new Error("缺少知识点 id");
      const mode = (body.mode ?? "plain") as ExplainMode;
      return [
        { role: "system", content: explainSystem(mode, point) },
        { role: "user", content: explainUser(mode, point) },
      ];
    }
    case "ask": {
      const history: ChatMessage[] = (body.history ?? [])
        .slice(-6)
        .map((h) => ({ role: h.role, content: h.content }));
      return [
        { role: "system", content: askSystem(point) },
        ...history,
        { role: "user", content: body.input ?? "" },
      ];
    }
    case "code": {
      const code = (body.input ?? "").trim();
      if (!code) throw new Error("代码为空");
      return [
        { role: "system", content: codeSystem() },
        {
          role: "user",
          content: `请讲解这段 Python 代码：\n\n\`\`\`python\n${code}\n\`\`\``,
        },
      ];
    }
    case "practice": {
      const question = (body.input ?? "").trim();
      if (!question) throw new Error("题目为空");
      return [
        { role: "system", content: practiceSystem() },
        { role: "user", content: `基于这道错题生成 5 道同类变式题：\n\n${question}` },
      ];
    }
    case "review": {
      return [
        { role: "system", content: reviewSystem(body.input ?? "") },
        { role: "user", content: "请生成这周的学习复盘。" },
      ];
    }
    default:
      throw new Error("未知的任务类型");
  }
}

export async function POST(req: Request) {
  let body: AiRequest;
  try {
    body = (await req.json()) as AiRequest;
  } catch {
    return NextResponse.json<AiResponse>(
      { text: "请求格式错误。", source: "builtin" },
      { status: 400 }
    );
  }

  const point = body.pointId ? getPoint(body.pointId) : null;

  if (!aiEnabled()) {
    return NextResponse.json(fallback(body, point));
  }

  try {
    const text = await chat(buildMessages(body, point));
    return NextResponse.json<AiResponse>({
      text,
      source: "ai",
      model: aiProviderName(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const fb = fallback(body, point);
    return NextResponse.json<AiResponse>({ ...fb, error: message });
  }
}