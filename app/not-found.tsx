import Link from "next/link";

export default function NotFound() {
  return (
    <div className="page">
      <div className="page-head">
        <div className="eyebrow">404</div>
        <h1>这里没有内容</h1>
        <div className="sub">
          可能是知识点 id 写错了，或者这篇内容还没录进知识库。
        </div>
      </div>
      <div className="card">
        <div className="btn-row">
          <Link href="/" className="btn btn-primary">
            回到仪表盘
          </Link>
          <Link href="/math" className="btn">
            去高数知识库
          </Link>
        </div>
      </div>
    </div>
  );
}