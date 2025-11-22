"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, AuthError } from '@supabase/supabase-js'
import { supabase, userProfile as userProfileAPI, UserProfile } from '@/lib/supabase'

// 认证上下文类型定义
interface AuthContextType {
  // 用户状态
  user: User | null
  userProfile: UserProfile | null
  loading: boolean

  // 认证操作
  signUp: (email: string, password: string) => Promise<{ error?: AuthError }>
  signIn: (email: string, password: string) => Promise<{ error?: AuthError }>
  signOut: () => Promise<{ error?: AuthError }>
  resetPassword: (email: string) => Promise<{ error?: AuthError }>
  updatePassword: (password: string) => Promise<{ error?: AuthError }>

  // 用户资料操作
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error?: any }>
  refreshProfile: () => Promise<void>
}

// 创建上下文
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// 自定义 Hook 用于使用认证上下文
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// 认证提供者组件
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  // 获取用户资料
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await userProfileAPI.get(userId)
      if (error) {
        console.error('Error fetching user profile:', error)
        return
      }

      // 检查并同步邮箱验证状态
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (currentUser && data) {
        const authVerified = !!currentUser.email_confirmed_at
        const profileVerified = data.email_verified

        // 强制同步：如果auth已验证，profile就应该是true
        if (authVerified && !profileVerified) {
          console.log('📧 强制同步邮箱验证状态到user_profiles...')
          const { error: updateError } = await supabase
            .from('user_profiles')
            .update({ email_verified: true })
            .eq('id', userId)

          if (!updateError) {
            data.email_verified = true
            console.log('✅ 邮箱验证状态强制同步成功')
          } else {
            console.error('❌ 同步验证状态失败:', updateError)
          }
        }
      }

      setUserProfile(data)
    } catch (error) {
      console.error('Error fetching user profile:', error)
    }
  }

  // 刷新用户资料
  const refreshProfile = async () => {
    if (user) {
      await fetchUserProfile(user.id)
    }
  }

  // 监听认证状态变化
  useEffect(() => {
    let mounted = true // 防止组件卸载后的状态更新

    // 获取初始会话
    const getInitialSession = async () => {
      try {
        console.log('🔍 获取初始会话...')
        const { data: { session }, error } = await supabase.auth.getSession()

        if (!mounted) return // 组件已卸载，不更新状态

        if (error) {
          console.error('❌ 获取会话失败:', error)
          setLoading(false)
          return
        }

        if (session?.user) {
          console.log('✅ 找到用户会话:', session.user.email)
          setUser(session.user)
          await fetchUserProfile(session.user.id)
        } else {
          console.log('🚫 未找到用户会话')
          setUser(null)
          setUserProfile(null)
        }
      } catch (error) {
        console.error('❌ 初始会话检查异常:', error)
        if (mounted) {
          setUser(null)
          setUserProfile(null)
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    getInitialSession()

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return // 组件已卸载，不处理

        console.log('🔄 认证状态变化:', event, session?.user?.email)

        try {
          if (event === 'SIGNED_OUT') {
            console.log('👋 用户已登出')
            setUser(null)
            setUserProfile(null)
            setLoading(false)
            return
          }

          if (session?.user) {
            console.log('👤 用户已登录:', session.user.email)
            setUser(session.user)

            // 同步获取用户资料和验证状态
            try {
              await fetchUserProfile(session.user.id)
            } catch (error) {
              console.error('❌ 获取用户资料失败:', error)
            }
          } else {
            console.log('🚫 用户未登录')
            setUser(null)
            setUserProfile(null)
          }

          setLoading(false)
        } catch (error) {
          console.error('❌ 认证状态变化处理异常:', error)
          if (mounted) {
            setLoading(false)
          }
        }
      }
    )

    // 清理函数
    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  // 注册
  const signUp = async (email: string, password: string) => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/auth/callback`
        }
      })

      if (error) {
        return { error: error || undefined }
      }

      // 如果用户创建成功，创建用户资料
      if (data.user && !data.user.email_confirmed_at) {
        // 用户需要验证邮箱，不立即创建profile
        return { error: undefined }
      }

      return { error: undefined }
    } catch (error) {
      console.error('SignUp error:', error)
      return { error: error as AuthError }
    } finally {
      setLoading(false)
    }
  }

  // 登录
  const signIn = async (email: string, password: string) => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        return { error: error || undefined }
      }

      if (data.user) {
        setUser(data.user)
        await fetchUserProfile(data.user.id)
      }

      return { error: undefined }
    } catch (error) {
      console.error('SignIn error:', error)
      return { error: error as AuthError }
    } finally {
      setLoading(false)
    }
  }

  // 登出
  const signOut = async () => {
    try {
      setLoading(true)

      // 清理本地状态
      setUser(null)
      setUserProfile(null)

      // 清理localStorage缓存
      localStorage.removeItem('hasShownRegisterPrompt')
      localStorage.removeItem('membershipClaimed')

      // 调用Supabase登出
      const { error } = await supabase.auth.signOut()

      if (error) {
        console.error('SignOut error:', error)
        // 即使Supabase登出失败，也要清理本地状态
      }

      // 强制刷新页面，确保状态完全重置
      window.location.href = '/'

      return { error: error || undefined }
    } catch (error) {
      console.error('SignOut exception:', error)

      // 发生异常时也要清理状态
      setUser(null)
      setUserProfile(null)
      localStorage.removeItem('hasShownRegisterPrompt')
      localStorage.removeItem('membershipClaimed')

      // 强制刷新页面
      window.location.href = '/'

      return { error: error as AuthError }
    }
  }

  // 重置密码
  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/auth/callback`
      })

      return { error: error || undefined }
    } catch (error) {
      console.error('Reset password error:', error)
      return { error: error as AuthError }
    }
  }

  // 更新密码
  const updatePassword = async (password: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password
      })

      return { error: error || undefined }
    } catch (error) {
      console.error('Update password error:', error)
      return { error: error as AuthError }
    }
  }

  // 更新用户资料
  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) {
      return { error: new Error('No user logged in') }
    }

    try {
      const { error } = await userProfileAPI.update(user.id, updates)

      if (!error) {
        // 刷新本地资料
        await fetchUserProfile(user.id)
      }

      return { error }
    } catch (error) {
      console.error('Update profile error:', error)
      return { error }
    }
  }

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    refreshProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// 可选：创建受保护的路由组件
interface ProtectedRouteProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  requireEmailVerified?: boolean
}

export function ProtectedRoute({
  children,
  fallback = null,
  requireEmailVerified = false
}: ProtectedRouteProps) {
  const { user, userProfile, loading } = useAuth()

  // 添加超时保护，防止无限加载
  const [timeoutReached, setTimeoutReached] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        console.warn('⚠️ ProtectedRoute加载超时，强制显示内容')
        setTimeoutReached(true)
      }
    }, 5000) // 5秒超时

    if (!loading) {
      clearTimeout(timer)
    }

    return () => clearTimeout(timer)
  }, [loading])

  // 如果超时了，显示错误状态
  if (timeoutReached && loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">加载超时</h2>
          <p className="text-gray-600 mb-6">
            页面加载时间过长，请尝试刷新页面或重新登录。
          </p>
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              刷新页面
            </button>
            <a
              href="/auth/login"
              className="block w-full bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
            >
              重新登录
            </a>
          </div>
        </div>
      </div>
    )
  }

  if (loading && !timeoutReached) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">需要登录</h2>
          <p className="text-gray-600 mb-6">请登录后访问此页面</p>
          <a
            href="/auth/login"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            立即登录
          </a>
        </div>
      </div>
    )
  }

  if (requireEmailVerified && userProfile && !userProfile.email_verified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">邮箱未验证</h2>
          <p className="text-gray-600 mb-6">
            请检查您的邮箱 <strong>{user.email}</strong> 并点击验证链接以激活账户。
          </p>
          <a
            href="/auth/login"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            返回登录
          </a>
        </div>
      </div>
    )
  }

  return <>{children}</>
}