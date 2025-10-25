"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Loader2, ArrowRight } from "lucide-react"

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // 检查URL中的令牌参数
        const access_token = searchParams.get('access_token')
        const refresh_token = searchParams.get('refresh_token')
        const type = searchParams.get('type')

        if (type === 'signup') {
          // 邮箱验证回调
          if (access_token && refresh_token) {
            // 设置会话
            const { data, error } = await supabase.auth.setSession({
              access_token,
              refresh_token,
            })

            if (error) {
              console.error('Session error:', error)
              setStatus('error')
              setMessage('邮箱验证失败，请稍后重试')
              return
            }

            if (data.user) {
              setStatus('success')
              setMessage('邮箱验证成功！您的账户已激活，可以正常使用所有功能。')
            }
          } else {
            setStatus('error')
            setMessage('验证链接无效或已过期')
          }
        } else if (type === 'recovery') {
          // 密码重置回调
          if (access_token && refresh_token) {
            const { error } = await supabase.auth.setSession({
              access_token,
              refresh_token,
            })

            if (error) {
              setStatus('error')
              setMessage('密码重置链接无效或已过期')
              return
            }

            setStatus('success')
            setMessage('身份验证成功！请设置您的新密码。')

            // 跳转到密码重置页面
            setTimeout(() => {
              router.push('/auth/reset-password')
            }, 2000)
          }
        } else {
          // 其他类型的回调
          setStatus('error')
          setMessage('无效的验证链接')
        }
      } catch (error) {
        console.error('Auth callback error:', error)
        setStatus('error')
        setMessage('验证过程中发生错误，请稍后重试')
      }
    }

    handleAuthCallback()
  }, [searchParams, router])

  const handleContinue = () => {
    if (status === 'success') {
      router.push('/')
    } else {
      router.push('/auth/login')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-600 to-blue-800 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
          {/* 状态图标 */}
          <div className="mx-auto w-16 h-16 mb-6 flex items-center justify-center rounded-full">
            {status === 'loading' && (
              <div className="bg-blue-100">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
            )}
            {status === 'success' && (
              <div className="bg-green-100">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            )}
            {status === 'error' && (
              <div className="bg-red-100">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
            )}
          </div>

          {/* 标题 */}
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {status === 'loading' && '正在验证...'}
            {status === 'success' && '验证成功！'}
            {status === 'error' && '验证失败'}
          </h2>

          {/* 消息 */}
          <p className="text-gray-600 mb-8 leading-relaxed">
            {message || '正在处理您的验证请求，请稍候...'}
          </p>

          {/* 操作按钮 */}
          {status !== 'loading' && (
            <div className="space-y-4">
              <Button
                onClick={handleContinue}
                className={`w-full py-3 text-lg font-medium ${
                  status === 'success'
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {status === 'success' ? (
                  <>
                    进入首页
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </>
                ) : (
                  '返回登录'
                )}
              </Button>

              {status === 'error' && (
                <Button
                  variant="outline"
                  onClick={() => router.push('/auth/signup')}
                  className="w-full py-3 text-lg font-medium"
                >
                  重新注册
                </Button>
              )}
            </div>
          )}

          {/* 加载状态的额外信息 */}
          {status === 'loading' && (
            <div className="mt-6 text-sm text-gray-500">
              <p>这通常只需要几秒钟时间</p>
            </div>
          )}
        </div>

        {/* 页脚信息 */}
        <div className="mt-8 text-center">
          <p className="text-white/80 text-sm">
            © 2024 迅通AI. 专业的海外AI工具代充服务
          </p>
        </div>
      </div>
    </div>
  )
}