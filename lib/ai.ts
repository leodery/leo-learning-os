export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export function aiConfig() {
  return {
    baseUrl: (process.env.AI_BASE_URL || "https://api.deepseek.com").replace(
      /\/+$/,
      ""
    ),
    apiKey: (process.env.AI_API_KEY || "").trim(),
    model: process.env.AI_MODEL || "deepseek-flash",
  };
}

export function aiEnabled(): boolean {
  return aiConfig().apiKey.length > 0;
}

export function aiProviderName(): string {
  const { baseUrl } = aiConfig();
  if (baseUrl.includes("deepseek")) return "DeepSeek";
  if (baseUrl.includes("volces")) return "火山方舟 · 豆包";
  if (baseUrl.includes("dashscope")) return "阿里百炼 · 通义";
  return baseUrl;
}

/**
 * 调用 OpenAI 兼容的 /chat/completions。
 * DeepSeek、火山方舟（豆包）、阿里百炼（通义）都用同一套格式，
 * 所以这里只写一份代码，换服务商只改环境变量。
 */
export async function chat(
  messages: ChatMessage[],
  opts: { temperature?: number; maxTokens?: number } = {}
): Promise<string> {
  const { baseUrl, apiKey, model } = aiConfig();

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: opts.temperature ?? 0.4,
      max_tokens: opts.maxTokens ?? 2400,
      stream: false,
    }),
  });

  if (!res.ok) {
    const raw = await res.text().catch(() => "");
    throw new Error(
      `模型接口返回 ${res.status}。${raw.slice(0, 400) || "（无返回内容）"}`
    );
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const text = data?.choices?.[0]?.message?.content?.trim();

  if (!text) throw new Error("模型返回内容为空，请检查模型名是否正确。");
  return text;
}