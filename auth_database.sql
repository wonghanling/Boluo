-- ================================
-- 用户认证系统 - 仅登录注册功能
-- 不涉及支付和业务逻辑
-- ================================

-- 1. 用户配置文件表（扩展 auth.users）
CREATE TABLE IF NOT EXISTS public.user_profiles (
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

-- ================================
-- 创建索引
-- ================================

CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_qq_email ON public.user_profiles(qq_email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_created_at ON public.user_profiles(created_at);

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

-- 为用户配置文件表添加更新触发器
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================
-- 配置 Row Level Security (RLS) 策略
-- ================================

-- 启用 RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- 用户配置文件 RLS 策略
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ================================
-- 自动化函数
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
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
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

-- ================================
-- 验证创建结果
-- ================================

-- 查看创建的表
SELECT
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'user_profiles'
ORDER BY ordinal_position;