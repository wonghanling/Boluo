"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/AuthProvider"
import { supabase } from "@/lib/supabase"
import { ArrowLeft, Package, Clock, CheckCircle, XCircle, RefreshCw, Calendar, Mail, Link as LinkIcon, Loader2, Search } from "lucide-react"

interface Submission {
  id: string
  user_id: string | null
  chatgpt_account: string | null
  chatgpt_payment_url: string | null
  claude_email: string | null
  service_type: string
  status: 'submitted' | 'processing' | 'completed' | 'cancelled'
  created_at: string
}

export default function AdminPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [filter, setFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  // 检查是否是管理员（这里简单判断，实际应该在数据库有admin字段）
  const isAdmin = user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL || user?.email?.includes('admin')

  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
      return
    }

    // 这里暂时允许所有登录用户访问，实际应该检查admin权限
    fetchSubmissions()
  }, [user, router])

  // 获取所有提交数据
  const fetchSubmissions = async () => {
    try {
      let query = supabase
        .from('service_submissions')
        .select('*')
        .order('created_at', { ascending: false })

      if (filter !== 'all') {
        query = query.eq('status', filter)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching submissions:', error)
      } else {
        setSubmissions(data || [])
      }
    } catch (error) {
      console.error('Error fetching submissions:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // 刷新数据
  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchSubmissions()
  }

  // 更新订单状态
  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('service_submissions')
        .update({ status: newStatus })
        .eq('id', id)

      if (error) {
        console.error('Error updating status:', error)
        alert('更新失败：' + error.message)
      } else {
        alert('状态已更新！')
        fetchSubmissions()
      }
    } catch (error) {
      console.error('Error updating status:', error)
      alert('更新失败')
    }
  }

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

  // 过滤搜索
  const filteredSubmissions = submissions.filter(sub => {
    const searchLower = searchTerm.toLowerCase()
    return (
      sub.chatgpt_account?.toLowerCase().includes(searchLower) ||
      sub.claude_email?.toLowerCase().includes(searchLower) ||
      sub.service_type?.toLowerCase().includes(searchLower) ||
      sub.id.toLowerCase().includes(searchLower)
    )
  })

  // 统计数据
  const stats = {
    total: submissions.length,
    submitted: submissions.filter(s => s.status === 'submitted').length,
    processing: submissions.filter(s => s.status === 'processing').length,
    completed: submissions.filter(s => s.status === 'completed').length,
    cancelled: submissions.filter(s => s.status === 'cancelled').length
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载数据中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* 头部 */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center">
            <Button
              variant="ghost"
              className="text-gray-600 hover:text-gray-900 mr-4"
              onClick={() => router.push('/')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回首页
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">管理员后台</h1>
              <p className="text-gray-600">管理所有用户的服务订单</p>
            </div>
          </div>

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

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">全部订单</div>
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          </div>
          <div className="bg-blue-50 rounded-lg shadow p-4">
            <div className="text-sm text-blue-600">已提交</div>
            <div className="text-2xl font-bold text-blue-600">{stats.submitted}</div>
          </div>
          <div className="bg-yellow-50 rounded-lg shadow p-4">
            <div className="text-sm text-yellow-600">处理中</div>
            <div className="text-2xl font-bold text-yellow-600">{stats.processing}</div>
          </div>
          <div className="bg-green-50 rounded-lg shadow p-4">
            <div className="text-sm text-green-600">已开通</div>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          </div>
          <div className="bg-gray-50 rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">已取消</div>
            <div className="text-2xl font-bold text-gray-600">{stats.cancelled}</div>
          </div>
        </div>

        {/* 过滤和搜索 */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* 状态过滤 */}
            <div className="flex gap-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setFilter('all')
                  fetchSubmissions()
                }}
              >
                全部
              </Button>
              <Button
                variant={filter === 'submitted' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setFilter('submitted')
                  fetchSubmissions()
                }}
              >
                已提交
              </Button>
              <Button
                variant={filter === 'processing' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setFilter('processing')
                  fetchSubmissions()
                }}
              >
                处理中
              </Button>
              <Button
                variant={filter === 'completed' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setFilter('completed')
                  fetchSubmissions()
                }}
              >
                已开通
              </Button>
            </div>

            {/* 搜索框 */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="搜索账号、邮箱、服务类型..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* 订单列表 */}
        {filteredSubmissions.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无订单</h3>
            <p className="text-gray-600">没有找到符合条件的订单</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSubmissions.map((submission) => {
              const statusDisplay = getStatusDisplay(submission.status)

              return (
                <div key={submission.id} className="bg-white rounded-lg shadow-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h3 className="text-lg font-bold text-gray-900">
                          {submission.service_type}
                        </h3>
                        <span className={`ml-3 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusDisplay.color}`}>
                          {statusDisplay.text}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">订单ID: {submission.id}</p>
                    </div>

                    {/* 状态操作按钮 */}
                    <div className="flex gap-2">
                      {submission.status !== 'processing' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-yellow-600 border-yellow-600 hover:bg-yellow-50"
                          onClick={() => updateStatus(submission.id, 'processing')}
                        >
                          标记为处理中
                        </Button>
                      )}
                      {submission.status !== 'completed' && (
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => updateStatus(submission.id, 'completed')}
                        >
                          标记为已开通
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {submission.chatgpt_account && (
                      <div>
                        <span className="text-gray-600">ChatGPT账号:</span>
                        <p className="font-medium text-gray-900">{submission.chatgpt_account}</p>
                      </div>
                    )}
                    {submission.chatgpt_payment_url && (
                      <div>
                        <span className="text-gray-600">支付URL:</span>
                        <p className="font-medium text-gray-900 truncate">{submission.chatgpt_payment_url}</p>
                      </div>
                    )}
                    {submission.claude_email && (
                      <div>
                        <span className="text-gray-600">Claude邮箱:</span>
                        <p className="font-medium text-gray-900">{submission.claude_email}</p>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-600">提交时间:</span>
                      <p className="font-medium text-gray-900">{formatDate(submission.created_at)}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
