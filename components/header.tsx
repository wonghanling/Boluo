"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { Moon, Sun, Menu, MessageCircle, User, LogOut, Settings, Mail, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/AuthProvider"



export function Header() {
  const { setTheme, theme } = useTheme()
  const { user, userProfile, signOut, loading } = useAuth()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
  const [userMenuOpen, setUserMenuOpen] = React.useState(false)
  const [showAuthButtons, setShowAuthButtons] = React.useState(false)

  // 添加超时机制，防止loading状态卡住
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        setShowAuthButtons(true) // 强制显示登录按钮
      }
    }, 3000) // 3秒后强制显示

    if (!loading) {
      setShowAuthButtons(true)
      clearTimeout(timer)
    }

    return () => clearTimeout(timer)
  }, [loading])

  const navigation = [
    { name: "首页", href: "#hero" },
    {
      name: "服务",
      href: "#services"
    },
    { name: "联系我们", href: "#contact" }
  ]

  const handleSignOut = async () => {
    await signOut()
    setUserMenuOpen(false)
    router.push('/')
  }

  const handleUserMenuClick = (href: string) => {
    router.push(href)
    setUserMenuOpen(false)
  }



  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl">BoLuo</span>
          </Link>

          {/* 桌面导航 */}
          <nav className="hidden md:flex items-center space-x-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm font-medium hover:text-brand transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-2">
            {/* 立即联系按钮 */}
            <Button
              size="sm"
              className="hidden lg:flex"
              onClick={() => window.open('https://work.weixin.qq.com/ca/cawcdeac58029da582', '_blank')}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              立即联系
            </Button>

            {/* 用户认证区域 */}
            {loading && !showAuthButtons ? (
              // 加载状态（3秒内）
              <div className="hidden md:flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
              </div>
            ) : user ? (
              // 已登录用户菜单
              <div className="relative">
                <Button
                  variant="ghost"
                  className="flex items-center space-x-2 px-3 py-2 h-auto"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                >
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium max-w-24 truncate">
                    {userProfile?.qq_email?.split('@')[0] || user.email?.split('@')[0] || '用户'}
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </Button>

                {/* 用户下拉菜单 */}
                {userMenuOpen && (
                  <>
                    {/* 遮罩层 */}
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    {/* 下拉菜单 */}
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border z-50">
                      <div className="p-4 border-b">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {user.email}
                        </p>
                        <p className="text-xs text-gray-500">
                          {userProfile?.email_verified ? (
                            <span className="flex items-center">
                              <Mail className="w-3 h-3 mr-1 text-green-500" />
                              邮箱已验证
                            </span>
                          ) : (
                            <span className="text-orange-500">邮箱未验证</span>
                          )}
                        </p>
                      </div>
                      <div className="py-2">
                        <button
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => handleUserMenuClick('/profile')}
                        >
                          <Settings className="w-4 h-4 mr-3" />
                          个人设置
                        </button>
                        <button
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => handleUserMenuClick('/orders')}
                        >
                          <User className="w-4 h-4 mr-3" />
                          我的订单
                        </button>
                      </div>
                      <div className="py-2 border-t">
                        <button
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                          onClick={handleSignOut}
                        >
                          <LogOut className="w-4 h-4 mr-3" />
                          退出登录
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              // 未登录状态 - 登录/注册按钮
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/auth/login')}
                >
                  登录
                </Button>
                <Button
                  size="sm"
                  onClick={() => router.push('/auth/signup')}
                >
                  注册
                </Button>
              </div>
            )}

            {/* 主题切换按钮 */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="h-9 w-9"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">切换主题</span>
            </Button>

            {/* 移动端菜单按钮 */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* 移动端菜单 */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-background">
            <div className="container mx-auto py-4 space-y-2">
              {/* 导航链接 */}
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block py-2 px-4 text-sm font-medium hover:bg-muted rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}

              {/* 用户认证区域 */}
              {loading && !showAuthButtons ? (
                <div className="pt-4 px-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                  </div>
                </div>
              ) : user ? (
                // 已登录用户信息
                <div className="pt-4 border-t">
                  <div className="px-4 pb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {user.email}
                        </p>
                        <p className="text-xs text-gray-500">
                          {userProfile?.email_verified ? (
                            <span className="flex items-center">
                              <Mail className="w-3 h-3 mr-1 text-green-500" />
                              邮箱已验证
                            </span>
                          ) : (
                            <span className="text-orange-500">邮箱未验证</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 用户菜单选项 */}
                  <div className="space-y-1 px-4">
                    <button
                      className="flex items-center w-full py-2 px-4 text-sm text-gray-700 hover:bg-muted rounded-lg"
                      onClick={() => {
                        router.push('/profile')
                        setMobileMenuOpen(false)
                      }}
                    >
                      <Settings className="w-4 h-4 mr-3" />
                      个人设置
                    </button>
                    <button
                      className="flex items-center w-full py-2 px-4 text-sm text-gray-700 hover:bg-muted rounded-lg"
                      onClick={() => {
                        router.push('/orders')
                        setMobileMenuOpen(false)
                      }}
                    >
                      <User className="w-4 h-4 mr-3" />
                      我的订单
                    </button>
                    <button
                      className="flex items-center w-full py-2 px-4 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                      onClick={() => {
                        handleSignOut()
                        setMobileMenuOpen(false)
                      }}
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      退出登录
                    </button>
                  </div>
                </div>
              ) : (
                // 未登录状态 - 移动端登录/注册按钮
                <div className="pt-4 border-t">
                  <div className="space-y-2 px-4">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        router.push('/auth/login')
                        setMobileMenuOpen(false)
                      }}
                    >
                      登录
                    </Button>
                    <Button
                      className="w-full"
                      onClick={() => {
                        router.push('/auth/signup')
                        setMobileMenuOpen(false)
                      }}
                    >
                      注册
                    </Button>
                  </div>
                </div>
              )}

              {/* 立即联系按钮 */}
              <div className="pt-4 border-t">
                <Button
                  className="w-full"
                  onClick={() => {
                    window.open('https://work.weixin.qq.com/ca/cawcdeac58029da582', '_blank')
                    setMobileMenuOpen(false)
                  }}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  立即联系
                </Button>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  )
}