"use client";

import { setMastery, useProgress } from "@/lib/store";

const LEVELS = [
  { v: 1 as const, label: "未学" },
  { v: 2 as const, label: "有印象" },
  { v: 3 as const, label: "能独立做" },
];

/** 知识点详情页里的掌握度切换 */
export function MasteryControl({ pointId }: { pointId: string }) {
  const { mastery } = useProgress();
  const cur = mastery[pointId];

  return (
    <div className="field">
      <label>我的掌握度</label>
      <div className="seg">
        {LEVELS.map((l) => (
          <button
            key={l.v}
            type="button"
            className={cur === l.v ? "on" : ""}
            onClick={() => setMastery(pointId, l.v)}
          >
            {l.label}
          </button>
        ))}
      </div>
      <div className="hint">
        {cur
          ? "再点一次可以取消。这个标记只存在你的浏览器里。"
          : "点一下记录你现在的真实状态——不用美化，标记错了反而误导复习。"}
      </div>
    </div>
  );
}

/** 列表里显示的三格掌握度 */
export function Pips({ pointId }: { pointId: string }) {
  const { mastery } = useProgress();
  const cur = mastery[pointId] ?? 0;
  return (
    <span className="pips" title={cur ? `掌握度 ${cur}/3` : "未标记"}>
      <i className={cur >= 1 ? "f1" : ""} />
      <i className={cur >= 2 ? "f2" : ""} />
      <i className={cur >= 3 ? "f3" : ""} />
    </span>
  );
}