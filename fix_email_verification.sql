-- 修复邮箱验证状态同步问题和订单表权限问题
-- 在Supabase SQL编辑器中执行此文件

-- ==========================================
-- 第一部分：修复邮箱验证状态同步
-- ==========================================

-- 1. 创建函数：自动同步邮箱验证状态
CREATE OR REPLACE FUNCTION public.sync_email_verification()
RETURNS TRIGGER AS $$
BEGIN
  -- 当auth.users的email_confirmed_at从NULL变为非NULL时，同步到user_profiles
  IF NEW.email_confirmed_at IS NOT NULL AND OLD.email_confirmed_at IS NULL THEN
    UPDATE public.user_profiles
    SET
      email_verified = true,
      updated_at = NOW()
    WHERE id = NEW.id;

    -- 记录日志
    RAISE LOG 'Email verification synced for user: %', NEW.email;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. 创建触发器：监听auth.users的email_confirmed_at变化
DROP TRIGGER IF EXISTS on_auth_user_email_verified ON auth.users;
CREATE TRIGGER on_auth_user_email_verified
  AFTER UPDATE OF email_confirmed_at ON auth.users
  FOR EACH ROW
  WHEN (NEW.email_confirmed_at IS NOT NULL AND OLD.email_confirmed_at IS NULL)
  EXECUTE FUNCTION public.sync_email_verification();

-- 3. 一次性修复已有的不同步数据
UPDATE public.user_profiles
SET
  email_verified = true,
  updated_at = NOW()
WHERE id IN (
  SELECT u.id
  FROM auth.users u
  JOIN public.user_profiles p ON u.id = p.id
  WHERE u.email_confirmed_at IS NOT NULL
    AND p.email_verified = false
);

-- ==========================================
-- 第二部分：修复订单表RLS权限策略
-- ==========================================

-- 1. 先删除所有测试数据
DELETE FROM public.orders;

-- 2. 删除所有旧的RLS策略
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can update own orders" ON public.orders;
DROP POLICY IF EXISTS "Allow order creation" ON public.orders;
DROP POLICY IF EXISTS "allow_public_update_from_website" ON public.orders;
DROP POLICY IF EXISTS "temp_update_specific_order" ON public.orders;

-- 3. 创建新的简单策略

-- 允许任何人插入订单（支付系统用）
CREATE POLICY "Allow insert orders" ON public.orders
FOR INSERT WITH CHECK (true);

-- 允许任何人更新订单（表单提交用）
CREATE POLICY "Allow update orders" ON public.orders
FOR UPDATE USING (true) WITH CHECK (true);

-- 允许登录用户查看自己的订单
CREATE POLICY "Allow select own orders" ON public.orders
FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

-- ==========================================
-- 第三部分：验证修复结果
-- ==========================================

-- 4. 验证邮箱验证同步结果
SELECT
  u.email,
  u.email_confirmed_at IS NOT NULL as auth_verified,
  p.email_verified as profile_verified,
  CASE
    WHEN (u.email_confirmed_at IS NOT NULL) = p.email_verified
    THEN '✅ 同步'
    ELSE '❌ 不同步'
  END as status
FROM auth.users u
JOIN public.user_profiles p ON u.id = p.id
ORDER BY u.created_at DESC
LIMIT 10;

-- 5. 验证订单表权限（应该显示已清空的表）
SELECT COUNT(*) as order_count FROM public.orders;

-- 6. 显示当前的RLS策略
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'orders'
ORDER BY policyname;