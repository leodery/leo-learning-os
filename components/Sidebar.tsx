"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useProgress } from "@/lib/store";

const NAV = [
  { group: "工作台", items: [{ href: "/", ico: "▤", label: "仪表盘" }] },
  {
    group: "学习",
    items: [
      { href: "/math", ico: "∑", label: "高数知识库" },
      { href: "/python", ico: "Py", label: "Python 训练" },
      { href: "/econ", ico: "¥", label: "经济学" },
    ],
  },
  {
    group: "交叉",
    items: [
      { href: "/fun", ico: "🎮", label: "趣味作业" },
    ],
  },
  {
    group: "沉淀",
    items: [
      { href: "/assistant", ico: "AI", label: "AI 学习助手" },
      { href: "/wrong", ico: "📋", label: "错题本" },
      { href: "/journal", ico: "✎", label: "学习记录" },
    ],
  },
];

export default function Sidebar({
  aiOn,
  provider,
  pointTotal,
}: {
  aiOn: boolean;
  provider: string;
  pointTotal: number;
}) {
  const pathname = usePathname();
  const { mastery, logs } = useProgress();
  const mastered = Object.keys(mastery).length;

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="mark">
          <span className="dot" />
          Leo Learning OS
        </div>
        <div className="tag">高数 × Python · AI 学习工作台</div>
      </div>

      <nav className="nav">
        {NAV.map((g) => (
          <div key={g.group}>
            <div className="nav-label">{g.group}</div>
            {g.items.map((it) => {
              const active =
                it.href === "/"
                  ? pathname === "/"
                  : pathname === it.href || pathname.startsWith(`${it.href}/`);
              return (
                <Link
                  key={it.href}
                  href={it.href}
                  className={`nav-item${active ? " active" : ""}`}
                >
                  <span className="ico mono">{it.ico}</span>
                  <span className="label">{it.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="sidebar-foot">
        <div>
          知识点掌握 <span className="mono">{mastered}</span> / {pointTotal}
        </div>
        <div>
          学习记录 <span className="mono">{logs.length}</span> 条
        </div>
        <div>
          <span className={`status-dot ${aiOn ? "on" : "off"}`} />
          {aiOn ? `AI 已接入 · ${provider}` : "AI 未配置 · 内置模式"}
        </div>
      </div>
    </aside>
  );
}