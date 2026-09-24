import AssistantChat from "@/components/AssistantChat";
import { Note } from "@/components/Bits";
import { orderedPointIds, pointMap } from "@/lib/data";

export default function AssistantPage() {
  const points = orderedPointIds()
    .map((id) => pointMap[id])
    .filter(Boolean)
    .map((p) => ({ id: p.id, title: p.title }));

  return (
    <div className="page">
      <div className="page-head">
        <div className="eyebrow">AI</div>
        <h1>AI 学习助手</h1>
        <div className="sub">
          问概念、问题目、问怎么安排学习。选一个知识点，它的回答就会结合那个知识点。
        </div>
      </div>

      <div className="section">
        <Note>
          <strong>怎么问效果最好？</strong>
          <br />
          不要只发「这道题怎么做」。把三件事说清楚：你卡在哪一步、你试过什么、你怀疑是什么原因。
          信息越具体，回答越接近你真正的问题——这个习惯本身，比答案值钱。
        </Note>
      </div>

      <AssistantChat points={points} />
    </div>
  );
}