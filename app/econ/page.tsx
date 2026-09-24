import { econCourses, econConcepts } from "@/data/econ";
import { funProjects } from "@/data/fun";

export default function EconPage() {
  return (
    <div className="page">
      <div className="page-head">
        <div className="eyebrow">板块</div>
        <h1>经济学</h1>
        <div className="sub">
          南开大学大一经济学类 · 《高等数学 B》的经济学应用入口。学完一个高数概念，就去看它在经济学里真的长什么样。
        </div>
      </div>

      {/* 1. 校内课程入口 + 外部资源 */}
      <div className="section">
        <h2 className="h2">📚 课程资源</h2>
        <div className="grid-2">
          {econCourses.map((c) => (
            <a
              key={c.id}
              href={c.url}
              target="_blank"
              rel="noreferrer"
              className="card-link"
            >
              <div className="card-head">
                <span className="badge">{c.platform}</span>
                <span style={{ fontSize: 12, color: "var(--muted)" }}>{c.provider}</span>
              </div>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>{c.title}</div>
              <div style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6 }}>{c.note}</div>
            </a>
          ))}
        </div>
      </div>

      {/* 2. 核心概念 + 交叉锚点 */}
      <div className="section">
        <h2 className="h2">🔗 高数 × 经济学交叉点</h2>
        <p className="muted">
          左边是经济学你会遇到的概念，右边告诉你它在高数里是谁、在 Python 里能做什么、AI 能帮你玩出什么花。
        </p>
        <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
          {econConcepts.map((c) => (
            <div
              key={c.id}
              style={{
                border: "1px solid var(--border)",
                borderRadius: 10,
                padding: 16,
                background: "var(--bg)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
                <div style={{ flex: "1 1 300px", minWidth: 280 }}>
                  <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 6 }}>{c.title}</div>
                  <div style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6 }}>{c.desc}</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: "1 1 300px", minWidth: 280 }}>
                  {c.cross.map((tag) => {
                    let color = "var(--accent)";
                    let icon = "";
                    if (tag.startsWith("高数")) { color = "#4f8ef7"; icon = "∑"; }
                    if (tag.startsWith("Python")) { color = "#4db8ff"; icon = "🐍"; }
                    if (tag.startsWith("AI")) { color = "#2dd4bf"; icon = "✳"; }
                    return (
                      <span
                        key={tag}
                        style={{
                          fontSize: 12,
                          padding: "4px 10px",
                          background: color + "20",
                          color: color,
                          borderRadius: 14,
                          display: "inline-block",
                        }}
                      >
                        {icon} {tag}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. 趣味作业桥接 */}
      <div className="section">
        <h2 className="h2">🎮 动手玩一下（趣味作业）</h2>
        <p className="muted">
          下面每个都是 <strong>一个下午能做完</strong> 的小项目——把你的数学 + Python + AI 三样都串起来。点击去 <a href="/fun" style={{ color: "var(--accent)" }}>趣味作业</a> 看完整列表。
        </p>
        <div className="grid-2" style={{ marginTop: 12 }}>
          {funProjects.slice(0, 3).map((p) => (
            <a key={p.id} href="/fun" className="card-link">
              <div className="card-head">
                <span className="badge">趣味作业</span>
                <span style={{ fontSize: 12, color: "var(--muted)" }}>{p.time}</span>
              </div>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>{p.title}</div>
              <div style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6 }}>{p.desc}</div>
              <div style={{ marginTop: 8, display: "flex", gap: 6 }}>
                {p.stack.map((s) => (
                  <span
                    key={s}
                    style={{
                      fontSize: 11,
                      padding: "2px 8px",
                      background: "var(--surface-2)",
                      color: "var(--muted)",
                      borderRadius: 10,
                    }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
