export type EconCourse = {
  id: string;
  title: string;
  provider: string;
  platform: string;
  url: string;
  note: string;
};

/** 经济学资源：南开内部平台 + B 站口碑好的入门课 + MOOC */
export const econCourses: EconCourse[] = [
  {
    id: "nankai",
    title: "南开学堂 · 经济学类公共基础课",
    provider: "南开大学",
    platform: "校内平台",
    url: "https://nankai.ai-augmented.com/app/jx-web/myaccount/accountInformation",
    note: "学校自己的 AI 增强教学平台，登录后看个人课程中心。大一经济学类公共基础课（微观/宏观/计量经济）都在这里。",
  },
  {
    id: "nankai-macro",
    title: "南开大学 · 微观经济学（公开课）",
    provider: "南开大学 经济学院",
    platform: "中国大学 MOOC",
    url: "https://www.icourse163.org/course/NKU-1001470006",
    note: "南开大学经济学院自己开的，和校内课程基本同步，免费旁听。",
  },
  {
    id: "bili-xiwei",
    title: "微观经济学（张维迎版本）",
    provider: "小历的经济课堂",
    platform: "B 站",
    url: "https://search.bilibili.com/all?keyword=%E5%BE%AE%E8%A7%82%E7%BB%8F%E6%B5%8E%E5%AD%A6%20%E5%BC%A0%E7%BB%B4%E8%BF%8E",
    note: "B站入门微观口碑课，讲得直白有趣，适合先建立直觉。",
  },
  {
    id: "bili-hongguan",
    title: "宏观经济学（曼昆版本）",
    provider: "B站搜索",
    platform: "B 站",
    url: "https://search.bilibili.com/all?keyword=%E5%AE%8F%E8%A7%82%E7%BB%8F%E6%B5%8E%E5%AD%A6%20%E6%9B%BC%E6%9B%B9%20%E5%85%A5%E9%97%A8",
    note: "大量 UP 主讲过曼昆宏观的入门版，挑播放量百万以上的看就行。",
  },
  {
    id: "coursera-econ",
    title: "经济学原理（可汗学院）",
    provider: "Khan Academy",
    platform: "Khan Academy",
    url: "https://www.khanacademy.org/economics-finance-domain/microeconomics",
    note: "可汗学院的经济学完全免费，用英语讲但有中文字幕，动画多、讲得细。",
  },
  {
    id: "econ-gpt",
    title: "经济学 × AI：用大模型理解经济数据",
    provider: "（趣味作业入口）",
    platform: "本工作台",
    url: "/fun",
    note: "自己动手做：用 Python + 免费经济数据集 + AI 解读——从 GDP 数据到可视化，一个下午跑通。",
  },
];

/** 经济学核心概念速查（对应大一第一学期） */
export const econConcepts = [
  {
    id: "supply-demand",
    title: "供需分析",
    desc: "价格由供给和需求决定——这是经济学的 ABC。导数是供需曲线的斜率，弹性就是导数 × 系数。",
    cross: ["高数：导数与弹性", "Python：画供需曲线", "AI：预测价格拐点"],
  },
  {
    id: "utility",
    title: "效用最大化",
    desc: "消费者在预算约束下追求最大效用。边际效用递减是经济学最基础的假设之一。",
    cross: ["高数：多元函数极值", "Python：效用函数可视化", "AI：个性化推荐就是效用最大化"],
  },
  {
    id: "production",
    title: "生产函数与成本",
    desc: "企业的生产函数决定成本曲线。边际成本 = 总成本的导数，边际收益 = 总收益的导数。",
    cross: ["高数：导数 + 积分", "Python：成本曲线拟合", "AI：预测最优产量"],
  },
  {
    id: "elasticity",
    title: "弹性",
    desc: "需求量变化百分比 / 价格变化百分比。和高数里的「比率的极限」是同一个东西。",
    cross: ["高数：函数极限 + 导数", "Python：真实数据算弹性", "AI：帮你选应该弹性还是价格"],
  },
  {
    id: "discount",
    title: "贴现与现值",
    desc: "未来的钱不如今天的钱值钱。现值公式里的指数衰减 $1/(1+r)^n$，直接来自第二个重要极限。",
    cross: ["高数：两个重要极限 + 指数函数", "Python：PV/NPV 计算器", "AI：算毕业起薪到底值不值"],
  },
];
