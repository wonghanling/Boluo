# 号码验证服务上线清单

本模块面向 Vercel + Supabase，和原 ChatGPT、Claude、卡片商城、原订单、原支付及原后台隔离。

## 1. Supabase 迁移

上线前先备份数据库，再在 Supabase SQL Editor 按顺序执行：

1. `supabase_verification_module.sql`
2. `supabase_verification_security.sql`
3. `supabase_verification_maintenance.sql`

如果前三份脚本已经执行过，再执行 `supabase_verification_us_six_numbers.sql`，把美国套餐升级为首次 1 个号码加最多 5 次换号。

迁移只新增 `verification_*` 对象，不删除或重建现有表。初始商品全部暂停销售，确认配置后再从 `/verification/admin` 开放。

## 2. Vercel 服务端环境变量

以下变量不要添加 `NEXT_PUBLIC_` 前缀：

```text
GYBN_API_BASE_URL=https://api.gynb666.com/stubs/handler_api.php
GYBN_API_KEY=上游密钥
SUPABASE_SERVICE_ROLE_KEY=Supabase 服务端密钥
ALIPAY_APP_ID=复用现有支付宝应用 ID
ALIPAY_PRIVATE_KEY=复用现有支付宝应用私钥
ALIPAY_PUBLIC_KEY=复用现有支付宝公钥
ALIPAY_SELLER_ID=支付宝商户 UID
VERIFICATION_ADMIN_EMAILS=管理员邮箱，多个邮箱用英文逗号分隔
CRON_SECRET=至少 16 位的随机高强度定时任务密钥
VERIFICATION_DATA_RETENTION_HOURS=72
```

保留项目已有的公开变量：

```text
NEXT_PUBLIC_BASE_URL=https://boluoing.com
NEXT_PUBLIC_SUPABASE_URL=现有 Supabase URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=现有 Supabase anon key
```

## 3. Vercel Cron

在 Vercel 中每天调用一次：

```text
GET /api/verification/maintenance/
Authorization: Bearer CRON_SECRET的值（Vercel Cron 自动发送）
```

该任务默认清除终态订单中超过 72 小时的手机号和验证码，不记录敏感内容。

## 4. 支付与回调

验证码服务复用原 `lib/alipay.ts`，但使用独立接口：

- 创建支付：`/api/verification/payment`
- 支付回调：`/api/verification/payment/notify`

回调会验证签名、应用 ID、商户 ID、实付金额、订单状态和重复通知。支付成功只把订单标记为待取号，不在回调中请求上游。

## 5. 灰度步骤

1. 保持全部商品 `sales_paused = true` 完成部署。
2. 确认上游余额能在 `/verification/admin` 正常显示。
3. 确认美国失败号码是否退回每次 `¥1.30` 成本；按最多 6 个号码计算，未退款时最坏成本为 `¥7.80`。
4. 调整美国售价后，只开放 `US_SHORT`，使用小额真实订单测试支付、取号、查码、换号、完成和取消。
5. 核对支付宝重复回调没有创建上游号码，并确认退款待审核队列。
6. 英国商品继续暂停；正式续租接口未提供前仅保留人工履约数据结构，不猜接口。

## 6. 发布前检查

```text
npm run build
```

还需人工验证：用户 A 无法读取用户 B 的订单；客户端包、响应和 Vercel 日志中没有 API Key、`card_code`、上游订单号、手机号或验证码。
