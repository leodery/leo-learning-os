import { funProjects } from "@/data/fun";

export default function FunPage() {
  return (
    <div className="page">
      <div className="page-head">
        <div className="eyebrow">交叉</div>
        <h1>🎮 趣味作业</h1>
        <div className="sub">
          每个项目都是 <strong>一个下午能做完</strong> 的小实验。把你的高数 + 经济学 + Python + AI 串起来。目标不是完美，是动手玩一下。
        </div>
      </div>

      <div className="section">
        {funProjects.map((p) => (
          <div
            key={p.id}
            style={{
              border: "1px solid var(--border)",
              borderRadius: 12,
              padding: 20,
              marginBottom: 16,
              background: "var(--bg)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{p.title}</div>
                <div style={{ fontSize: 12, color: "var(--muted)" }}>⏱ {p.time}</div>
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {p.stack.map((s) => (
                  <span
                    key={s}
                    style={{
                      fontSize: 11,
                      padding: "3px 10px",
                      background: "var(--accent)",
                      color: "#fff",
                      borderRadius: 12,
                    }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <p className="muted" style={{ marginBottom: 14 }}>{p.desc}</p>

            <div style={{ marginBottom: 12 }}>
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 6 }}>
                🔧 四步做完
              </div>
              <ol style={{ paddingLeft: 20, fontSize: 13, lineHeight: 1.9, color: "var(--muted)" }}>
                {p.steps.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ol>
            </div>

            <div
              style={{
                padding: "10px 14px",
                background: "var(--surface-2)",
                borderRadius: 8,
                marginBottom: 10,
              }}
            >
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>
                🎯 最终产出
              </div>
              <div style={{ fontSize: 13, color: "var(--muted)" }}>{p.outcome}</div>
            </div>

            <div style={{ fontSize: 12, color: "var(--muted)" }}>
              <strong>📎 起点参考：</strong>
              <div style={{ marginTop: 4 }}>
                {p.resources.map((r, i) => (
                  <div key={i}>• {r}</div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
