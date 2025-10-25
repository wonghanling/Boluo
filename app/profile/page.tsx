"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useAuth, ProtectedRoute } from "@/components/AuthProvider"
import { ArrowLeft, User, Mail, Save, Eye, EyeOff } from "lucide-react"

// 表单验证 schema
const profileSchema = z.object({
  display_name: z.string().optional(),
  current_password: z.string().optional(),
  new_password: z.string().optional(),
  confirm_password: z.string().optional()
}).refine((data) => {
  if (data.new_password && data.new_password.length > 0) {
    return data.new_password.length >= 8 && /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(data.new_password)
  }
  return true
}, {
  message: "新密码需至少8位，包含大小写字母和数字",
  path: ["new_password"]
}).refine((data) => {
  if (data.new_password && data.confirm_password) {
    return data.new_password === data.confirm_password
  }
  return true
}, {
  message: "两次输入的密码不一致",
  path: ["confirm_password"]
})

type ProfileFormData = z.infer<typeof profileSchema>

function ProfilePageContent() {
  const { user, userProfile, updateProfile, updatePassword } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      display_name: userProfile?.display_name || ''
    }
  })

  const newPassword = watch('new_password')

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true)
    setMessage(null)

    try {
      // 更新个人资料
      if (data.display_name !== userProfile?.display_name) {
        const { error: profileError } = await updateProfile({
          display_name: data.display_name
        })

        if (profileError) {
          setMessage({
            type: 'error',
            text: '更新个人资料失败，请稍后重试'
          })
          return
        }
      }

      // 更新密码
      if (data.new_password && data.new_password.length > 0) {
        const { error: passwordError } = await updatePassword(data.new_password)

        if (passwordError) {
          setMessage({
            type: 'error',
            text: '更新密码失败，请稍后重试'
          })
          return
        }
      }

      setMessage({
        type: 'success',
        text: '个人资料更新成功！'
      })

      // 清空密码字段
      reset({
        display_name: data.display_name,
        current_password: '',
        new_password: '',
        confirm_password: ''
      })

    } catch (error) {
      console.error('Update profile error:', error)
      setMessage({
        type: 'error',
        text: '更新失败，请稍后重试'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* 返回按钮 */}
        <div className="mb-6">
          <Button
            variant="ghost"
            className="text-gray-600 hover:text-gray-900"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回
          </Button>
        </div>

        {/* 个人设置卡片 */}
        <div className="bg-white rounded-lg shadow-lg">
          {/* 头部 */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <h1 className="text-2xl font-bold text-gray-900">个人设置</h1>
                <p className="text-gray-600">管理您的账户信息和安全设置</p>
              </div>
            </div>
          </div>

          {/* 消息提示 */}
          {message && (
            <div className={`mx-6 mt-6 p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {message.text}
            </div>
          )}

          {/* 表单 */}
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
            {/* 基本信息 */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">基本信息</h3>

              {/* 邮箱地址（只读） */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  邮箱地址
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="pl-10 bg-gray-50 text-gray-500"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  邮箱地址无法修改
                </p>
              </div>

              {/* 显示名称 */}
              <div className="mb-4">
                <label htmlFor="display_name" className="block text-sm font-medium text-gray-700 mb-2">
                  显示名称
                </label>
                <Input
                  id="display_name"
                  type="text"
                  placeholder="请输入您的显示名称（可选）"
                  {...register("display_name")}
                />
                {errors.display_name && (
                  <p className="text-red-600 text-sm mt-1">{errors.display_name.message}</p>
                )}
              </div>

              {/* 邮箱验证状态 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  邮箱验证状态
                </label>
                <div className="flex items-center">
                  {userProfile?.email_verified ? (
                    <span className="flex items-center text-green-600">
                      <Mail className="w-4 h-4 mr-2" />
                      已验证
                    </span>
                  ) : (
                    <span className="flex items-center text-orange-500">
                      <Mail className="w-4 h-4 mr-2" />
                      未验证
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* 安全设置 */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">安全设置</h3>

              {/* 新密码 */}
              <div className="mb-4">
                <label htmlFor="new_password" className="block text-sm font-medium text-gray-700 mb-2">
                  新密码
                </label>
                <div className="relative">
                  <Input
                    id="new_password"
                    type={showNewPassword ? "text" : "password"}
                    placeholder="留空则不修改密码"
                    className="pr-10"
                    {...register("new_password")}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.new_password && (
                  <p className="text-red-600 text-sm mt-1">{errors.new_password.message}</p>
                )}
              </div>

              {/* 确认新密码 */}
              {newPassword && newPassword.length > 0 && (
                <div className="mb-4">
                  <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700 mb-2">
                    确认新密码
                  </label>
                  <div className="relative">
                    <Input
                      id="confirm_password"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="请再次输入新密码"
                      className="pr-10"
                      {...register("confirm_password")}
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
                  {errors.confirm_password && (
                    <p className="text-red-600 text-sm mt-1">{errors.confirm_password.message}</p>
                  )}
                </div>
              )}
            </div>

            {/* 提交按钮 */}
            <div className="border-t pt-6">
              <Button
                type="submit"
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  "保存中..."
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    保存更改
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfilePageContent />
    </ProtectedRoute>
  )
}