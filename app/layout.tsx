import type { Metadata } from "next";
import "katex/dist/katex.min.css";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { aiEnabled, aiProviderName } from "@/lib/ai";
import { stats } from "@/lib/data";

export const metadata: Metadata = {
  title: "Leo Learning OS · 高数 × Python AI 学习工作台",
  description:
    "AI 驱动的个性化学习工作台：高数知识库、Python 训练、AI 导师讲解与学习复盘。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>
        <div className="app">
          <Sidebar
            aiOn={aiEnabled()}
            provider={aiProviderName()}
            pointTotal={stats().points}
          />
          <main className="main">{children}</main>
        </div>
      </body>
    </html>
  );
}