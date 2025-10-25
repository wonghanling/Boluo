import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// 创建Supabase客户端
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// 类型定义
export interface UserProfile {
  id: string
  email: string
  qq_email: string
  created_at: string
  updated_at: string
  email_verified: boolean
}

// 认证相关函数
export const auth = {
  // 注册用户
  signUp: async (email: string, password: string) => {
    return await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`
      }
    })
  },

  // 登录用户
  signIn: async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({
      email,
      password
    })
  },

  // 登出
  signOut: async () => {
    return await supabase.auth.signOut()
  },

  // 获取当前用户
  getUser: async () => {
    return await supabase.auth.getUser()
  },

  // 重置密码
  resetPassword: async (email: string) => {
    return await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/reset-password`
    })
  }
}

// 用户配置文件相关函数
export const userProfile = {
  // 创建用户配置文件
  create: async (userId: string, email: string) => {
    return await supabase
      .from('user_profiles')
      .insert({
        id: userId,
        email,
        qq_email: email,
        email_verified: false
      })
  },

  // 获取用户配置文件
  get: async (userId: string) => {
    return await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()
  },

  // 更新用户配置文件
  update: async (userId: string, updates: Partial<UserProfile>) => {
    return await supabase
      .from('user_profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
  }
}