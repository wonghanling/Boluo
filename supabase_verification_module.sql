-- 号码验证服务独立迁移（UTF-8）
-- 只新增对象，不修改、删除或重建现有业务表。

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.verification_products (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  product_type TEXT NOT NULL CHECK (product_type IN ('us_short', 'uk_first', 'uk_long', 'uk_renewal')),
  country_code TEXT NOT NULL CHECK (country_code IN ('187', '44')),
  sale_price NUMERIC(10, 2) NOT NULL CHECK (sale_price >= 0),
  upstream_cost_estimate NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (upstream_cost_estimate >= 0),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  sales_paused BOOLEAN NOT NULL DEFAULT FALSE,
  config JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.verification_products
  (code, name, description, product_type, country_code, sale_price, upstream_cost_estimate, is_active, sales_paused, config)
VALUES
  (
    'US_SHORT',
    '美国短期验证套餐',
    '一个当前美国号码，符合条件时累计最多使用 5 个号码。',
    'us_short',
    '187',
    3.90,
    6.50,
    TRUE,
    TRUE,
    '{"max_numbers":5,"change_wait_seconds":120,"number_ttl_seconds":1200,"max_active_orders":2,"low_balance_threshold":20}'::JSONB
  ),
  (
    'UK_FIRST',
    '英国首次验证',
    '获取英国号码并完成首次验证，不承诺长期保留。',
    'uk_first',
    '44',
    7.00,
    7.00,
    TRUE,
    TRUE,
    '{"manual_fulfillment":true}'::JSONB
  ),
  (
    'UK_LONG_MONTH',
    '英国长期首月',
    '首次验证及首月长期保留，当前由管理员人工履约。',
    'uk_long',
    '44',
    13.00,
    13.00,
    TRUE,
    TRUE,
    '{"manual_fulfillment":true,"period_days":30}'::JSONB
  ),
  (
    'UK_RENEWAL',
    '英国号码续租',
    '仅限原用户为原号码续租，当前由管理员人工处理。',
    'uk_renewal',
    '44',
    6.00,
    5.00,
    TRUE,
    TRUE,
    '{"manual_fulfillment":true,"period_days":30}'::JSONB
  )
ON CONFLICT (code) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.verification_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_order_no TEXT UNIQUE NOT NULL,
  idempotency_key UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  user_email TEXT,
  product_code TEXT NOT NULL REFERENCES public.verification_products(code),
  product_type TEXT NOT NULL CHECK (product_type IN ('us_short', 'uk_first', 'uk_long', 'uk_renewal')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refund_pending', 'refunded', 'failed')),
  fulfillment_status TEXT NOT NULL DEFAULT 'awaiting_payment' CHECK (
    fulfillment_status IN (
      'awaiting_payment', 'paid', 'ready', 'requesting_number', 'waiting_code',
      'code_received', 'completed', 'change_available', 'changing_number',
      'cancel_pending', 'cancelled', 'refund_pending', 'refunded', 'expired',
      'failed', 'manual_review'
    )
  ),
  upstream_order_id TEXT,
  card_code TEXT,
  country_code TEXT NOT NULL CHECK (country_code IN ('187', '44')),
  phone_number TEXT,
  verification_code TEXT,
  numbers_used INTEGER NOT NULL DEFAULT 0 CHECK (numbers_used >= 0 AND numbers_used <= 5),
  numbers_remaining INTEGER NOT NULL DEFAULT 5 CHECK (numbers_remaining >= 0 AND numbers_remaining <= 5),
  sale_price NUMERIC(10, 2) NOT NULL CHECK (sale_price >= 0),
  upstream_cost NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (upstream_cost >= 0),
  refund_status TEXT NOT NULL DEFAULT 'none' CHECK (refund_status IN ('none', 'upstream_refunded', 'refund_pending', 'refunded', 'rejected')),
  alipay_trade_no TEXT UNIQUE,
  paid_amount NUMERIC(10, 2),
  metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
  expires_at TIMESTAMPTZ,
  renewed_until TIMESTAMPTZ,
  last_polled_at TIMESTAMPTZ,
  poll_count INTEGER NOT NULL DEFAULT 0,
  error_code TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  paid_at TIMESTAMPTZ,
  number_received_at TIMESTAMPTZ,
  code_received_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, idempotency_key)
);

CREATE INDEX IF NOT EXISTS idx_verification_orders_user_created
  ON public.verification_orders(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_verification_orders_fulfillment
  ON public.verification_orders(fulfillment_status, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_verification_orders_product
  ON public.verification_orders(product_code, created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_verification_orders_unique_card_code
  ON public.verification_orders(card_code) WHERE card_code IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.verification_renewals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  verification_order_id UUID NOT NULL REFERENCES public.verification_orders(id) ON DELETE RESTRICT,
  payment_order_no TEXT UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  sale_price NUMERIC(10, 2) NOT NULL CHECK (sale_price >= 0),
  upstream_cost NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (upstream_cost >= 0),
  status TEXT NOT NULL DEFAULT 'awaiting_payment' CHECK (
    status IN ('awaiting_payment', 'paid', 'manual_review', 'completed', 'cancelled', 'refund_pending', 'refunded', 'failed')
  ),
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,
  upstream_reference TEXT,
  admin_notes TEXT,
  alipay_trade_no TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  paid_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_verification_renewals_order
  ON public.verification_renewals(verification_order_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_verification_renewals_pending
  ON public.verification_renewals(status, created_at);

CREATE TABLE IF NOT EXISTS public.verification_audit_logs (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  verification_order_id UUID REFERENCES public.verification_orders(id) ON DELETE SET NULL,
  actor_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_type TEXT NOT NULL CHECK (actor_type IN ('user', 'admin', 'system', 'upstream')),
  action TEXT NOT NULL,
  from_status TEXT,
  to_status TEXT,
  details JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_verification_audit_order
  ON public.verification_audit_logs(verification_order_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.verification_balance_snapshots (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  balance NUMERIC(12, 2) NOT NULL,
  is_low BOOLEAN NOT NULL DEFAULT FALSE,
  checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.verification_rate_limits (
  key_hash TEXT PRIMARY KEY,
  window_started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  request_count INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.verification_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_renewals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_balance_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_rate_limits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Verification owners can read orders" ON public.verification_orders;
CREATE POLICY "Verification owners can read orders"
  ON public.verification_orders FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Verification owners can read renewals" ON public.verification_renewals;
CREATE POLICY "Verification owners can read renewals"
  ON public.verification_renewals FOR SELECT
  USING (auth.uid() = user_id);

-- 所有写入均通过本站服务端 service_role 执行，浏览器不能直接增删改。

CREATE OR REPLACE FUNCTION public.mark_verification_payment_paid(
  p_payment_order_no TEXT,
  p_trade_no TEXT,
  p_paid_amount NUMERIC
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order public.verification_orders%ROWTYPE;
BEGIN
  SELECT * INTO v_order
  FROM public.verification_orders
  WHERE payment_order_no = p_payment_order_no
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', FALSE, 'reason', 'not_found');
  END IF;

  IF v_order.sale_price <> p_paid_amount THEN
    RETURN jsonb_build_object('ok', FALSE, 'reason', 'amount_mismatch');
  END IF;

  IF v_order.payment_status = 'paid' THEN
    IF v_order.alipay_trade_no = p_trade_no AND v_order.paid_amount = p_paid_amount THEN
      RETURN jsonb_build_object('ok', TRUE, 'reason', 'already_paid', 'order_id', v_order.id);
    END IF;
    RETURN jsonb_build_object('ok', FALSE, 'reason', 'payment_conflict');
  END IF;

  IF v_order.payment_status <> 'pending' OR v_order.fulfillment_status <> 'awaiting_payment' THEN
    RETURN jsonb_build_object('ok', FALSE, 'reason', 'invalid_status');
  END IF;

  UPDATE public.verification_orders
  SET payment_status = 'paid',
      fulfillment_status = 'ready',
      alipay_trade_no = p_trade_no,
      paid_amount = p_paid_amount,
      paid_at = NOW(),
      updated_at = NOW()
  WHERE id = v_order.id;

  INSERT INTO public.verification_audit_logs
    (verification_order_id, actor_type, action, from_status, to_status)
  VALUES
    (v_order.id, 'system', 'payment_confirmed', v_order.fulfillment_status, 'ready');

  RETURN jsonb_build_object('ok', TRUE, 'reason', 'updated', 'order_id', v_order.id);
END;
$$;

CREATE OR REPLACE FUNCTION public.claim_verification_poll(
  p_order_id UUID,
  p_user_id UUID,
  p_min_interval_seconds INTEGER DEFAULT 5
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_updated INTEGER;
BEGIN
  UPDATE public.verification_orders
  SET last_polled_at = NOW(),
      poll_count = poll_count + 1,
      updated_at = NOW()
  WHERE id = p_order_id
    AND user_id = p_user_id
    AND fulfillment_status = 'waiting_code'
    AND upstream_order_id IS NOT NULL
    AND (last_polled_at IS NULL OR last_polled_at <= NOW() - make_interval(secs => GREATEST(p_min_interval_seconds, 5)));

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated = 1;
END;
$$;

CREATE OR REPLACE FUNCTION public.consume_verification_rate_limit(
  p_key_hash TEXT,
  p_window_seconds INTEGER,
  p_limit INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.verification_rate_limits%ROWTYPE;
BEGIN
  IF p_window_seconds < 1 OR p_limit < 1 THEN
    RETURN FALSE;
  END IF;

  SELECT * INTO v_row
  FROM public.verification_rate_limits
  WHERE key_hash = p_key_hash
  FOR UPDATE;

  IF NOT FOUND THEN
    INSERT INTO public.verification_rate_limits(key_hash, request_count)
    VALUES (p_key_hash, 1);
    RETURN TRUE;
  END IF;

  IF v_row.window_started_at <= NOW() - make_interval(secs => p_window_seconds) THEN
    UPDATE public.verification_rate_limits
    SET window_started_at = NOW(), request_count = 1, updated_at = NOW()
    WHERE key_hash = p_key_hash;
    RETURN TRUE;
  END IF;

  IF v_row.request_count >= p_limit THEN
    RETURN FALSE;
  END IF;

  UPDATE public.verification_rate_limits
  SET request_count = request_count + 1, updated_at = NOW()
  WHERE key_hash = p_key_hash;
  RETURN TRUE;
END;
$$;

REVOKE ALL ON FUNCTION public.mark_verification_payment_paid(TEXT, TEXT, NUMERIC) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.claim_verification_poll(UUID, UUID, INTEGER) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.consume_verification_rate_limit(TEXT, INTEGER, INTEGER) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.mark_verification_payment_paid(TEXT, TEXT, NUMERIC) TO service_role;
GRANT EXECUTE ON FUNCTION public.claim_verification_poll(UUID, UUID, INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION public.consume_verification_rate_limit(TEXT, INTEGER, INTEGER) TO service_role;

COMMENT ON TABLE public.verification_orders IS '号码验证服务独立订单；手机号、验证码和 card_code 仅允许所有者或服务端读取。';
COMMENT ON TABLE public.verification_renewals IS '英国长期号码人工续租记录；不假设任何上游续租接口。';
