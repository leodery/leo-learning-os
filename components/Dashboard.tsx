"use client";

import Link from "next/link";
import { Bar, StatCard } from "./Bits";
import {
  streakDays,
  thisWeekLogs,
  todayMinutes,
  useProgress,
} from "@/lib/store";

type PointLite = { id: string; title: string; chapterId: string };

export default function Dashboard({
  points,
  chapters,
  pyStages,
}: {
  points: PointLite[];
  chapters: { id: string; index: string; title: string; total: number }[];
  pyStages: { id: string; no: number; title: string; topics: string[] }[];
}) {
  const { mastery, logs, py } = useProgress();

  const marked = points.filter((p) => (mastery[p.id] ?? 0) >= 1).length;
  const solid = points.filter((p) => (mastery[p.id] ?? 0) === 3).length;
  const streak = streakDays(logs);
  const week = thisWeekLogs(logs);
  const weekMinutes = week.reduce((s, l) => s + l.minutes, 0);

  const weak = points.filter((p) => {
    const m = mastery[p.id] ?? 0;
    return m === 1 || m === 2;
  });
  const unmarked = points.filter((p) => !mastery[p.id]);

  const pyActive = pyStages.find((s) => {
    const prog = py[s.id];
    return !prog || !prog.project || prog.topics.length < s.topics.length;
  });
  const pyNextTopic = pyActive
    ? pyActive.topics.find((t) => !(py[pyActive.id]?.topics ?? []).includes(t))
    : null;

  const today = todayMinutes(logs);

  const tasks: { text: string; to?: string }[] = [];
  if (today === 0) {
    tasks.push({ text: "写一条学习记录：今天学了什么、卡在哪（30 秒）", to: "/journal" });
  } else {
    tasks.push({ text: `今天已记录 ${today} 分钟，保持住`, to: "/journal" });
  }
  if (weak.length) {
    tasks.push({
      text: `重过一遍「${weak[0].title}」——你标记过还没吃透`,
      to: `/math/${weak[0].id}`,
    });
  }
  if (unmarked.length) {
    tasks.push({
      text: `新学「${unmarked[0].title}」并标记掌握度`,
      to: `/math/${unmarked[0].id}`,
    });
  }
  if (pyActive && pyNextTopic) {
    tasks.push({
      text: `Python 阶段 ${pyActive.no} 继续：${pyNextTopic}`,
      to: "/python",
    });
  }

  return (
    <>
      <div className="grid grid-4 section">
        <StatCard k="知识点已过" v={`${marked}`} unit={`/ ${points.length}`} />
        <StatCard k="能独立做" v={`${solid}`} unit={`/ ${points.length}`} />
        <StatCard k="本周学习" v={`${weekMinutes}`} unit="分钟" />
        <StatCard k="连续学习" v={`${streak}`} unit="天" />
      </div>

      <div className="split section">
        <div>
          <div className="section-head">
            <h2>今天做什么</h2>
            <span className="small muted">按当前进度自动排的，不用自己想</span>
          </div>
          <div className="card">
            {tasks.length === 0 ? (
              <div className="empty">所有知识点都已标记为「能独立做」。去做 Python 项目吧。</div>
            ) : (
              <div className="rows">
                {tasks.slice(0, 4).map((t, i) => (
                  <div key={i} className="row">
                    <span className="mono muted small nowrap">{i + 1}</span>
                    <div className="grow">
                      <div className="t">
                        {t.to ? <Link href={t.to}>{t.text}</Link> : t.text}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="section-head mt-20">
            <h2>高数章节进度</h2>
            <Link href="/math" className="small">
              进入知识库
            </Link>
          </div>
          <div className="card">
            {chapters.map((c) => {
              const own = points.filter((p) => p.chapterId === c.id);
              const done = own.filter((p) => (mastery[p.id] ?? 0) >= 2).length;
              return (
                <div key={c.id} className="mb-12">
                  <div className="row" style={{ padding: "0 0 6px", border: 0 }}>
                    <div className="grow">
                      <div className="t">
                        <span className="mono muted small">{c.index} </span>
                        {c.title}
                      </div>
                    </div>
                    <span className="small muted mono">
                      {done}/{own.length || c.total}
                    </span>
                  </div>
                  <Bar value={done} total={own.length || 1} />
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <div className="section-head">
            <h2>复习提醒</h2>
            <span className="small muted">标记过还没吃透的</span>
          </div>
          <div className="card">
            {weak.length === 0 ? (
              <div className="empty">
                暂无。去知识库里给知识点标记掌握度，这里才会有内容。
              </div>
            ) : (
              <div className="rows">
                {weak.slice(0, 6).map((p) => (
                  <div key={p.id} className="row">
                    <div className="grow">
                      <div className="t">
                        <Link href={`/math/${p.id}`}>{p.title}</Link>
                      </div>
                      <div className="s">掌握度 {mastery[p.id]}/3</div>
                    </div>
                    <span
                      className={`badge ${mastery[p.id] === 1 ? "danger" : "warn"}`}
                    >
                      {mastery[p.id] === 1 ? "没懂" : "有点懂"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="section-head mt-20">
            <h2>本周目标</h2>
            <span className="small muted">建议值，可自行调整</span>
          </div>
          <div className="card">
            <div className="mb-12">
              <div className="row" style={{ padding: "0 0 6px", border: 0 }}>
                <div className="grow">
                  <div className="t">学习记录</div>
                </div>
                <span className="small muted mono">{week.length}/5 条</span>
              </div>
              <Bar value={week.length} total={5} />
            </div>
            <div className="mb-12">
              <div className="row" style={{ padding: "0 0 6px", border: 0 }}>
                <div className="grow">
                  <div className="t">学习时长</div>
                </div>
                <span className="small muted mono">{weekMinutes}/300 分钟</span>
              </div>
              <Bar value={weekMinutes} total={300} />
            </div>
            <div>
              <div className="row" style={{ padding: "0 0 6px", border: 0 }}>
                <div className="grow">
                  <div className="t">新掌握知识点</div>
                </div>
                <span className="small muted mono">{solid}/{points.length}</span>
              </div>
              <Bar value={solid} total={points.length} />
            </div>
          </div>

          <div className="section-head mt-20">
            <h2>长期目标</h2>
          </div>
          <div className="card">
            <div className="small" style={{ lineHeight: 1.8 }}>
              <strong>大一阶段：基础建设</strong>
              <br />
              经济学基础（微观 / 宏观 / 计量）+ AI 工具能力 + 数据能力（Python / SQL）。
              <br />
              阶段成果：2–3 个 AI 应用项目 · 个人网站 · GitHub 作品集。
            </div>
            <div className="ai-note">
              这不是系统给你定的，是你自己写的成长路线。仪表盘只负责提醒你走到哪了。
            </div>
          </div>
        </div>
      </div>
    </>
  );
}