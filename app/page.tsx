import Dashboard from "@/components/Dashboard";
import { chapters, pointsOfChapter, pythonStages } from "@/lib/data";

export default function HomePage() {
  const tree = chapters.map((c) => ({
    id: c.id,
    total: pointsOfChapter(c.id).length,
  }));

  const ordered = chapters.flatMap((c) =>
    pointsOfChapter(c.id).map((p) => ({
      id: p.id,
      title: p.title,
      chapterId: p.chapterId,
    }))
  );

  return (
    <div className="page">
      <div className="page-head">
        <div className="eyebrow">工作台</div>
        <h1>仪表盘</h1>
        <div className="sub">
          今天的任务、进度和复习提醒都在这里。所有数据都存在你自己的浏览器里。
        </div>
      </div>

      <Dashboard
        points={ordered}
        chapters={chapters.map((c, i) => ({
          id: c.id,
          index: c.index,
          title: c.title,
          total: tree[i].total,
        }))}
        pyStages={pythonStages.map((s) => ({
          id: s.id,
          no: s.no,
          title: s.title,
          topics: s.topics,
        }))}
      />
    </div>
  );
}