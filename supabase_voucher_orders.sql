-- Relograde 兑换码订单（不改现有 orders / service_submissions）
-- 在 Supabase SQL Editor 执行一次即可

CREATE TABLE IF NOT EXISTS public.voucher_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id TEXT UNIQUE NOT NULL,
  user_id UUID,
  user_email TEXT,
  brand_slug TEXT NOT NULL,
  product_slug TEXT NOT NULL,
  face_value NUMERIC(12, 2) NOT NULL,
  face_value_currency TEXT NOT NULL,
  is_variable BOOLEAN NOT NULL DEFAULT FALSE,
  cost_amount NUMERIC(12, 4),
  cost_currency TEXT,
  sell_cny NUMERIC(12, 2) NOT NULL,
  margin_rate NUMERIC(8, 4),
  profit_cny NUMERIC(12, 2),
  relograde_trx TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending_payment',
  voucher_code TEXT,
  voucher_serial TEXT,
  redemption_link TEXT,
  voucher_expires_at TIMESTAMPTZ,
  error_message TEXT,
  quote_snapshot JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  CONSTRAINT voucher_orders_status_check CHECK (
    status IN ('pending_payment', 'paid', 'fulfilling', 'delivered', 'failed')
  )
);

CREATE INDEX IF NOT EXISTS idx_voucher_orders_user_id ON public.voucher_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_voucher_orders_status ON public.voucher_orders(status);
CREATE INDEX IF NOT EXISTS idx_voucher_orders_created_at ON public.voucher_orders(created_at DESC);

ALTER TABLE public.voucher_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own voucher orders" ON public.voucher_orders;
CREATE POLICY "Users can view own voucher orders"
  ON public.voucher_orders FOR SELECT
  USING (auth.uid() = user_id);

-- 写入一律走 service role，不开放 anon insert/update
