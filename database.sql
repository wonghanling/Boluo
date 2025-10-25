-- ================================
-- 用户认证数据库表结构 - Supabase SQL
-- ================================

-- 1. 启用 Row Level Security (RLS)
-- 注意：auth.users 表由 Supabase 自动管理，无需创建

-- 2. 创建用户配置文件表
CREATE TABLE public.user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  qq_email TEXT NOT NULL, -- QQ邮箱地址
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  email_verified BOOLEAN DEFAULT FALSE NOT NULL,

  -- 约束
  CONSTRAINT valid_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT valid_qq_email_format CHECK (qq_email ~* '^[0-9]+@qq\.com$')
);

-- 3. 创建用户订单表（关联到支付系统）
CREATE TABLE public.user_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  order_id TEXT UNIQUE NOT NULL, -- 对应现有支付系统的订单号
  service_type TEXT NOT NULL,
  plan_index INTEGER NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending' NOT NULL, -- pending, completed, failed, refunded
  payment_method TEXT DEFAULT 'xunhupay' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,

  -- 约束
  CONSTRAINT valid_status CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  CONSTRAINT positive_amount CHECK (amount > 0)
);

-- 4. 创建用户服务激活表
CREATE TABLE public.user_services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  order_id UUID REFERENCES public.user_orders(id) ON DELETE CASCADE NOT NULL,
  service_type TEXT NOT NULL,
  service_data JSONB, -- 存储服务相关数据（如ChatGPT账号信息等）
  status TEXT DEFAULT 'active' NOT NULL, -- active, suspended, expired
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,

  -- 约束
  CONSTRAINT valid_service_status CHECK (status IN ('active', 'suspended', 'expired'))
);

-- 5. 创建邮箱验证令牌表
CREATE TABLE public.email_verification_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ================================
-- 创建索引以提高查询性能
-- ================================

-- 用户配置文件索引
CREATE INDEX idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX idx_user_profiles_qq_email ON public.user_profiles(qq_email);
CREATE INDEX idx_user_profiles_created_at ON public.user_profiles(created_at);

-- 用户订单索引
CREATE INDEX idx_user_orders_user_id ON public.user_orders(user_id);
CREATE INDEX idx_user_orders_order_id ON public.user_orders(order_id);
CREATE INDEX idx_user_orders_status ON public.user_orders(status);
CREATE INDEX idx_user_orders_created_at ON public.user_orders(created_at);

-- 用户服务索引
CREATE INDEX idx_user_services_user_id ON public.user_services(user_id);
CREATE INDEX idx_user_services_order_id ON public.user_services(order_id);
CREATE INDEX idx_user_services_status ON public.user_services(status);
CREATE INDEX idx_user_services_expires_at ON public.user_services(expires_at);

-- 邮箱验证令牌索引
CREATE INDEX idx_email_verification_tokens_user_id ON public.email_verification_tokens(user_id);
CREATE INDEX idx_email_verification_tokens_token ON public.email_verification_tokens(token);
CREATE INDEX idx_email_verification_tokens_expires_at ON public.email_verification_tokens(expires_at);

-- ================================
-- 创建更新时间触发器
-- ================================

-- 更新updated_at字段的函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 为所有表添加更新触发器
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_orders_updated_at
  BEFORE UPDATE ON public.user_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_services_updated_at
  BEFORE UPDATE ON public.user_services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================
-- 配置 Row Level Security (RLS) 策略
-- ================================

-- 启用 RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_verification_tokens ENABLE ROW LEVEL SECURITY;

-- 用户配置文件 RLS 策略
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 用户订单 RLS 策略
CREATE POLICY "Users can view own orders" ON public.user_orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own orders" ON public.user_orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 用户服务 RLS 策略
CREATE POLICY "Users can view own services" ON public.user_services
  FOR SELECT USING (auth.uid() = user_id);

-- 邮箱验证令牌 RLS 策略（仅系统可操作）
CREATE POLICY "System can manage verification tokens" ON public.email_verification_tokens
  FOR ALL USING (false); -- 只允许通过 service_role 密钥操作

-- ================================
-- 创建数据库函数
-- ================================

-- 函数：创建用户配置文件（注册时自动调用）
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, qq_email)
  VALUES (NEW.id, NEW.email, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 触发器：用户注册时自动创建配置文件
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 函数：检查QQ邮箱格式
CREATE OR REPLACE FUNCTION public.is_valid_qq_email(email_address TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN email_address ~* '^[0-9]+@qq\.com$';
END;
$$ LANGUAGE plpgsql;

-- 函数：生成邮箱验证令牌
CREATE OR REPLACE FUNCTION public.generate_email_verification_token(user_uuid UUID)
RETURNS TEXT AS $$
DECLARE
  token_value TEXT;
BEGIN
  -- 生成32字符随机令牌
  token_value := encode(gen_random_bytes(16), 'hex');

  -- 插入令牌记录（24小时有效期）
  INSERT INTO public.email_verification_tokens (user_id, token, expires_at)
  VALUES (user_uuid, token_value, NOW() + INTERVAL '24 hours');

  RETURN token_value;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 函数：验证邮箱验证令牌
CREATE OR REPLACE FUNCTION public.verify_email_token(token_value TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  token_record RECORD;
BEGIN
  -- 查找有效的令牌
  SELECT * FROM public.email_verification_tokens
  WHERE token = token_value
    AND NOT used
    AND expires_at > NOW()
  INTO token_record;

  IF token_record.id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- 标记令牌为已使用
  UPDATE public.email_verification_tokens
  SET used = TRUE
  WHERE id = token_record.id;

  -- 标记用户邮箱为已验证
  UPDATE public.user_profiles
  SET email_verified = TRUE
  WHERE id = token_record.user_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================
-- 清理过期令牌的函数（可以通过 cron 定期执行）
-- ================================

CREATE OR REPLACE FUNCTION public.cleanup_expired_tokens()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.email_verification_tokens
  WHERE expires_at < NOW() - INTERVAL '7 days';

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;