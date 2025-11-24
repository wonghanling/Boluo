-- ============================================
-- 全新数据库表结构：订单表 + 服务信息表
-- 日期：2025-11-24
-- 说明：两表完全分离，互不影响
-- ============================================

-- ============================================
-- 表1：订单表（只存支付信息）
-- ============================================
DROP TABLE IF EXISTS public.orders CASCADE;

CREATE TABLE public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- 订单号
  order_id TEXT UNIQUE NOT NULL,

  -- 用户信息（支付时记录，永不修改）
  user_id UUID REFERENCES auth.users(id),
  user_email TEXT,

  -- 支付信息
  amount DECIMAL(10, 2) NOT NULL,
  service_type TEXT NOT NULL,
  payment_status TEXT DEFAULT 'pending' NOT NULL,
    -- pending: 等待支付
    -- paid: 已支付
    -- refunded: 已退款
  payment_method TEXT DEFAULT 'xunhupay',

  -- 虎皮椒交易信息
  trade_order_id TEXT,
  transaction_id TEXT,

  -- 元数据
  ip_address TEXT,
  user_agent TEXT,

  -- 时间
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  paid_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT check_payment_status CHECK (payment_status IN ('pending', 'paid', 'refunded'))
);

-- 索引
CREATE INDEX idx_orders_order_id ON public.orders(order_id);
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_payment_status ON public.orders(payment_status);
CREATE INDEX idx_orders_created_at ON public.orders(created_at DESC);

-- RLS策略
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert orders"
  ON public.orders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update orders"
  ON public.orders FOR UPDATE
  USING (true);

-- ============================================
-- 表2：服务信息提交表（存用户填写的信息）
-- ============================================
DROP TABLE IF EXISTS public.service_submissions CASCADE;

CREATE TABLE public.service_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- 关联订单号（一对一）
  order_id TEXT UNIQUE NOT NULL,

  -- 用户信息（提交时记录）
  user_id UUID REFERENCES auth.users(id),
  user_email TEXT,

  -- 服务信息（用户填写）
  chatgpt_account TEXT,
  chatgpt_payment_url TEXT,
  claude_email TEXT,

  -- 处理状态
  status TEXT DEFAULT 'submitted' NOT NULL,
    -- submitted: 已提交
    -- processing: 处理中
    -- completed: 已完成
    -- failed: 失败

  -- 管理员备注
  admin_notes TEXT,

  -- 时间
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT check_submission_status CHECK (status IN ('submitted', 'processing', 'completed', 'failed'))
);

-- 索引
CREATE INDEX idx_submissions_order_id ON public.service_submissions(order_id);
CREATE INDEX idx_submissions_user_id ON public.service_submissions(user_id);
CREATE INDEX idx_submissions_status ON public.service_submissions(status);
CREATE INDEX idx_submissions_submitted_at ON public.service_submissions(submitted_at DESC);

-- RLS策略
ALTER TABLE public.service_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own submissions"
  ON public.service_submissions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert submissions"
  ON public.service_submissions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update own submissions"
  ON public.service_submissions FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- 视图：方便联合查询
-- ============================================
CREATE OR REPLACE VIEW public.orders_full AS
SELECT
  o.id,
  o.order_id,
  o.user_id,
  o.user_email,
  o.amount,
  o.service_type,
  o.payment_status,
  o.created_at,
  o.paid_at,

  s.id AS submission_id,
  s.chatgpt_account,
  s.chatgpt_payment_url,
  s.claude_email,
  s.status AS submission_status,
  s.admin_notes,
  s.submitted_at,
  s.completed_at

FROM public.orders o
LEFT JOIN public.service_submissions s ON o.order_id = s.order_id;

-- ============================================
-- 说明
-- ============================================

/*
新架构优势：

1. 完全分离
   - orders: 只管支付
   - service_submissions: 只管服务信息

2. 解决登录状态问题
   - 支付时的user_id在orders表，永不改
   - 提交信息时创建新记录，不影响订单

3. 流程清晰
   创建订单 → 支付成功 → 填写信息 → 提交到service_submissions

4. 使用方式
   - 查询订单：SELECT * FROM orders WHERE user_id = 'xxx'
   - 查询服务信息：SELECT * FROM service_submissions WHERE order_id = 'xxx'
   - 联合查询：SELECT * FROM orders_full WHERE user_id = 'xxx'
*/
