-- 美国短期套餐升级：首次 1 个号码 + 最多换号 5 次（累计最多 6 个）
-- 在 supabase_verification_module.sql 之后执行；不修改旧业务表。

BEGIN;

ALTER TABLE public.verification_orders
  DROP CONSTRAINT IF EXISTS verification_orders_numbers_used_check;

ALTER TABLE public.verification_orders
  ADD CONSTRAINT verification_orders_numbers_used_check
  CHECK (numbers_used >= 0 AND numbers_used <= 6);

UPDATE public.verification_products
SET description = '首次获取 1 个美国号码，符合条件时最多可更换 5 次，累计最多使用 6 个号码。',
    upstream_cost_estimate = 7.80,
    config = jsonb_set(COALESCE(config, '{}'::JSONB), '{max_numbers}', '6'::JSONB, TRUE),
    updated_at = NOW()
WHERE code = 'US_SHORT';

-- 已创建但尚未结束的美国订单也增加一次本地换号额度。
-- 实际换号仍必须以上游 getCardUsage.remaining > 0 为最终依据。
UPDATE public.verification_orders
SET numbers_remaining = LEAST(5, GREATEST(0, 6 - numbers_used)),
    metadata = jsonb_set(COALESCE(metadata, '{}'::JSONB), '{max_numbers}', '6'::JSONB, TRUE),
    updated_at = NOW()
WHERE product_code = 'US_SHORT'
  AND fulfillment_status IN (
    'awaiting_payment', 'paid', 'ready', 'requesting_number',
    'waiting_code', 'change_available', 'changing_number'
  )
  AND numbers_remaining < LEAST(5, GREATEST(0, 6 - numbers_used));

COMMIT;
