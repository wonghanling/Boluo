-- 号码验证服务敏感数据维护（在前两份验证码迁移之后执行）

CREATE OR REPLACE FUNCTION public.redact_verification_sensitive_data(
  p_retention_hours INTEGER DEFAULT 72
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_updated INTEGER;
BEGIN
  IF p_retention_hours < 1 THEN
    RAISE EXCEPTION 'retention hours must be positive';
  END IF;

  UPDATE public.verification_orders
  SET phone_number = NULL,
      verification_code = NULL,
      updated_at = NOW()
  WHERE fulfillment_status IN ('completed', 'cancelled', 'refunded', 'expired', 'failed')
    AND COALESCE(completed_at, cancelled_at, updated_at) <= NOW() - make_interval(hours => p_retention_hours)
    AND (phone_number IS NOT NULL OR verification_code IS NOT NULL);

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated;
END;
$$;

REVOKE ALL ON FUNCTION public.redact_verification_sensitive_data(INTEGER) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.redact_verification_sensitive_data(INTEGER) TO service_role;

COMMENT ON FUNCTION public.redact_verification_sensitive_data(INTEGER)
  IS '清除终态验证订单中的手机号和验证码；建议由 Vercel Cron 每日通过受保护的维护接口调用。';
