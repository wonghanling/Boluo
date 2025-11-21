"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuth, ProtectedRoute } from "@/components/AuthProvider"
import { supabase } from "@/lib/supabase"
import { ArrowLeft, Package, Clock, CheckCircle, XCircle, RefreshCw, Calendar, Mail, Link as LinkIcon, Loader2 } from "lucide-react"

interface Order {
  id: string
  chatgpt_account: string | null
  chatgpt_payment_url: string | null
  claude_email: string | null
  service_type: string
  status: 'submitted' | 'processing' | 'completed' | 'cancelled'
  created_at: string
}

function OrdersPageContent() {
  const { user } = useAuth()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // 获取状态显示
  const getStatusDisplay = (status: string) => {
    const statusMap = {
      'submitted': { text: '已提交', color: 'text-blue-600 bg-blue-50', icon: Clock },
      'processing': { text: '处理中', color: 'text-yellow-600 bg-yellow-50', icon: Loader2 },
      'completed': { text: '已开通', color: 'text-green-600 bg-green-50', icon: CheckCircle },
      'cancelled': { text: '已取消', color: 'text-gray-600 bg-gray-50', icon: XCircle }
    }
    return statusMap[status as keyof typeof statusMap] || statusMap.submitted
  }

  // 格式化日期
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // 获取订单数据
  const fetchOrders = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching orders:', error)
        return
      }

      // 转换数据格式以匹配界面
      const formattedOrders = (data || []).map(order => ({
        id: order.id,
        chatgpt_account: order.chatgpt_account,
        chatgpt_payment_url: order.chatgpt_payment_url,
        claude_email: order.claude_email,
        service_type: order.service_type,
        status: order.processing_status === 'info_submitted' ? 'submitted' :
                order.processing_status === 'processing' ? 'processing' :
                order.processing_status === 'completed' ? 'completed' : 'submitted',
        created_at: order.created_at
      }))

      setOrders(formattedOrders)
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // 刷新订单
  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchOrders()
  }

  useEffect(() => {
    fetchOrders()
  }, [user])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载订单数据...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* 头部 */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center">
            <Button
              variant="ghost"
              className="text-gray-600 hover:text-gray-900 mr-4"
              onClick={() => router.back()}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">我的订单</h1>
              <p className="text-gray-600">查看您的所有订单记录</p>
            </div>
          </div>

          {/* 刷新按钮 */}
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            刷新
          </Button>
        </div>

        {/* 订单列表 */}
        {orders.length === 0 ? (
          // 空状态
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无订单记录</h3>
            <p className="text-gray-600 mb-6">您还没有任何订单，去选购我们的服务吧！</p>
            <Button onClick={() => router.push('/#services')}>
              浏览服务
            </Button>
          </div>
        ) : (
          // 订单卡片列表
          <div className="space-y-4">
            {orders.map((order) => {
              const statusDisplay = getStatusDisplay(order.status)
              const StatusIcon = statusDisplay.icon

              return (
                <div key={order.id} className="bg-white rounded-lg shadow-lg p-6">
                  <div className="flex items-start justify-between">
                    {/* 订单信息 */}
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h3 className="text-lg font-medium text-gray-900">
                          {order.service_type}
                        </h3>
                        <span className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusDisplay.color}`}>
                          {statusDisplay.icon === Loader2 ? (
                            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                          ) : (
                            <StatusIcon className="w-3 h-3 mr-1" />
                          )}
                          {statusDisplay.text}
                        </span>
                      </div>

                      {/* 服务信息 */}
                      <div className="space-y-2 text-sm text-gray-600">
                        {order.chatgpt_account && (
                          <div className="flex items-center">
                            <Mail className="w-4 h-4 mr-2 text-gray-400" />
                            <span>ChatGPT账号: {order.chatgpt_account}</span>
                          </div>
                        )}
                        {order.chatgpt_payment_url && (
                          <div className="flex items-center">
                            <LinkIcon className="w-4 h-4 mr-2 text-gray-400" />
                            <span className="truncate">支付URL: {order.chatgpt_payment_url.substring(0, 50)}...</span>
                          </div>
                        )}
                        {order.claude_email && (
                          <div className="flex items-center">
                            <Mail className="w-4 h-4 mr-2 text-gray-400" />
                            <span>Claude邮箱: {order.claude_email}</span>
                          </div>
                        )}
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          <span>提交时间: {formatDate(order.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 状态说明 */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    {order.status === 'submitted' && (
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-blue-800 text-sm">
                          ✅ 您的信息已提交成功，我们将尽快为您处理
                        </p>
                      </div>
                    )}
                    {order.status === 'processing' && (
                      <div className="p-3 bg-yellow-50 rounded-lg">
                        <p className="text-yellow-800 text-sm">
                          ⏳ 正在为您开通服务，请耐心等待...
                        </p>
                      </div>
                    )}
                    {order.status === 'completed' && (
                      <div className="p-3 bg-green-50 rounded-lg">
                        <p className="text-green-800 text-sm font-medium">
                          🎉 您的服务已开通完成！请查收相关信息
                        </p>
                      </div>
                    )}
                    {order.status === 'cancelled' && (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-800 text-sm">
                          ❌ 订单已取消
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* 底部提示 */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>如有任何问题，请联系客服获取帮助</p>
          <Button
            variant="link"
            className="text-blue-600 hover:text-blue-500"
            onClick={() => window.open('https://work.weixin.qq.com/ca/cawcdeac58029da582', '_blank')}
          >
            联系客服
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function OrdersPage() {
  return (
    <ProtectedRoute>
      <OrdersPageContent />
    </ProtectedRoute>
  )
}