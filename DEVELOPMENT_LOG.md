# BoLuo AI 代充服务平台开发日志

## 项目概述

**项目名称**: BoLuo AI 代充服务平台
**技术栈**: Next.js 14 + TypeScript + Supabase + 虎皮椒支付
**仓库地址**: https://github.com/wonghanling/Boluo

---

## 2025-11-24 数据库重构：拆分订单表和服务信息表

### 完成的工作

#### 核心问题识别 🔴
发现原有架构存在严重问题：
- `orders`表混合了支付数据和用户敏感服务信息
- 支付成功后跳转回来时，session可能丢失
- 提交表单时`user_id`可能变成null，导致订单关联断裂

#### 数据库重构 ✅

**新表结构**：
1. **orders表**（只存支付信息）
   - 订单号、金额、支付状态、user_id
   - 支付时记录的user_id永不修改

2. **service_submissions表**（单独存服务信息）
   - 用户填写的ChatGPT账号、支付URL、Claude邮箱
   - 通过order_id关联订单
   - 支持用户修改已提交的信息

3. **orders_full视图**（联合查询）
   - 方便同时查询订单和服务信息

**文件**: `new_database.sql`

#### 代码修改 ✅

1. **支付API** (`app/api/payment/route.ts`)
   - 创建订单时只插入支付信息
   - 移除`processing_status`字段

2. **表单组件** (`components/ServiceSubmissionForm.tsx`)
   - 检查已提交：查询`service_submissions`表
   - 提交表单：插入到`service_submissions`表
   - 保持所有核心逻辑不变：
     - 根据金额控制字段显示
     - 防止重复提交
     - 支付成功才能访问

3. **订单列表** (`app/orders/page.tsx`)
   - 使用`orders_full`视图查询
   - 根据`submission_status`判断状态

#### 解决的核心问题 ✅

**问题流程**：
```
支付时记录user_id → 跳转虎皮椒 → session丢失 → 提交时user_id变null ❌
```

**解决方案**：
```
支付时user_id保存在orders表（永不修改）✅
↓
提交信息时创建新记录到service_submissions表✅
↓
两表通过order_id关联，互不影响✅
```

---

## 2025-11-24 项目探索与UI优化

### 完成的工作

#### 1. UI优化 ✅
- **新增顶部导航栏**
  - 添加菠萝logo（压缩前1.45MB → 压缩后2.37KB，压缩率99.8%）
  - 导航链接：首页、服务、联系我们
  - 固定定位，半透明背景效果

- **Hero区域优化**
  - 添加文案："领取您的会员/无密码接触充值您的账号"（白色阴影效果）
  - 改为三个绿色勾选项展示优势
  - 调整上边距适配导航栏

- **支付弹窗改进**
  - 改为窄条横向卡片布局
  - 响应式设计，防止手机端内容溢出
  - 特性列表可自动换行

- **注册弹窗优化**
  - 黄色背景主题
  - 按钮跳转改为`_self`（同窗口），方便返回
  - 文字居中对齐
  - 响应式字体和间距

#### 2. 项目结构探索 ✅

**核心目录**:
```
app/
├── api/payment/          # 支付API（创建、回调、成功跳转）
├── claim-membership/     # 订单填写页面
├── orders/               # 订单管理页面
├── auth/                 # 认证相关（登录、注册、回调）
└── page.tsx             # 首页

components/
├── AuthProvider.tsx              # 认证上下文
├── ServiceSubmissionForm.tsx    # 服务提交表单
└── header.tsx / footer.tsx      # 导航和页脚
```

#### 3. 核心流程理解 ✅

**支付流程**:
```
用户选择服务
  → 创建订单(pending, waiting_for_info)
  → 跳转虎皮椒支付
  → 支付成功回调(payment_status: paid)
  → 跳转填写页面(paymentSuccess=true)
  → 用户填写信息
  → 提交(processing_status: info_submitted)
  → 管理员处理
```

**防重复提交机制**:
- 检查`processing_status === 'info_submitted'`
- 已提交的订单显示"此订单已提交！请勿重复填写"
- 表单字段变为只读

**根据金额控制字段**:
- ¥35/¥65: 仅需Claude邮箱
- ¥169/¥1500: 需要ChatGPT账号 + 支付URL + Claude邮箱

#### 4. 数据库结构 ✅

**orders表核心字段**:
```sql
order_id              -- 订单号（唯一）
user_id               -- 用户ID（关联auth.users）
amount                -- 支付金额
payment_status        -- 支付状态：pending/paid/refunded
processing_status     -- 处理状态：waiting_for_info/info_submitted/processing/completed
chatgpt_account       -- 用户填写：ChatGPT账号
chatgpt_payment_url   -- 用户填写：支付URL
claude_email          -- 用户填写：Claude邮箱
```

**RLS策略**: 用户只能查看自己的订单

### 关键文件清单

| 文件路径 | 功能说明 |
|---------|---------|
| `app/api/payment/route.ts` | 创建支付订单 |
| `app/api/payment/notify/route.ts` | 支付回调处理 |
| `app/api/payment/success/route.ts` | 支付成功跳转 |
| `app/claim-membership/page.tsx` | 订单填写页面 |
| `components/ServiceSubmissionForm.tsx` | 服务提交表单 |
| `components/AuthProvider.tsx` | 认证上下文提供者 |
| `app/auth/login/page.tsx` | 登录页面 |
| `app/auth/signup/page.tsx` | 注册页面 |
| `database.sql` | 完整数据库结构 |

---

## 接下来的任务

### 验证码登录改造计划 🚧

#### 目标
将现有的邮箱+密码登录改为验证码登录方式

#### 技术选型
- **继续使用 Supabase** - 原生支持OTP验证码
- **支持邮箱验证码** - 无需集成短信服务商

#### 需要修改的文件
1. `app/auth/login/page.tsx` - 登录页面UI和逻辑
2. `app/auth/signup/page.tsx` - 注册页面UI和逻辑
3. `components/AuthProvider.tsx` - 添加OTP方法
4. Supabase后台配置 - 启用Email OTP

#### 注意事项 ⚠️
- **不能影响支付流程** - 支付API和订单逻辑保持不变
- **不能破坏现有数据** - 保持数据库结构兼容
- **不能修改其他文件** - 只修改认证相关文件

#### 预计改动范围
```
✅ 可以修改:
- app/auth/login/page.tsx
- app/auth/signup/page.tsx
- components/AuthProvider.tsx

❌ 不能修改:
- app/api/payment/* (支付相关)
- app/claim-membership/* (订单填写)
- components/ServiceSubmissionForm.tsx (表单)
- database.sql (数据库结构)
```

---

## Git提交记录

### 2025-11-24 12:09
```
feat: 恢复完整项目从备份文件

- 从备份文件恢复项目，包含所有最新更改
- 新增导航栏，包含菠萝logo和导航链接
- 添加菠萝logo图片(PNG)和压缩版本(WebP)
- 优化Hero区域文案和三个绿色勾选项
- 改进支付弹窗为窄条形式，响应式适配手机端
- 优化注册弹窗样式，修复按钮跳转为同一窗口
- 修复移动端布局问题，防止内容溢出
- 更新package依赖

强制推送覆盖: git push -f origin main
```

---

## 待办事项

### 短期任务
- [ ] 实现验证码登录功能
- [ ] 实现验证码注册功能
- [ ] 测试验证码功能
- [ ] 确保支付流程不受影响

### 长期优化
- [ ] 订单管理后台
- [ ] 邮件通知系统
- [ ] 用户个人中心完善
- [ ] 移动端体验优化

---

## 问题记录

暂无

---

## 参考文档

- [Supabase认证指南](./SUPABASE_AUTH_GUIDE.md)
- [虎皮椒支付集成说明](./虎皮椒支付集成说明.md)
- [完整数据库结构](./database.sql)
