/** 一些到处都要用的小零件，集中放，避免每个页面重复写 */

export function StatCard({
  k,
  v,
  unit,
}: {
  k: string;
  v: string;
  unit?: string;
}) {
  return (
    <div className="stat">
      <div className="k">{k}</div>
      <div className="v mono">
        {v}
        {unit ? <small>{unit}</small> : null}
      </div>
    </div>
  );
}

export function Bar({ value, total }: { value: number; total: number }) {
  const pct = total > 0 ? Math.min(100, Math.round((value / total) * 100)) : 0;
  const ok = total > 0 && value >= total;
  return (
    <div className={`bar${ok ? " ok" : ""}`}>
      <i style={{ width: `${pct}%` }} />
    </div>
  );
}

export function Note({
  children,
  warn,
}: {
  children: React.ReactNode;
  warn?: boolean;
}) {
  return (
    <div className={`note${warn ? " warn" : ""}`}>
      <span className="ic">{warn ? "!" : "i"}</span>
      <div>{children}</div>
    </div>
  );
}