export type PythonCourse = {
  id: string;
  title: string;
  provider: string;
  platform: string;
  url: string;
  note: string;
  kind: "school" | "bili" | "mooc" | "paid";
};

/** Python 学习资源：学校课程 + B 站风评好的小白课 + MOOC */
export const pythonCourses: PythonCourse[] = [
  // 学校课程入口（项目驱动 + AI 基础篇）
  {
    id: "school-python",
    title: "南开学堂 · 人工智能与创新（Python）",
    provider: "南开大学 · 校内 AI 增强平台",
    platform: "校内",
    url: "https://nankai.ai-augmented.com/app/jx-web/mycourse/7062372193774083830/task",
    note: "课程分两条线：① AI 基础篇（3 章，铺垫意义）② 项目主线 5 章——从装环境开始，用 Python 解决「高考成绩赋分 + 平行志愿填报」真实项目。这就是你的结课作品。",
    kind: "school",
  },

  // B 站精选（口碑好、真小白、有项目实战）
  {
    id: "bili-warrior",
    title: "Python 零基础从入门到精通（368 集）",
    provider: "小程程学长（BV1UdZyYxEJs）",
    platform: "B 站",
    url: "https://www.bilibili.com/video/BV1UdZyYxEJs",
    note: "播放量 567 万，真小白友好——从软件安装到爬虫到数据分析全都覆盖，每节 20-40 分钟。评论区说「草履虫都能学会」。",
    kind: "bili",
  },
  {
    id: "bili-yuanma",
    title: "全套 Python 小白入门（600 集）",
    provider: "Python 学习教程_（BV1wG1sBHEXv）",
    platform: "B 站",
    url: "https://www.bilibili.com/video/BV1wG1sBHEXv",
    note: "4.6 万播放，有完整选集表，每集标题就是知识点（数据类型、循环、函数、模块...）。适合「我需要某个知识点、直接跳到那集」的学习方式。",
    kind: "bili",
  },
  {
    id: "bili-zhange",
    title: "Python 零基础全套（400 集 · 2025 最新）",
    provider: "教 Python 的战哥（BV1t7bXzXEZS）",
    platform: "B 站",
    url: "https://www.bilibili.com/video/BV1t7bXzXEZS",
    note: "Python 工程师主讲，不是老师——能告诉你真正写代码时哪些坑最常见。爬虫 + 自动化办公 + 数据分析全覆盖。",
    kind: "bili",
  },

  // MOOC
  {
    id: "mooc-python",
    title: "Python 程序设计基础（国家级精品课）",
    provider: "嵩天 · 北京理工大学",
    platform: "中国大学 MOOC",
    url: "https://www.icourse163.org/course/BIT-268002",
    note: "国家级精品课，和南开学堂的 Python 课内容高度重叠——可以当作学校课的「提前预习」或「课后补漏」。完全免费。",
    kind: "mooc",
  },
];
