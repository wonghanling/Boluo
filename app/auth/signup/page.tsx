"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useAuth } from "@/components/AuthProvider"
import { Eye, EyeOff, ArrowLeft, Mail, Lock, User } from "lucide-react"

// 表单验证 schema
const signUpSchema = z.object({
  email: z
    .string()
    .min(1, "请输入邮箱地址")
    .email("请输入有效的邮箱地址")
    .refine((email) => email.endsWith("@qq.com"), {
      message: "请使用QQ邮箱注册（如：123456789@qq.com）"
    }),
  password: z
    .string()
    .min(8, "密码至少需要8个字符")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "密码需包含大小写字母和数字"),
  confirmPassword: z.string().min(8, "请确认密码")
}).refine((data) => data.password === data.confirmPassword, {
  message: "两次输入的密码不一致",
  path: ["confirmPassword"]
})

type SignUpFormData = z.infer<typeof signUpSchema>

export default function SignUpPage() {
  const router = useRouter()
  const auth = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null)

  // 获取返回URL
  const [returnUrl, setReturnUrl] = useState('/')

  // 验证码相关状态
  const [showOtpInput, setShowOtpInput] = useState(false)
  const [otp, setOtp] = useState("")
  const [userEmail, setUserEmail] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)

  // 页面加载时获取返回URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const redirect = params.get('returnUrl')
      || (document.referrer && !document.referrer.includes('/auth/') ? document.referrer : '/')
    setReturnUrl(redirect)
    console.log('📍 注册成功后将返回:', redirect)
  }, [])

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    getValues
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema)
  })

  const onSubmit = async (data: SignUpFormData) => {
    setIsLoading(true)
    setMessage(null)

    try {
      // 步骤1：创建账户
      const { data: authData, error } = await auth.signUp(data.email, data.password)

      if (error) {
        // 处理不同类型的错误
        if (error.message.includes("already registered")) {
          setMessage({
            type: 'error',
            text: '该邮箱已被注册，请尝试登录或使用其他邮箱'
          })
        } else if (error.message.includes("invalid email")) {
          setMessage({
            type: 'error',
            text: '邮箱格式不正确，请检查后重试'
          })
        } else {
          setMessage({
            type: 'error',
            text: error.message || '注册失败，请稍后重试'
          })
        }
        return
      }

      if (authData?.user) {
        // 步骤2：发送验证码
        setUserEmail(data.email)
        const { error: otpError } = await auth.sendOtpForSignup(data.email)

        if (otpError) {
          setMessage({
            type: 'error',
            text: '发送验证码失败，请稍后重试'
          })
          return
        }

        // 显示验证码输入框
        setShowOtpInput(true)
        setMessage({
          type: 'success',
          text: `验证码已发送到 ${data.email}，请查收邮件`
        })
      }

    } catch (error) {
      console.error('Registration error:', error)
      setMessage({
        type: 'error',
        text: '注册失败，请稍后重试'
      })
    } finally {
      setIsLoading(false)
    }
  }

  // 验证OTP验证码
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
      const { error, user } = await auth.verifyOtp(userEmail, otp)

      if (error) {
        setMessage({
          type: 'error',
          text: '验证码错误或已过期，请重新获取'
        })
        return
      }

      if (user) {
        console.log('✅ 注册验证成功，准备跳转到:', returnUrl)
        setMessage({
          type: 'success',
          text: '验证成功！正在跳转...'
        })

        // 0.5秒后跳转到返回页面
        setTimeout(() => {
          if (returnUrl && returnUrl !== window.location.href) {
            window.location.href = returnUrl
          } else {
            router.push('/')
          }
        }, 500)
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
          {/* 注册卡片 */}
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            {/* 头部 */}
            <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
              <User className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">创建账户</h2>
            <p className="text-gray-600">
              注册迅通AI账户，享受专业的海外AI服务
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

          {/* 注册表单 */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* QQ邮箱输入 */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                QQ邮箱
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="email"
                  type="email"
                  placeholder="请输入您的QQ邮箱（如：123456789@qq.com）"
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
                  placeholder="至少8位，包含大小写字母和数字"
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

            {/* 确认密码输入 */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                确认密码
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="请再次输入密码"
                  className="pl-10 pr-10"
                  {...register("confirmPassword")}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-600 text-sm mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* 服务条款 */}
            <div className="text-sm text-gray-600">
              注册即表示您同意我们的
              <Link href="/terms" className="text-blue-600 hover:text-blue-500 font-medium">
                服务条款
              </Link>
              {" "}和{" "}
              <Link href="/privacy" className="text-blue-600 hover:text-blue-500 font-medium">
                隐私政策
              </Link>
            </div>

            {/* 注册按钮 */}
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-medium"
              disabled={isLoading}
            >
              {isLoading ? "注册中..." : "创建账户"}
            </Button>
          </form>

          {/* 验证码输入区域 */}
          {showOtpInput && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                验证您的邮箱
              </h3>
              <p className="text-sm text-gray-600 mb-4 text-center">
                我们已发送验证码到 <span className="font-medium">{userEmail}</span>
              </p>

              <div className="space-y-4">
                <div>
                  <Input
                    type="text"
                    placeholder="请输入6位验证码"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="text-center text-lg tracking-widest"
                    maxLength={6}
                  />
                </div>

                <Button
                  onClick={handleVerifyOtp}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  disabled={isVerifying || otp.length !== 6}
                >
                  {isVerifying ? "验证中..." : "验证并登录"}
                </Button>
              </div>
            </div>
          )}

          {/* 登录链接 */}
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              已有账户？
              <Link
                href="/auth/login"
                className="text-blue-600 hover:text-blue-500 font-medium ml-1"
              >
                立即登录
              </Link>
            </p>
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