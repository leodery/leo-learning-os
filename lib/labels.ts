/** 知识点难度标签，服务端与客户端共用 */
export const LEVEL_LABEL: Record<number, string> = {
  1: "必会",
  2: "重点",
  3: "难点",
};

export const SUBJECT_LABEL = {
  math: "高数",
  python: "Python",
  other: "其他",
} as const;