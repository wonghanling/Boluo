-- 开放英国首次验证；锁定英国长期首月和续租。
-- 在验证码模块基础迁移之后执行，不修改旧业务表。

BEGIN;

UPDATE public.verification_products
SET description = '获取一个英国 +44 号码并自动查询首次验证码，不承诺长期保留。',
    is_active = TRUE,
    sales_paused = FALSE,
    config = jsonb_build_object(
      'manual_fulfillment', FALSE,
      'change_wait_seconds', 120,
      'number_ttl_seconds', 1200,
      'max_active_orders', 2,
      'low_balance_threshold', 20
    ),
    updated_at = NOW()
WHERE code = 'UK_FIRST';

UPDATE public.verification_products
SET is_active = FALSE,
    sales_paused = TRUE,
    config = jsonb_set(COALESCE(config, '{}'::JSONB), '{manual_fulfillment}', 'true'::JSONB, TRUE),
    updated_at = NOW()
WHERE code IN ('UK_LONG_MONTH', 'UK_RENEWAL');

COMMIT;
