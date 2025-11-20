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
    const handleEmailVerification = async () => {
      try {
        console.log('🔍 开始处理邮箱验证...')

        // 等待一下让Supabase处理完成
        await new Promise(resolve => setTimeout(resolve, 1000))

        // 直接检查当前用户状态
        const { data: { user }, error } = await supabase.auth.getUser()

        console.log('📧 当前用户状态:', user ? '已登录' : '未登录', error)

        if (error) {
          console.error('❌ 获取用户状态失败:', error)
          setStatus('error')
          setMessage('验证过程中发生错误，请重新注册')
          return
        }

        if (user) {
          console.log('✅ 用户已登录，邮箱:', user.email)

          // 检查邮箱是否已验证
          if (user.email_confirmed_at) {
            console.log('✅ 邮箱已验证，时间:', user.email_confirmed_at)
            setStatus('success')
            setMessage('邮箱验证成功！您的账户已激活。')
          } else {
            console.log('⚠️ 邮箱未验证')
            setStatus('error')
            setMessage('邮箱验证未完成，请检查邮件并重新点击验证链接')
          }
        } else {
          console.log('❌ 用户未登录')
          setStatus('error')
          setMessage('验证链接无效或已过期，请重新注册')
        }

      } catch (error) {
        console.error('❌ 验证处理异常:', error)
        setStatus('error')
        setMessage('验证过程中发生错误，请稍后重试')
      }
    }

    // 延迟执行，让页面完全加载
    const timer = setTimeout(handleEmailVerification, 500)
    return () => clearTimeout(timer)
  }, [])

  const handleContinue = () => {
    if (status === 'success') {
      router.push('/')
    } else {
      router.push('/auth/signup')
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
            {message || '正在处理您的邮箱验证，请稍候...'}
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
                  '重新注册'
                )}
              </Button>
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