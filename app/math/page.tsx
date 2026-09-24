import MathTree from "@/components/MathTree";
import { chapters, pointsOfChapter, stats } from "@/lib/data";

export default function MathPage() {
  const s = stats();

  const tree = chapters.map((c) => ({
    id: c.id,
    index: c.index,
    title: c.title,
    summary: c.summary,
    points: pointsOfChapter(c.id).map((p) => ({
      id: p.id,
      title: p.title,
      level: p.level,
      summary: p.summary,
    })),
  }));

  return (
    <div className="page">
      <div className="page-head">
        <div className="eyebrow">高数 B（一）</div>
        <h1>高等数学知识库</h1>
        <div className="sub">
          共 {s.chapters} 章、{s.points} 个知识点。点进任意知识点，AI 会用三种方式讲给你听，
          讲完再回来标记掌握度。
        </div>
      </div>

      <div className="grid grid-3 section">
        <div className="stat">
          <div className="k">必会</div>
          <div className="v mono">
            {s.byLevel[1]}
            <small>个</small>
          </div>
        </div>
        <div className="stat">
          <div className="k">重点</div>
          <div className="v mono">
            {s.byLevel[2]}
            <small>个</small>
          </div>
        </div>
        <div className="stat">
          <div className="k">难点</div>
          <div className="v mono">
            {s.byLevel[3]}
            <small>个</small>
          </div>
        </div>
      </div>

      <MathTree tree={tree} />
    </div>
  );
}