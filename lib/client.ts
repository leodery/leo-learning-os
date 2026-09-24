import type { AiRequest, AiResponse } from "./types";

/** 浏览器端统一调用 /api/chat 的入口。Key 永远不进入浏览器。 */
export async function askAi(body: AiRequest): Promise<AiResponse> {
  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = (await res.json()) as AiResponse;
    if (!data || typeof data.text !== "string") {
      return { text: "服务返回格式异常，请稍后重试。", source: "builtin" };
    }
    return data;
  } catch (err) {
    return {
      text: `请求失败：${err instanceof Error ? err.message : String(err)}`,
      source: "builtin",
      error: "network",
    };
  }
}