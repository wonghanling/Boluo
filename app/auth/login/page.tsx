"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useAuth } from "@/components/AuthProvider"
import { Eye, EyeOff, ArrowLeft, Mail, Lock, LogIn } from "lucide-react"

// 表单验证 schema（密码登录）
const signInSchema = z.object({
  email: z
    .string()
    .min(1, "请输入邮箱地址")
    .email("请输入有效的邮箱地址"),
  password: z
    .string()
    .min(1, "请输入密码")
})

type SignInFormData = z.infer<typeof signInSchema>

export default function LoginPage() {
  const router = useRouter()
  const auth = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null)

  // 登录模式：password 或 otp
  const [loginMode, setLoginMode] = useState<'password' | 'otp'>('password')

  // 验证码相关状态
  const [otpEmail, setOtpEmail] = useState("")
  const [showOtpInput, setShowOtpInput] = useState(false)
  const [otp, setOtp] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [isSendingOtp, setIsSendingOtp] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema)
  })

  const onSubmit = async (data: SignInFormData) => {
    setIsLoading(true)
    setMessage(null)

    try {
      const { data: authData, error } = await auth.signIn(data.email, data.password)

      if (error) {
        // 处理不同类型的错误
        if (error.message.includes("Invalid login credentials")) {
          setMessage({
            type: 'error',
            text: '邮箱或密码错误，请检查后重试'
          })
        } else if (error.message.includes("Email not confirmed")) {
          setMessage({
            type: 'error',
            text: '请先验证您的邮箱地址，检查邮箱中的验证链接'
          })
        } else {
          setMessage({
            type: 'error',
            text: error.message || '登录失败，请稍后重试'
          })
        }
        return
      }

      if (authData.user) {
        setMessage({
          type: 'success',
          text: '登录成功！正在跳转...'
        })

        // 1秒后跳转到首页
        setTimeout(() => {
          router.push('/')
        }, 1000)
      }

    } catch (error) {
      console.error('Login error:', error)
      setMessage({
        type: 'error',
        text: '登录失败，请稍后重试'
      })
    } finally {
      setIsLoading(false)
    }
  }

  // 发送OTP验证码
  const handleSendOtp = async () => {
    if (!otpEmail || !otpEmail.includes('@')) {
      setMessage({
        type: 'error',
        text: '请输入有效的邮箱地址'
      })
      return
    }

    setIsSendingOtp(true)
    setMessage(null)

    try {
      const { error } = await auth.signInWithOtp(otpEmail)

      if (error) {
        setMessage({
          type: 'error',
          text: '发送验证码失败，请稍后重试'
        })
        return
      }

      setShowOtpInput(true)
      setMessage({
        type: 'success',
        text: `验证码已发送到 ${otpEmail}，请查收邮件`
      })
    } catch (error) {
      console.error('Send OTP error:', error)
      setMessage({
        type: 'error',
        text: '发送验证码失败，请稍后重试'
      })
    } finally {
      setIsSendingOtp(false)
    }
  }

  // 验证OTP
  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      setMessage({
        type: 'error',
        text: '请输入6位验证码'
      })
      return
    }

    setIsVerifying(true)
    setMessage(null)

    try {
      const { error, user } = await auth.verifyOtp(otpEmail, otp)

      if (error) {
        setMessage({
          type: 'error',
          text: '验证码错误或已过期，请重新获取'
        })
        return
      }

      if (user) {
        setMessage({
          type: 'success',
          text: '登录成功！正在跳转...'
        })

        setTimeout(() => {
          router.push('/')
        }, 1000)
      }
    } catch (error) {
      console.error('Verify OTP error:', error)
      setMessage({
        type: 'error',
        text: '验证失败，请稍后重试'
      })
    } finally {
      setIsVerifying(false)
    }
  }

  const handleForgotPassword = async () => {
    const email = (document.getElementById('email') as HTMLInputElement)?.value

    if (!email) {
      setMessage({
        type: 'error',
        text: '请先输入您的邮箱地址'
      })
      return
    }

    try {
      const { error } = await auth.resetPassword(email)

      if (error) {
        setMessage({
          type: 'error',
          text: '发送重置邮件失败，请稍后重试'
        })
      } else {
        setMessage({
          type: 'success',
          text: '密码重置邮件已发送，请检查您的邮箱'
        })
      }
    } catch (error) {
      console.error('Reset password error:', error)
      setMessage({
        type: 'error',
        text: '发送重置邮件失败，请稍后重试'
      })
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* 顶部渐变区域 */}
      <div className="bg-gradient-to-b from-yellow-400 to-blue-600 flex-shrink-0 pt-8 pb-16">
        <div className="max-w-md mx-auto px-4">
          {/* 返回按钮 */}
          <div className="mb-6">
            <Button
              variant="ghost"
              className="text-white hover:bg-white/10 p-2"
              onClick={() => router.back()}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回
            </Button>
          </div>
        </div>
      </div>

      {/* 表单区域 - 纯色背景 */}
      <div className="flex-1 bg-blue-600 flex items-start justify-center px-4 py-8">
        <div className="max-w-md w-full">
          {/* 登录卡片 */}
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            {/* 头部 */}
            <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
              <LogIn className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">登录账户</h2>
            <p className="text-gray-600">
              欢迎回来！请登录您的迅通AI账户
            </p>
          </div>

          {/* 消息提示 */}
          {message && (
            <div className={`p-4 rounded-lg mb-6 ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {message.text}
            </div>
          )}

          {/* 登录模式切换 */}
          <div className="flex gap-2 mb-6">
            <Button
              type="button"
              className={`flex-1 ${loginMode === 'password' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
              onClick={() => {
                setLoginMode('password')
                setShowOtpInput(false)
                setMessage(null)
              }}
            >
              密码登录
            </Button>
            <Button
              type="button"
              className={`flex-1 ${loginMode === 'otp' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
              onClick={() => {
                setLoginMode('otp')
                setMessage(null)
              }}
            >
              验证码登录
            </Button>
          </div>

          {/* 密码登录表单 */}
          {loginMode === 'password' && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* 邮箱输入 */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                邮箱地址
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="email"
                  type="email"
                  placeholder="请输入您的邮箱地址"
                  className="pl-10"
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* 密码输入 */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                密码
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="请输入您的密码"
                  className="pl-10 pr-10"
                  {...register("password")}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* 忘记密码 */}
            <div className="flex justify-end">
              <button
                type="button"
                className="text-sm text-blue-600 hover:text-blue-500 font-medium"
                onClick={handleForgotPassword}
              >
                忘记密码？
              </button>
            </div>

            {/* 登录按钮 */}
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-medium"
              disabled={isLoading}
            >
              {isLoading ? "登录中..." : "登录"}
            </Button>
          </form>
          )}

          {/* 验证码登录表单 */}
          {loginMode === 'otp' && (
            <div className="space-y-6">
              {!showOtpInput ? (
                <>
                  {/* 邮箱输入 */}
                  <div>
                    <label htmlFor="otpEmail" className="block text-sm font-medium text-gray-700 mb-2">
                      邮箱地址
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <Input
                        id="otpEmail"
                        type="email"
                        placeholder="请输入您的邮箱地址"
                        className="pl-10"
                        value={otpEmail}
                        onChange={(e) => setOtpEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* 发送验证码按钮 */}
                  <Button
                    type="button"
                    onClick={handleSendOtp}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-medium"
                    disabled={isSendingOtp || !otpEmail}
                  >
                    {isSendingOtp ? "发送中..." : "发送验证码"}
                  </Button>
                </>
              ) : (
                <>
                  {/* 验证码输入 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      验证码
                    </label>
                    <p className="text-sm text-gray-600 mb-3">
                      验证码已发送到 <span className="font-medium">{otpEmail}</span>
                    </p>
                    <Input
                      type="text"
                      placeholder="请输入6位验证码"
                      className="text-center text-lg tracking-widest"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      maxLength={6}
                    />
                  </div>

                  {/* 验证登录按钮 */}
                  <Button
                    type="button"
                    onClick={handleVerifyOtp}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg font-medium"
                    disabled={isVerifying || otp.length !== 6}
                  >
                    {isVerifying ? "验证中..." : "验证并登录"}
                  </Button>

                  {/* 重新发送 */}
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setShowOtpInput(false)
                        setOtp("")
                      }}
                      className="text-sm text-blue-600 hover:text-blue-500"
                    >
                      重新发送验证码
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* 注册链接 */}
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              还没有账户？
              <Link
                href="/auth/signup"
                className="text-blue-600 hover:text-blue-500 font-medium ml-1"
              >
                立即注册
              </Link>
            </p>
          </div>

          {/* 第三方登录分割线 */}
          <div className="mt-8 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">或者</span>
            </div>
          </div>

          {/* 快速体验 */}
          <div className="mt-6">
            <Button
              type="button"
              variant="outline"
              className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
              onClick={() => router.push('/')}
            >
              继续浏览（无需登录）
            </Button>
          </div>
        </div>

          {/* 页脚信息 */}
          <div className="mt-8 text-center">
            <p className="text-white/80 text-sm">
              © 2024 迅通AI. 专业的海外AI工具代充服务
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}