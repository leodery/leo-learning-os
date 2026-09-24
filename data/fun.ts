export type FunProject = {
  id: string;
  title: string;
  time: string;
  desc: string;
  stack: string[];
  steps: string[];
  outcome: string;
  resources: string[];
};

/** 趣味作业：把经济学 × Python × AI 串起来的一个下午项目 */
export const funProjects: FunProject[] = [
  {
    id: "pv-forecast",
    title: "用 GDP 数据算你的「毕业现值」",
    time: "2-3 小时",
    desc: "用 Python 拉中国 GDP 增长率 + 通胀率，算你毕业第一份工作的工资「折现」到今天值多少钱。AI 帮你解释公式背后的经济学直觉。",
    stack: ["Python", "导数", "贴现", "AI 解读"],
    steps: [
      "Pandas 拉一份世界银行或国家统计局的 GDP + CPI 时间序列",
      "用复利公式 $PV = FV/(1+r)^n$ 写一个 Python 函数",
      "把你的毕业起薪猜测（比如 8k/月）填进去，算 PV",
      "问 AI：为什么真实贴现率要扣掉通胀？为什么风险高的资产贴现率更高？",
    ],
    outcome: "一张「毕业现值 vs. 当前生活费」对比表 + 一段 AI 写的经济直觉解释",
    resources: [
      "世界银行 GDP 数据：https://data.worldbank.org/indicator/NY.GDP.MKTP.KD.ZG",
      "国家统计局 CPI：https://data.stats.gov.cn/easyquery.htm?cn=A01",
      "现成的免费 GDP CSV：在 GitHub 搜 china gdp csv",
    ],
  },
  {
    id: "supply-demand-draw",
    title: "画一条你自己的供需曲线",
    time: "2 小时",
    desc: "从 B 站 UP 主那里学供需，用 Python matplotlib 画一条真实的奶茶店供需曲线，AI 帮你找均衡点。",
    stack: ["Python", "导数", "供需模型", "AI 辅助"],
    steps: [
      "拍一张学校门口奶茶店的菜单（不同价位的产品）",
      "把价格和你估计的销量做成 Excel / CSV",
      "用 Python 画散点图 + 拟合供需曲线",
      "算两条曲线的交点（均衡价格）",
      "问 AI：奶茶涨价 30% 会发生什么？弹性在这里怎么用？",
    ],
    outcome: "一张带拟合线的散点图 + AI 帮你算弹性系数",
    resources: [
      "Python matplotlib 入门：B站搜「Python 画图」",
      "散点拟合用 numpy.polyfit 或 scipy.stats.linregress",
    ],
  },
  {
    id: "cpi-sentiment",
    title: "AI 解读：用 CPI 数据看你「感觉的通胀」对不对",
    time: "3-4 小时",
    desc: "拉一年的 CPI 月度数据，让 AI 对比「官方 CPI」和「你体感的通胀」差多少——这个差值就是经济学里「预期」和「实际」的分歧。",
    stack: ["Python", "极限 / 增长", "时间序列", "AI 分析"],
    steps: [
      "Pandas 拉过去 12 个月的 CPI 数据",
      "用 rolling average 算 3 个月移动平均（极限直觉：平均让波动收敛）",
      "把数据喂给 AI：为什么 CPI 涨 2% 但你感觉物价飞了？",
      "AI 会讲：分项 CPI vs. 核心 CPI、权重偏差、生存成本指数",
    ],
    outcome: "一张带移动平均的 CPI 折线图 + AI 写的「通胀错觉报告」",
    resources: [
      "Python 时间序列入门：B站搜「Pandas 时间序列」",
    ],
  },
  {
    id: "stock-sim",
    title: "蒙特卡洛模拟：你的钱 5 年后能涨多少",
    time: "3 小时",
    desc: "用 Python 写一个随机游走（布朗运动）模拟股票收益，AI 帮你解释为什么极限在金融里这么重要——期权定价的 BS 公式就是这么来的。",
    stack: ["Python", "极限 / 随机变量", "蒙特卡洛", "AI"],
    steps: [
      "了解几何布朗运动 $dS/S = \\mu dt + \\sigma dW$",
      "用 numpy 写 10,000 条 5 年的价格路径",
      "画一张 100 条路径的图（看起来像一团乱麻）",
      "算 5 年后价格的 5% / 50% / 95% 分位数",
      "问 AI：为什么 BS 公式要用「风险中性概率」？和极限有什么关系？",
    ],
    outcome: "一张蒙特卡洛路径图 + 一个分位数表格 + AI 讲为什么",
    resources: [
      "Python numpy + matplotlib 够用",
    ],
  },
  {
    id: "recommend-engine",
    title: "给你自己写一个「学习推荐系统」",
    time: "4 小时",
    desc: "收集你高数习题的做题记录（哪章错最多），用 AI 帮你总结薄弱点，自动推荐下一个应该学的知识点——这就是 AI × 教育产品的最基础形态。",
    stack: ["Python", "AI API", "数据处理", "产品思维"],
    steps: [
      "把你的错题本（当前工作台的错题也可以）导出成 JSON / CSV",
      "用 Python 按知识点分组统计错题数量",
      "调 AI：把你的错题汇总喂进去，让它推荐下一个学什么",
      "用 Streamlit 搭一个极简前端：输入 → 输出推荐",
    ],
    outcome: "一个能跑的本地 Streamlit 应用 + 一段产品复盘（你做了什么、AI 帮你做了什么）",
    resources: [
      "Streamlit 入门：pip install streamlit 然后 streamlit run app.py",
    ],
  },
  {
    id: "gpt-prompt-econ",
    title: "用 AI Prompt 写一篇「经济学小论文」",
    time: "2-3 小时",
    desc: "选一个你感兴趣的小问题（比如「为什么学校门口的奶茶涨价有人买有人不买」），用 AI 帮你搜文献 + 写框架 + 改润色。",
    stack: ["AI Prompt", "经济写作", "批判性思考"],
    steps: [
      "用 DanYang AI OS 的「商业分析 Prompt」框架来提问",
      "让 AI 帮你列出相关的经济概念（弹性、信息不对称、价格歧视）",
      "让 AI 帮你写文献综述 + 假设 + 数据收集方法",
      "最后自己写结论——AI 帮你改结构，但观点必须是你的",
    ],
    outcome: "一篇 800-1500 字的小论文草稿 + AI 帮你写的「修改意见」",
    resources: [
      "不要直接抄，让 AI 帮你做脚手架，内容自己填",
    ],
  },
];
