-- 添加 status（状态）字段和 created_at（创建时间）字段
ALTER TABLE service_submissions
ADD COLUMN IF NOT EXISTS status text DEFAULT 'submitted';

ALTER TABLE service_submissions
ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now();

-- 添加注释
COMMENT ON COLUMN service_submissions.status IS '订单状态: submitted(已提交), processing(处理中), completed(已完成), cancelled(已取消)';
COMMENT ON COLUMN service_submissions.created_at IS '订单创建时间';
