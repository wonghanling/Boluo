# 迅通AI（Xuntong AI）官网

现代化的AI工具代充服务网站，使用 Next.js 14 + TypeScript + Tailwind CSS 构建。

## 🚀 特性

- ⚡ **现代技术栈**: Next.js 14 + TypeScript + Tailwind CSS
- 🎨 **现代设计**: 极简风格，优秀的用户体验
- 📱 **响应式布局**: 完美适配桌面端和移动端
- 🌙 **暗色模式**: 支持系统跟随和手动切换
- ⚡ **性能优化**: 代码分割、图片优化、SEO 友好
- 🛡️ **类型安全**: 完整的 TypeScript 支持
- 💫 **动画效果**: Framer Motion 提供流畅动画
- 📧 **表单处理**: react-hook-form + zod 验证

## 📦 技术栈

- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS + shadcn/ui
- **动画**: Framer Motion
- **表单**: React Hook Form + Zod
- **图标**: Lucide React
- **主题**: next-themes

## 🛠️ 本地开发

### 安装依赖

```bash
npm install
# 或
yarn install
# 或
pnpm install
```

### 启动开发服务器

```bash
npm run dev
# 或
yarn dev
# 或
pnpm dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看网站。

### 构建生产版本

```bash
npm run build
# 或
yarn build
# 或
pnpm build
```

### 启动生产服务器

```bash
npm run start
# 或
yarn start
# 或
pnpm start
```

## 📁 项目结构

```
├── app/                    # Next.js 14 App Router
│   ├── globals.css        # 全局样式
│   ├── layout.tsx         # 根布局
│   ├── page.tsx           # 首页
│   ├── loading.tsx        # 加载页面
│   ├── error.tsx          # 错误页面
│   ├── not-found.tsx      # 404页面
│   ├── contact/           # 联系页面
│   ├── services/          # 服务页面
│   │   ├── chatgpt/
│   │   ├── claude/
│   │   ├── vpn/
│   │   └── others/
│   └── legal/             # 法律页面
│       ├── privacy/
│       └── terms/
├── components/            # 组件
│   ├── ui/               # shadcn/ui 基础组件
│   ├── header.tsx        # 导航栏
│   ├── footer.tsx        # 页脚
│   ├── icons.tsx         # 图标
│   └── theme-provider.tsx # 主题提供者
├── content/              # 内容配置
│   ├── site.ts          # 网站配置
│   ├── services.ts      # 服务数据
│   ├── faq.ts           # FAQ数据
│   └── general.ts       # 通用内容
├── lib/                 # 工具函数
│   └── utils.ts         # 通用工具
├── types/               # TypeScript 类型定义
│   └── index.ts
└── public/              # 静态资源
    └── wechat-qr.svg   # 微信二维码占位符
```

## ⚙️ 配置说明

### 内容配置

所有网站内容都在 `content/` 目录下配置，便于维护：

#### 1. 修改网站基本信息

编辑 `content/site.ts`:

```typescript
export const siteConfig: SiteConfig = {
  name: "迅通AI（Xuntong AI）",
  description: "您的网站描述",
  url: "https://your-domain.com",
  // ...
}
```

#### 2. 更新服务信息

编辑 `content/services.ts`:

```typescript
export const services: Service[] = [
  {
    id: "chatgpt",
    name: "ChatGPT Plus 代充",
    pricing: [
      {
        name: "月付套餐",
        price: "¥299",  // 修改此处价格
        // ...
      }
    ]
    // ...
  }
  // ...
]
```

#### 3. 修改联系方式

编辑 `content/general.ts`:

```typescript
export const contactInfo: ContactInfo = {
  wechat: "your-actual-wechat-id",  // 修改微信号
  qrCodePath: "/wechat-qr.png"     // 更新二维码路径
}
```

#### 4. 更新FAQ

编辑 `content/faq.ts` 添加或修改常见问题。

### 替换二维码

1. 将您的微信二维码图片放到 `public/` 目录
2. 更新 `content/general.ts` 中的 `qrCodePath`
3. 支持的格式：PNG, JPG, SVG

### 价格管理

所有价格都使用占位符 `¥—`，您可以：

1. 直接在 `content/services.ts` 中修改具体价格
2. 或者创建一个单独的价格配置文件进行管理

## 🚀 部署

### Vercel 部署

1. 将代码推送到 GitHub
2. 在 [Vercel](https://vercel.com) 导入项目
3. 自动部署完成

### 腾讯云部署

1. 构建项目：`npm run build`
2. 将 `out/` 目录上传到服务器
3. 配置 Nginx 指向该目录

### 静态导出

```bash
npm run export
```

生成的静态文件在 `out/` 目录，可直接部署到任何静态托管服务。

## 🎨 样式自定义

### 主题色修改

编辑 `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      'brand': '#5B8CFF',      // 修改主品牌色
      'brand-dark': '#4776E6', // 修改深色主题品牌色
      // ...
    }
  }
}
```

### 字体修改

1. 在 `app/globals.css` 中导入新字体
2. 更新 `tailwind.config.js` 中的 `fontFamily` 配置

## 📊 性能优化

- 所有图片使用 `next/image` 自动优化
- 组件懒加载减少初始包大小
- CSS 按需加载和去除未使用样式
- 自动代码分割

## 🔍 SEO 优化

- 完整的 metadata 配置
- Open Graph 标签支持
- 结构化数据标记
- 语义化 HTML 标签

## 🛡️ 安全特性

- XSS 防护
- CSRF 防护
- 安全的表单处理
- 敏感信息保护

## 🐛 常见问题

### Q: 如何添加新的服务？

A: 在 `content/services.ts` 中添加新的服务对象，然后在 `app/services/` 下创建对应的页面目录。

### Q: 如何修改网站颜色？

A: 修改 `tailwind.config.js` 中的 `colors` 配置，主要是 `brand` 和 `brand-dark` 两个颜色。

### Q: 联系表单的数据存储在哪里？

A: 目前存储在浏览器的 localStorage，生产环境建议连接真实的后端API。

### Q: 如何开启真实的后端服务？

A: 修改 `app/contact/page.tsx` 中的表单提交逻辑，将数据发送到您的后端API。

## 📄 许可证

本项目仅供学习和参考使用。

## 🤝 贡献

欢迎提出建议和改进意见！

## 📞 支持

如有问题，请联系：
- 微信：your-wechat-id
- 邮箱：your-email@domain.com