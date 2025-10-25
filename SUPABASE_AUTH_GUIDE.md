# 🚀 Supabase 认证系统部署和测试指南

## 📋 概览

已成功为您的项目集成了完整的 Supabase 认证系统，包括：

- ✅ QQ邮箱注册登录
- ✅ 邮箱验证功能
- ✅ 密码重置功能
- ✅ 用户状态管理
- ✅ 受保护的路由
- ✅ 个人设置页面
- ✅ 订单管理页面

## 🛠️ 部署步骤

### 1. 设置 Supabase 项目

1. 访问 [supabase.com](https://supabase.com) 并创建新项目
2. 在 SQL Editor 中执行 `database.sql` 文件中的所有 SQL 语句
3. 记录项目的 URL 和 anon key

### 2. 配置环境变量

复制 `.env.example` 为 `.env.local` 并填入以下配置：

```bash
# 网站基本信息
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME=迅通AI

# 联系方式配置
NEXT_PUBLIC_WECHAT_ID=your-wechat-id
NEXT_PUBLIC_QR_CODE_PATH=/wechat-qr.svg

# 虎皮椒支付配置
XUNHUPAY_APPID=your_xunhupay_appid_here
XUNHUPAY_SECRET=your_xunhupay_secret_here

# 网站基础URL（用于支付回调和邮箱验证）
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Supabase 配置 - 重要！
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. 配置 Supabase 邮箱模板

在 Supabase Dashboard > Authentication > Email Templates 中配置：

**确认邮箱模板:**
```html
<h2>确认您的邮箱地址</h2>
<p>请点击下面的链接来验证您的邮箱地址：</p>
<p><a href="{{ .ConfirmationURL }}">验证邮箱</a></p>
```

**重置密码模板:**
```html
<h2>重置您的密码</h2>
<p>请点击下面的链接来重置您的密码：</p>
<p><a href="{{ .ConfirmationURL }}">重置密码</a></p>
```

### 4. 安装依赖并启动

```bash
npm install
npm run dev
```

## 🧪 测试清单

### 基础功能测试

#### 1. 注册流程测试
- [ ] 访问 `/auth/signup`
- [ ] 使用QQ邮箱注册（如：123456789@qq.com）
- [ ] 检查表单验证（密码强度、邮箱格式）
- [ ] 提交注册，确认显示"请检查邮箱"消息
- [ ] 检查邮箱收到验证邮件
- [ ] 点击验证链接，确认跳转到验证成功页面

#### 2. 登录流程测试
- [ ] 访问 `/auth/login`
- [ ] 使用未验证邮箱登录，确认提示"邮箱未验证"
- [ ] 验证邮箱后再次登录，确认成功
- [ ] 检查导航栏显示用户信息
- [ ] 测试"忘记密码"功能

#### 3. 导航栏测试
- [ ] 未登录时显示"登录/注册"按钮
- [ ] 登录后显示用户头像和下拉菜单
- [ ] 测试用户菜单功能（个人设置、我的订单、退出登录）
- [ ] 测试移动端菜单

#### 4. 受保护页面测试
- [ ] 未登录时访问 `/profile`，确认重定向到登录页
- [ ] 未登录时访问 `/orders`，确认重定向到登录页
- [ ] 登录后可正常访问这些页面

#### 5. 个人设置页面测试
- [ ] 访问 `/profile`
- [ ] 测试修改显示名称
- [ ] 测试修改密码功能
- [ ] 检查邮箱验证状态显示

#### 6. 订单页面测试
- [ ] 访问 `/orders`
- [ ] 确认显示"暂无订单"状态
- [ ] 测试"浏览服务"按钮跳转

### 集成测试

#### 1. 支付系统集成
- [ ] 登录用户购买服务
- [ ] 检查订单是否正确创建在数据库中
- [ ] 验证用户只能看到自己的订单

#### 2. 邮箱验证集成
- [ ] 注册后检查数据库中 `email_verified` 字段为 false
- [ ] 验证邮箱后检查字段更新为 true
- [ ] 检查验证令牌是否正确标记为已使用

#### 3. 数据安全测试
- [ ] 确认用户只能访问自己的数据
- [ ] 测试 Row Level Security (RLS) 策略
- [ ] 检查敏感数据（如密码）不在响应中泄露

## 🔍 数据库验证

连接到 Supabase 并检查以下表：

```sql
-- 检查用户表结构
SELECT * FROM auth.users LIMIT 5;

-- 检查用户配置文件
SELECT * FROM public.user_profiles LIMIT 5;

-- 检查订单数据
SELECT * FROM public.user_orders LIMIT 5;

-- 检查RLS策略
SELECT schemaname, tablename, policyname, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public';
```

## 📱 UI/UX 测试

#### 1. 响应式设计
- [ ] 桌面端正常显示
- [ ] 平板端正常显示
- [ ] 手机端正常显示
- [ ] 导航栏在各尺寸下工作正常

#### 2. 用户体验
- [ ] 加载状态正确显示
- [ ] 错误消息清晰明确
- [ ] 成功操作有正确反馈
- [ ] 表单验证实时响应

#### 3. 主题切换
- [ ] 深色/浅色模式切换正常
- [ ] 认证页面主题适配正确

## 🐛 常见问题排查

### 1. 邮箱验证不工作
- 检查 Supabase 项目的邮箱配置
- 确认 `NEXT_PUBLIC_BASE_URL` 设置正确
- 检查垃圾邮件文件夹

### 2. 登录后页面不更新
- 检查 AuthProvider 是否正确包装应用
- 确认 Supabase 客户端配置正确
- 检查浏览器控制台错误

### 3. 数据库连接问题
- 验证 Supabase URL 和密钥
- 检查网络连接
- 确认项目未暂停

### 4. 支付集成问题
- 确认虎皮椒配置正确
- 检查回调URL设置
- 验证签名算法

## 📊 性能监控

在生产环境中监控以下指标：

- 注册成功率
- 登录成功率
- 邮箱验证率
- 页面加载时间
- API响应时间

## 🔒 安全检查清单

- [ ] 所有敏感信息存储在环境变量中
- [ ] RLS策略正确配置
- [ ] 密码满足强度要求
- [ ] 验证令牌有过期时间
- [ ] HTTPS在生产环境中启用
- [ ] 定期清理过期令牌

## 🚀 部署到生产环境

### Vercel 部署
1. 连接 GitHub 仓库到 Vercel
2. 在 Vercel 环境变量中设置所有必需的变量
3. 更新 `NEXT_PUBLIC_BASE_URL` 为实际域名
4. 在 Supabase 中更新回调URL配置

### 自托管部署
1. 构建项目：`npm run build`
2. 设置环境变量
3. 启动生产服务器：`npm start`
4. 配置反向代理（如 Nginx）
5. 设置 SSL 证书

## 📞 技术支持

如遇到问题，请检查：

1. **控制台错误** - 浏览器开发者工具
2. **Supabase 日志** - Dashboard > Logs
3. **网络请求** - 开发者工具 Network 标签
4. **数据库状态** - Supabase SQL Editor

---

## ✅ 完成状态

所有认证系统功能已成功实现并可投入使用：

- 🎯 用户注册登录 ✅
- 🎯 邮箱验证 ✅
- 🎯 密码重置 ✅
- 🎯 用户状态管理 ✅
- 🎯 受保护路由 ✅
- 🎯 个人设置 ✅
- 🎯 订单管理 ✅
- 🎯 响应式设计 ✅

您的项目现在具备了完整的用户认证系统！🎉