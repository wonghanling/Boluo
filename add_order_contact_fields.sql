ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS contact_method TEXT,
ADD COLUMN IF NOT EXISTS customer_note TEXT;

COMMENT ON COLUMN public.orders.user_email IS '用户填写的接收邮箱';
COMMENT ON COLUMN public.orders.contact_method IS '用户填写的联系方式，如微信、Telegram 或手机号';
COMMENT ON COLUMN public.orders.customer_note IS '用户下单备注';
