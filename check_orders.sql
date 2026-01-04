-- 查看最近的订单记录及其支付状态
SELECT 
  order_id,
  user_email,
  amount,
  service_type,
  payment_status,
  created_at
FROM orders
ORDER BY created_at DESC
LIMIT 10;
