import CodeTutor from "@/components/CodeTutor";
import PyTracker from "@/components/PyTracker";
import { Note } from "@/components/Bits";
import { pythonStages } from "@/lib/data";
import { pythonCourses } from "@/data/python";

export default function PythonPage() {
  const school = pythonCourses.filter((c) => c.kind === "school");
  const bili = pythonCourses.filter((c) => c.kind === "bili");
  const mooc = pythonCourses.filter((c) => c.kind === "mooc");

  return (
    <div className="page">
      <div className="page-head">
        <div className="eyebrow">Python</div>
        <h1>人工智能与创新（Python）</h1>
        <div className="sub">
          南开校内课程 · 用 Python 解决「高考赋分 + 平行志愿填报」真实项目。不教你全语法，让你边做边学。
        </div>
      </div>

      <div className="section">
        <Note>
          <strong>这门课为什么对经济学学生特别好？</strong>
          <br />
          因为它的项目本身就是经济学问题——<strong>从一批原始数据算出每个人的等级分、位次、再结合往年数据推荐志愿</strong>。
          你学的不只是 Python，而是「数据 → 计算 → 决策」这条经济学家每天都在走的链路。
          你结课作品就是一个能真正帮人的小工具——拿去给自己或学弟学妹报志愿都用得上。
          <br />
          <strong>怎么用这个页面：</strong>下面的「章节进度」完全对齐学校课程的 5 章主线 + AI 基础篇。
          每章都写明了：你需要先会什么、学完能做出什么、怎么检验自己真的会了。
          如果学校的某章讲 Python 语法讲得太快，B 站精选里有口碑好的小白课可以补。
        </Note>
      </div>

      {/* —— 资源区 —— */}
      <div className="section-head">
        <h2>🎓 课程资源</h2>
        <span className="small muted">学校的 + B 站口碑好的 + 免费 MOOC，任选一条路线</span>
      </div>

      {/* 校内入口 */}
      {school.length ? (
        <div className="section">
          <div style={{ fontWeight: 600, marginBottom: 10, color: "var(--accent)" }}>🏫 学校官方平台（优先）</div>
          <div className="grid-2">
            {school.map((c) => (
              <a key={c.id} href={c.url} target="_blank" rel="noreferrer" className="card-link">
                <div className="card-head">
                  <span className="badge">校内</span>
                  <span style={{ fontSize: 12, color: "var(--muted)" }}>{c.provider}</span>
                </div>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>{c.title}</div>
                <div style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6 }}>{c.note}</div>
              </a>
            ))}
          </div>
        </div>
      ) : null}

      {/* B 站精选 */}
      {bili.length ? (
        <div className="section">
          <div style={{ fontWeight: 600, marginBottom: 10, color: "var(--accent)" }}>📺 B 站口碑精选（小白友好 · 学校课的语法补漏）</div>
          <div className="grid-2">
            {bili.map((c) => (
              <a key={c.id} href={c.url} target="_blank" rel="noreferrer" className="card-link">
                <div className="card-head">
                  <span className="badge" style={{ background: "#fb7299", color: "#fff" }}>B 站</span>
                  <span style={{ fontSize: 12, color: "var(--muted)" }}>{c.provider}</span>
                </div>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>{c.title}</div>
                <div style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6 }}>{c.note}</div>
              </a>
            ))}
          </div>
        </div>
      ) : null}

      {/* MOOC */}
      {mooc.length ? (
        <div className="section">
          <div style={{ fontWeight: 600, marginBottom: 10, color: "var(--accent)" }}>📚 国家级精品课（免费 · 嵩天 Python）</div>
          <div className="grid-2">
            {mooc.map((c) => (
              <a key={c.id} href={c.url} target="_blank" rel="noreferrer" className="card-link">
                <div className="card-head">
                  <span className="badge">MOOC</span>
                  <span style={{ fontSize: 12, color: "var(--muted)" }}>{c.provider}</span>
                </div>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>{c.title}</div>
                <div style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6 }}>{c.note}</div>
              </a>
            ))}
          </div>
        </div>
      ) : null}

      {/* —— 学校 5 章主线 —— */}
      <div className="section-head mt-20">
        <h2>📖 学校课程 · 章节进度</h2>
        <span className="small muted">完全对齐南开学堂课程结构图，学完一章勾一章</span>
      </div>

      <div className="section">
        <PyTracker stages={pythonStages} />
      </div>

      <div className="section-head mt-20">
        <h2>AI 代码导师</h2>
        <span className="small muted">看不懂的代码直接粘进来</span>
      </div>

      <CodeTutor />
    </div>
  );
}
