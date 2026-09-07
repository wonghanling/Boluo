import { Service } from "@/types"

export const services: Service[] = [
  {
    id: "chatgpt",
    name: "ChatGPT Plus 代充",
    description: "多种套餐灵活选择，专业代充服务，安全快速开通",
    icon: "MessageSquare",
    href: "/services/chatgpt",
    features: [
      "Codex Plus ¥148",
      "Codex Pro 5X ¥680",
      "Codex Pro 20X ¥1280",
      "代充自己的账号 / 可购买账号"
    ],
    pricing: [
      {
        name: "Codex Plus",
        price: "¥148",
        period: "",
        features: [
          "代充自己的账号",
          "可购买账号"
        ]
      },
      {
        name: "Codex Pro 5X",
        price: "¥680",
        period: "",
        features: [
          "代充自己的账号",
          "可购买账号"
        ]
      },
      {
        name: "Codex Pro 20X",
        price: "¥1280",
        period: "",
        features: [
          "代充自己的账号",
          "可购买账号"
        ]
      }
    ]
  },
  {
    id: "claude",
    name: "Claude Code 代申请",
    description: "官方客户端直连原生Claude code非第三方。每天请求500次官方版非镜像够用会剩余",
    icon: "Code",
    href: "/services/claude",
    features: [
      "按天 / 周卡 / 多档月卡",
      "官方客户端直连原生 Claude Code",
      "七档套餐灵活选择",
      "起价￥11"
    ],
    pricing: [
      {
        name: "按天体验",
        price: "¥11",
        period: "天",
        features: [
          "先试一天再决定"
        ]
      },
      {
        name: "周卡",
        price: "¥109",
        period: "周",
        features: [
          "短期项目冲刺"
        ]
      },
      {
        name: "VIP 月卡",
        price: "¥319",
        period: "月",
        features: [
          "日常开发够用"
        ]
      },
      {
        name: "PLUS 月卡",
        price: "¥439",
        period: "月",
        features: [
          "高频开发与长上下文"
        ],
        popular: true
      },
      {
        name: "SVIP 月卡",
        price: "¥619",
        period: "月",
        features: [
          "多项目并行"
        ]
      },
      {
        name: "ULTRA 月卡",
        price: "¥919",
        period: "月",
        features: [
          "团队共用"
        ]
      },
      {
        name: "MAX 月卡",
        price: "¥1218",
        period: "月",
        features: [
          "不计量地写"
        ]
      }
    ]
  },
  {
    id: "others",
    name: "海外 AI 应用代充",
    description: "按需代充各类海外 AI 应用订阅，微信沟通价格详情",
    icon: "Sparkles",
    href: "/services/others",
    features: [
      "Midjourney 订阅代充",
      "Runway AI 订阅代充", 
      "Poe Pro 订阅代充",
      "Notion AI 订阅代充",
      "Perplexity Pro 订阅代充",
      "Suno AI 订阅代充",
      "GitHub Copilot 订阅代充",
      "Canva Pro 订阅代充",
      "Adobe Creative Cloud 代充",
      "Figma Pro 订阅代充",
      "其他 AI 应用按需代充"
    ],
    pricing: [
      {
        name: "按需报价",
        price: "微信咨询",
        period: "按需",
        features: [
          "支持多种 AI 应用",
          "按实际需求报价",
          "微信一对一沟通",
          "灵活的付款方式"
        ]
      }
    ]
  },
  {
    id: "network",
    name: "即将推出",
    description: "敬请期待",
    icon: "Zap",
    href: "#",
    features: [
      "开发进行中",
      "即将发布",
      "更多惊喜",
      "保持关注"
    ],
    pricing: [
      {
        name: "基础套餐",
        price: "¥—",
        period: "月",
        features: [
          "高速网络加速",
          "稳定连接保障",
          "基础技术支持",
          "多设备支持"
        ]
      },
      {
        name: "专业套餐",
        price: "¥—",
        period: "月",
        features: [
          "高速网络加速",
          "稳定连接保障",
          "优先技术支持",
          "多设备支持",
          "专业优化方案"
        ],
        popular: true
      },
      {
        name: "企业套餐",
        price: "¥—",
        period: "月",
        features: [
          "高速网络加速",
          "稳定连接保障",
          "专属技术支持",
          "无限设备支持",
          "定制化方案"
        ]
      }
    ]
  }
]
