import JournalBoard from "@/components/JournalBoard";
import { Note } from "@/components/Bits";

export default function JournalPage() {
  return (
    <div className="page">
      <div className="page-head">
        <div className="eyebrow">沉淀</div>
        <h1>学习记录</h1>
        <div className="sub">
          每天 30 秒。记录不是给别人看的，是为了让复盘时有据可依。
        </div>
      </div>

      <div className="section">
        <Note>
          <strong>为什么一定要写「卡点」？</strong>
          <br />
          记录「今天学了极限」没有任何用，因为明天你还是不知道自己哪里不会。
          写下「看不出什么时候要分子分母同除最高次幂」才有用——这是一句可以被解决的问题。
          周复盘能不能生成有价值的内容，取决于这一栏写得够不够具体。
        </Note>
      </div>

      <JournalBoard />
    </div>
  );
}