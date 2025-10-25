"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { supabase } from "@/lib/supabase"
import { Eye, EyeOff, ArrowLeft, Lock, Shield } from "lucide-react"

// 表单验证 schema
const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, "密码至少需要8个字符")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "密码需包含大小写字母和数字"),
  confirmPassword: z.string().min(8, "请确认密码")
}).refine((data) => data.password === data.confirmPassword, {
  message: "两次输入的密码不一致",
  path: ["confirmPassword"]
})

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

export default function ResetPasswordPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema)
  })

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true)
    setMessage(null)

    try {
      const { error } = await supabase.auth.updateUser({
        password: data.password
      })

      if (error) {
        setMessage({
          type: 'error',
          text: error.message || '密码重置失败，请稍后重试'
        })
        return
      }

      setMessage({
        type: 'success',
        text: '密码重置成功！正在跳转到登录页面...'
      })
      reset()

      // 2秒后跳转到登录页面
      setTimeout(() => {
        router.push('/auth/login')
      }, 2000)

    } catch (error) {
      console.error('Reset password error:', error)
      setMessage({
        type: 'error',
        text: '密码重置失败，请稍后重试'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-600 to-blue-800 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* 返回按钮 */}
        <div className="mb-6">
          <Button
            variant="ghost"
            className="text-white hover:bg-white/10 p-2"
            onClick={() => router.push('/auth/login')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回登录
          </Button>
        </div>

        {/* 重置密码卡片 */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* 头部 */}
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">重置密码</h2>
            <p className="text-gray-600">
              请设置您的新密码
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

          {/* 重置密码表单 */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* 新密码输入 */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                新密码
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
                确认新密码
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="请再次输入新密码"
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

            {/* 密码安全提示 */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">密码安全建议：</p>
                <ul className="space-y-1 text-blue-700">
                  <li>• 至少包含8个字符</li>
                  <li>• 包含大写字母、小写字母和数字</li>
                  <li>• 避免使用常见的密码组合</li>
                  <li>• 定期更换密码以保障账户安全</li>
                </ul>
              </div>
            </div>

            {/* 重置按钮 */}
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-medium"
              disabled={isLoading}
            >
              {isLoading ? "重置中..." : "重置密码"}
            </Button>
          </form>
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