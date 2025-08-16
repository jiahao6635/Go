// 演示项目数据
export const demoProjects = [
  {
    id: 1,
    name: "iPhone 15 Pro Max 1TB",
    description: "全新未拆封的iPhone 15 Pro Max 1TB，原价¥12999。搭载A17 Pro芯片，钛金属设计，专业级摄像系统。",
    imageUrl: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&h=300&fit=crop",
    totalAmount: "10.0", // MON
    ticketPrice: "0.10", // MON per ticket
    maxTickets: 100,
    soldTickets: 45,
    duration: 48, // hours
    category: "数码电子"
  },
  {
    id: 2,
    name: "MacBook Pro 16\" M3 Max",
    description: "苹果MacBook Pro 16英寸 M3 Max芯片版本，36GB内存 + 1TB SSD，原价¥25999。设计师和开发者的首选。",
    imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=300&fit=crop",
    totalAmount: "25.0",
    ticketPrice: "0.25",
    maxTickets: 100,
    soldTickets: 23,
    duration: 72,
    category: "数码电子"
  },
  {
    id: 3,
    name: "Tesla Model Y 长续航版",
    description: "特斯拉Model Y长续航全轮驱动版，续航594公里，Autopilot自动辅助驾驶，原价¥299900。",
    imageUrl: "https://images.unsplash.com/photo-1617788138017-80ad40651399?w=400&h=300&fit=crop",
    totalAmount: "300.0",
    ticketPrice: "1.00",
    maxTickets: 300,
    soldTickets: 156,
    duration: 168,
    category: "汽车"
  },
  {
    id: 4,
    name: "Rolex Submariner 绿水鬼",
    description: "劳力士潜航者型绿色表圈腕表，316L不锈钢表壳，瑞士制造，原价¥70000。收藏投资首选。",
    imageUrl: "https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=400&h=300&fit=crop",
    totalAmount: "70.0",
    ticketPrice: "0.70",
    maxTickets: 100,
    soldTickets: 89,
    duration: 24,
    category: "奢侈品"
  },
  {
    id: 5,
    name: "PlayStation 5 豪华版",
    description: "索尼PlayStation 5游戏主机，配备2个DualSense手柄，5款热门游戏，原价¥4999。",
    imageUrl: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=400&h=300&fit=crop",
    totalAmount: "5.0",
    ticketPrice: "0.05",
    maxTickets: 100,
    soldTickets: 67,
    duration: 36,
    category: "数码电子"
  },
  {
    id: 6,
    name: "戴森V15吸尘器",
    description: "戴森V15 Detect激光探测无绳吸尘器，智能激光技术，60分钟续航，原价¥4690。",
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
    totalAmount: "4.69",
    ticketPrice: "0.047",
    maxTickets: 100,
    soldTickets: 12,
    duration: 24,
    category: "家电"
  }
]

// 生成随机项目状态
export const generateProjectStatus = (project: any) => {
  const now = Date.now()
  const createdAt = now - Math.random() * 7 * 24 * 60 * 60 * 1000 // 最近7天内创建
  const deadline = createdAt + project.duration * 60 * 60 * 1000
  
  return {
    ...project,
    createdAt: Math.floor(createdAt / 1000),
    deadline: Math.floor(deadline / 1000),
    currentAmount: (parseFloat(project.totalAmount) * (project.soldTickets / project.maxTickets)).toString(),
    isCompleted: project.soldTickets >= project.maxTickets,
    isDrawn: project.soldTickets >= project.maxTickets,
    winner: project.soldTickets >= project.maxTickets ? "0x742d35C..." : "0x0000000000000000000000000000000000000000",
    status: now > deadline && project.soldTickets < project.maxTickets ? 2 : 0 // 2 = Failed, 0 = Active
  }
}
