/** 知识点资源链接 */
export type Resource = {
  kind: "video" | "article" | "book" | "note";
  title: string;
  url?: string;
  note?: string;
};

/** 例题 */
export type Example = {
  q: string;
  steps: string[];
  a: string;
};

/** 高数知识点：内容与个人记录分离，本类型只描述“内容” */
export type MathPoint = {
  id: string;
  chapterId: string;
  title: string;
  /** 一句话概括 */
  summary: string;
  /** 1 = 基础必会，2 = 重点，3 = 难点 */
  level: 1 | 2 | 3;
  /** 初学者解释 */
  plain: string;
  /** 数学严谨定义（支持 $...$ 与 $$...$$） */
  formal: string;
  /** 现实 / 经济应用解释 */
  applied: string;
  pitfalls: string[];
  examples: Example[];
  /** 关联知识点 id */
  related: string[];
  resources: Resource[];
};

/** 章 */
export type Chapter = {
  id: string;
  index: string;
  title: string;
  /** 本章主线，用来判断知识点归属 */
  summary: string;
};

/** Python 阶段 */
export type PythonStage = {
  id: string;
  no: number;
  title: string;
  goal: string;
  topics: string[];
  project: {
    name: string;
    brief: string;
    checks: string[];
  };
  /** 练习题：题目 + 提示 */
  drills: { title: string; brief: string }[];
};

/** 学习日志 */
export type StudyLog = {
  date: string;
  subject: "math" | "python" | "other";
  minutes: number;
  content: string;
  blocked: string;
  mastery: 1 | 2 | 3;
};

/** AI 请求任务类型 */
export type AiTask = "explain" | "ask" | "code" | "review" | "practice";
export type ExplainMode = "plain" | "formal" | "applied";

export type AiRequest = {
  task: AiTask;
  mode?: ExplainMode;
  pointId?: string;
  input?: string;
  history?: { role: "user" | "assistant"; content: string }[];
};

export type AiResponse = {
  text: string;
  source: "ai" | "builtin";
  model?: string;
  error?: string;
};