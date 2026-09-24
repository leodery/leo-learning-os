import Link from "next/link";
import { notFound } from "next/navigation";
import AiPanel from "@/components/AiPanel";
import MathText from "@/components/MathText";
import { MasteryControl } from "@/components/Mastery";
import { getChapter, getPoint, neighbourTitles, neighbours } from "@/lib/data";
import { LEVEL_LABEL } from "@/lib/labels";

const KIND_LABEL: Record<string, string> = {
  video: "视频",
  article: "文章",
  book: "教材",
  note: "笔记",
};

export default async function PointPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const point = getPoint(id);
  if (!point) notFound();

  const chapter = getChapter(point.chapterId);
  const { prev, next } = neighbours(point.id);
  const prevP = prev ? getPoint(prev) : null;
  const nextP = next ? getPoint(next) : null;
  const related = neighbourTitles(point.related);

  return (
    <div className="page">
      <div className="page-head">
        <div className="eyebrow">
          {chapter ? `${chapter.index} · ${chapter.title}` : "高等数学"}
        </div>
        <h1>{point.title}</h1>
        <div className="sub">{point.summary}</div>
        <div className="mt-8">
          <span className="badge brand">L{point.level} · {LEVEL_LABEL[point.level]}</span>
          <span className="badge" style={{ marginLeft: 6 }}>
            章节 {chapter?.index ?? "—"}
          </span>
        </div>
      </div>

      <div className="section">
        <AiPanel pointId={point.id} pointTitle={point.title} />
      </div>

      <div className="split">
        <div>
          <div className="section-head">
            <h2>知识卡片</h2>
            <span className="small muted">知识库底稿 · 不依赖 AI，随时可看</span>
          </div>

          <div className="card">
            <div className="prose">
              <h3>
                <span className="marker" />
                一句话
              </h3>
              <div>
                <MathText text={point.summary} />
              </div>

              <h3 className="mt-16">
                <span className="marker" />
                先说人话
              </h3>
              <div>
                <MathText text={point.plain} />
              </div>
            </div>

            <div className="defblock mt-16">
              <div className="label">数学定义</div>
              <div className="prose">
                <MathText text={point.formal} />
              </div>
            </div>

            <div className="defblock">
              <div className="label">它能用来干什么</div>
              <div className="prose">
                <MathText text={point.applied} />
              </div>
            </div>
          </div>

          {point.pitfalls.length ? (
            <div className="section mt-20">
              <div className="section-head">
                <h2>常见误区</h2>
                <span className="small muted">考试丢分基本都在这里</span>
              </div>
              {point.pitfalls.map((x, i) => (
                <div key={i} className="pitfall">
                  <span className="x">!</span>
                  <span>
                    <MathText text={x} />
                  </span>
                </div>
              ))}
            </div>
          ) : null}

          {point.examples.length ? (
            <div className="section mt-20">
              <div className="section-head">
                <h2>典型例题</h2>
                <span className="small muted">先自己做，再看步骤</span>
              </div>
              {point.examples.map((e, i) => (
                <div key={i} className="example">
                  <div className="q">
                    <strong>例 {i + 1}：</strong>
                    <MathText text={e.q} />
                  </div>
                  <div className="steps">
                    <ol>
                      {e.steps.map((s, j) => (
                        <li key={j}>
                          <MathText text={s} />
                        </li>
                      ))}
                    </ol>
                  </div>
                  <div className="ans">
                    结论：<MathText text={e.a} />
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {point.resources.length ? (
            <div className="section mt-20">
              <div className="section-head">
                <h2>配套资源</h2>
                <span className="small muted">按当前知识点的检索入口</span>
              </div>
              {point.resources.map((r, i) => {
                const inner = (
                  <>
                    <span className="kind">{KIND_LABEL[r.kind] ?? r.kind}</span>
                    <span className="grow">
                      <span style={{ display: "block" }}>{r.title}</span>
                      {r.note ? (
                        <span className="small muted">{r.note}</span>
                      ) : null}
                    </span>
                  </>
                );
                return r.url ? (
                  <a
                    key={i}
                    className="res"
                    href={r.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {inner}
                  </a>
                ) : (
                  <div key={i} className="res">
                    {inner}
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>

        <div>
          <div className="card">
            <MasteryControl pointId={point.id} />
            <div className="hint small muted">
              掌握度会影响仪表盘上的复习提醒。
            </div>
          </div>

          {related.length ? (
            <>
              <div className="section-head mt-20">
                <h2>关联知识点</h2>
              </div>
              <div className="card">
                <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                  {related.map((r) => (
                    <Link key={r.id} href={`/math/${r.id}`} className="chip-link">
                      {r.title}
                    </Link>
                  ))}
                </div>
              </div>
            </>
          ) : null}

          <div className="section-head mt-20">
            <h2>翻页</h2>
          </div>
          <div className="card">
            <div className="rows">
              <div className="row">
                <div className="grow">
                  <div className="s">上一个</div>
                  <div className="t">
                    {prevP ? (
                      <Link href={`/math/${prevP.id}`}>{prevP.title}</Link>
                    ) : (
                      <span className="muted">已经是第一个</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="grow">
                  <div className="s">下一个</div>
                  <div className="t">
                    {nextP ? (
                      <Link href={`/math/${nextP.id}`}>{nextP.title}</Link>
                    ) : (
                      <span className="muted">已经是最后一个</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="btn-row mt-12">
              <Link href="/math" className="btn btn-sm">
                回到知识库
              </Link>
              <Link href="/journal" className="btn btn-sm">
                写学习记录
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}