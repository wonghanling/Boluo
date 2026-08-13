-- 号码验证服务安全增强（请在 supabase_verification_module.sql 之后执行）

REVOKE ALL ON public.verification_products FROM anon, authenticated;
REVOKE ALL ON public.verification_orders FROM anon, authenticated;
REVOKE ALL ON public.verification_renewals FROM anon, authenticated;
REVOKE ALL ON public.verification_audit_logs FROM anon, authenticated;
REVOKE ALL ON public.verification_balance_snapshots FROM anon, authenticated;
REVOKE ALL ON public.verification_rate_limits FROM anon, authenticated;

-- 客户端即使绕过本站 API 直连 Supabase，也无法读取 card_code、上游单号或内部错误。
GRANT SELECT (
  id, payment_order_no, user_id, product_code, product_type, payment_status,
  fulfillment_status, country_code, phone_number, verification_code,
  numbers_used, numbers_remaining, sale_price, refund_status, expires_at,
  renewed_until, created_at, paid_at, number_received_at, code_received_at,
  completed_at, cancelled_at, updated_at
) ON public.verification_orders TO authenticated;

GRANT SELECT (
  id, verification_order_id, payment_order_no, user_id, sale_price, status,
  period_start, period_end, created_at, paid_at, completed_at, updated_at
) ON public.verification_renewals TO authenticated;
