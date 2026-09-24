"use client";

import { togglePyProject, togglePyTopic, useProgress } from "@/lib/store";
import type { PythonStage } from "@/lib/types";

/** 四阶段路线。阶段是否"完成"由你自己勾，系统不替你判断。 */
export default function PyTracker({ stages }: { stages: PythonStage[] }) {
  const { py } = useProgress();

  return (
    <>
      {stages.map((s) => {
        const prog = py[s.id] ?? { topics: [], project: false };
        const doneCount = s.topics.filter((t) => prog.topics.includes(t)).length;
        const allDone = doneCount === s.topics.length && prog.project;
        const started = doneCount > 0 || prog.project;

        return (
          <div
            key={s.id}
            className={`stage${allDone ? " done" : started ? " active" : ""}`}
          >
            <div className="no">0{s.no}</div>
            <div className="stage-main">
              <h3>{s.title}</h3>
              <div className="stage-goal">{s.goal}</div>

              <div className="bar-row">
                <div className={`bar${allDone ? " ok" : ""}`}>
                  <i
                    style={{
                      width: `${Math.round((doneCount / s.topics.length) * 100)}%`,
                    }}
                  />
                </div>
                <span className="num mono">
                  {doneCount}/{s.topics.length}
                </span>
              </div>

              <div className="mt-8">
                {s.topics.map((t) => {
                  const on = prog.topics.includes(t);
                  return (
                    <label key={t} className={`check${on ? " done" : ""}`}>
                      <input
                        type="checkbox"
                        checked={on}
                        onChange={() => togglePyTopic(s.id, t)}
                      />
                      <span>{t}</span>
                    </label>
                  );
                })}
              </div>

              <div className="stage-project">
                <div className="pk">绑定项目</div>
                <div className="pn">{s.project.name}</div>
                <div className="pb">{s.project.brief}</div>
                <div className="mt-8">
                  {s.project.checks.map((c) => (
                    <div key={c} className="small muted">
                      · {c}
                    </div>
                  ))}
                </div>
                <label className={`check${prog.project ? " done" : ""}`}>
                  <input
                    type="checkbox"
                    checked={prog.project}
                    onChange={() => togglePyProject(s.id)}
                  />
                  <span>这个项目我已经能自己写出来了</span>
                </label>
              </div>

              <div className="mt-12">
                <div className="pk small muted" style={{ fontWeight: 600 }}>
                  练习题
                </div>
                {s.drills.map((d) => (
                  <div key={d.title} className="mt-8">
                    <div style={{ fontSize: 13.5, fontWeight: 500 }}>{d.title}</div>
                    <div className="small muted">{d.brief}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}