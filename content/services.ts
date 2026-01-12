import { Service } from "@/types"

export const services: Service[] = [
  {
    id: "chatgpt",
    name: "ChatGPT Plus 代充",
    description: "多种套餐灵活选择，专业代充服务，安全快速开通",
    icon: "MessageSquare",
    href: "/services/chatgpt",
    features: [
      "多种套餐灵活选择",
      "专业代充服务",
      "安全快速开通",
      "起价￥35"
    ],
    pricing: [
      {
        name: "免费版代开通",
        price: "¥35",
        period: "",
        features: [
          "代开通ChatGPT免费账号",
          "基础功能使用"
        ]
      },
      {
        name: "共享版",
        price: "¥65",
        period: "月",
        features: [
          "ChatGPT Plus共享账号",
          "GPT-5功能权限",
          "优先访问新功能",
          "高速响应速度"
        ],
        popular: true
      },
      {
        name: "独享代充",
        price: "¥169",
        period: "月",
        features: [
          "无限制您的账号",
          "完全独享使用",
          "GPT-5无限制",
          "全部高级功能"
        ]
      },
      {
        name: "Pro专业版",
        price: "¥1500",
        period: "月",
        features: [
          "ChatGPT Pro账号",
          "最高性能限制",
          "优先客服支持",
          "专业级功能"
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
      "新号申请（含手机号验证）",
      "日付/周付/月付选择",
      "一次性代办服务",
      "提供详细教程引导"
    ],
    pricing: [
      {
        name: "新号申请",
        price: "¥29",
        period: "一次性",
        features: [
          "全新 Claude Code 账号",
          "包含手机号验证",
          "合规申请材料",
          "详细使用教程"
        ]
      },
      {
        name: "日付套餐",
        price: "¥13",
        period: "天",
        features: [
          "Claude Code 完整功能",
          "无限制使用",
          "最新功能访问",
          "技术支持"
        ]
      },
      {
        name: "周付套餐",
        price: "¥130",
        period: "周",
        features: [
          "Claude Code 完整功能",
          "无限制使用",
          "最新功能访问",
          "技术支持"
        ],
        popular: true
      },
      {
        name: "月付套餐",
        price: "¥320",
        period: "月",
        features: [
          "Claude Code 完整功能",
          "无限制使用",
          "最新功能访问",
          "技术支持",
          "享受月付优惠"
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