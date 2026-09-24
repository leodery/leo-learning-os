/** 错题集导出工具（零 npm 依赖） */

import type { WrongItem } from "./wrong";
import { pointMap } from "./data";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function pointLabel(ids: string[]): string {
  const parts = ids.map((id) => pointMap[id]?.title ?? id);
  return parts.join(" + ") || "未分类";
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()} ${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
}

/** 生成 Markdown 文本 */
export function toMarkdown(items: WrongItem[]): string {
  const lines: string[] = ["# 错题本导出", "", `共 ${items.length} 题，导出时间：${formatDate(new Date().toISOString())}`, ""];
  // 按知识点分组
  const groups = new Map<string, WrongItem[]>();
  for (const w of items) {
    const key = w.pointIds[0] ?? "__other__";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(w);
  }
  for (const [pid, list] of groups) {
    lines.push(`## ${pointLabel([pid])}（${list.length} 题）`, "");
    list.forEach((w, i) => {
      lines.push(`### 第 ${i + 1} 题 · ${formatDate(w.createdAt)}`);
      lines.push("");
      if (w.mistakeType) lines.push(`**错因**：${w.mistakeType}`, "");
      lines.push("**题目**");
      lines.push("");
      lines.push(w.question);
      lines.push("");
      lines.push("**解答**");
      lines.push("");
      lines.push(w.solution);
      lines.push("");
      if (w.similarQ) {
        lines.push("**同类变式题**");
        lines.push("");
        lines.push(w.similarQ);
        lines.push("");
      }
      if (w.redone) lines.push("> ✓ 已重做", "");
      lines.push("---", "");
    });
  }
  return lines.join("\n");
}

/** 生成 HTML（可直接被 Word 打开为 .doc） */
export function toWordHtml(items: WrongItem[]): string {
  const groups = new Map<string, WrongItem[]>();
  for (const w of items) {
    const key = w.pointIds[0] ?? "__other__";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(w);
  }
  const rows: string[] = [];
  for (const [pid, list] of groups) {
    rows.push(
      `<h2>${escapeHtml(pointLabel([pid]))}（${list.length} 题）</h2>`
    );
    list.forEach((w, i) => {
      rows.push(
        `<div style="border-left:3px solid #2563eb;margin:12px 0;padding:8px 14px;background:#f8fafc;">`
      );
      rows.push(
        `<div style="color:#64748b;font-size:12px;margin-bottom:6px;">第 ${i + 1} 题 · ${formatDate(w.createdAt)}${w.redone ? " · ✓ 已重做" : ""}${w.mistakeType ? ` · 错因：${escapeHtml(w.mistakeType)}` : ""}</div>`
      );
      rows.push(`<p><b>题目：</b><br>${escapeHtml(w.question).replace(/\n/g, "<br>")}</p>`);
      rows.push(`<p><b>解答：</b><br>${escapeHtml(w.solution).replace(/\n/g, "<br>")}</p>`);
      if (w.similarQ) {
        rows.push(
          `<p style="background:#fef3c7;padding:6px 10px;border-radius:4px;"><b>同类变式：</b><br>${escapeHtml(w.similarQ).replace(/\n/g, "<br>")}</p>`
        );
      }
      rows.push(`</div>`);
    });
  }
  return `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"><title>错题本导出</title>
<style>
body{font-family:'微软雅黑',SimSun,sans-serif;line-height:1.7;color:#1e293b;max-width:800px;margin:40px auto;padding:0 20px;}
h1{border-bottom:2px solid #2563eb;padding-bottom:8px;}
h2{color:#2563eb;margin-top:32px;}
</style></head>
<body>
<h1>错题本导出</h1>
<p>共 ${items.length} 题 · 导出时间 ${formatDate(new Date().toISOString())}</p>
${rows.join("\n")}
</body></html>`;
}

/** 触发浏览器下载 Blob */
function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function exportMarkdown(items: WrongItem[]) {
  const text = toMarkdown(items);
  const blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
  downloadBlob(blob, `错题本_${Date.now()}.md`);
}

export function exportWord(items: WrongItem[]) {
  const html = toWordHtml(items);
  const blob = new Blob(["\ufeff" + html], { type: "application/msword;charset=utf-8" });
  downloadBlob(blob, `错题本_${Date.now()}.doc`);
}

/** 触发浏览器打印（用户可选择"另存为 PDF"） */
export function printToPdf(items: WrongItem[]) {
  const html = toWordHtml(items);
  const w = window.open("", "_blank", "width=900,height=700");
  if (!w) return alert("请允许弹出窗口以导出 PDF");
  w.document.open();
  w.document.write(html);
  w.document.close();
  w.onload = () => w.print();
}
