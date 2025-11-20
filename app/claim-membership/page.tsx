import { Button } from "@/components/ui/button"
import { ArrowRight, MessageCircle, BookOpen, Play, FileText, ExternalLink } from "lucide-react"
import ServiceSubmissionForm from "@/components/ServiceSubmissionForm"

type PageProps = {
  searchParams: {
    amount?: string
    service?: string
    orderId?: string
    paymentSuccess?: string
  }
}

export default function ClaimMembershipPage({ searchParams }: PageProps) {
  const { amount, service, orderId, paymentSuccess } = searchParams

  // 只允许 paymentSuccess === 'true' 的人看到表单
  if (paymentSuccess !== 'true') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-yellow-400 to-blue-600">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md mx-4">
          <h1 className="text-2xl font-bold text-red-600 mb-4">访问受限</h1>
          <p className="text-gray-700 mb-6">
            请先完成支付后再访问此页面。
          </p>
          <a href="/" className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded">
            返回首页
          </a>
        </div>
      </div>
    )
  }

  const paymentAmount = amount ? parseFloat(amount) : null
  const serviceName = service ? decodeURIComponent(service) : null

  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-b from-yellow-400 via-yellow-400 to-blue-600 pb-6">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto text-center text-white">

          {/* 主标题 */}
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            ✅ 支付成功<br />请填写服务信息
          </h1>

          {/* 支付信息显示 */}
          {paymentAmount && serviceName && (
            <div className="bg-green-500 text-white p-4 rounded-lg mb-8 max-w-2xl mx-auto">
              <div className="flex items-center justify-center mb-2">
                <span className="text-2xl mr-2">🎉</span>
                <span className="font-bold text-lg">支付成功！</span>
              </div>
              <p className="text-sm">
                服务：{serviceName} | 金额：¥{paymentAmount} | 订单号：{orderId}
              </p>
            </div>
          )}

          {/* 副标题 */}
          <div className="max-w-3xl mx-auto mb-8">
            <p className="text-lg md:text-xl leading-relaxed text-white font-bold text-center">
              无需沟通、无需提供密码；<br />
              提交官方支付链接，我们替你完成。<br />
              可开通发票。
            </p>
          </div>

          {/* 要点 - 简化为两行 */}
          <div className="text-center mb-8">
            <div className="text-2xl font-bold mb-2 text-white">
              低价 · 极速 · 安全
            </div>
            <div className="text-base opacity-90 text-white">
              最具性价比 · 付完即开通 · 无需密码
            </div>
          </div>

          {/* 按钮 - 更紧凑排列 */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="/tutorial"
              target="_blank"
              className="inline-flex items-center text-base px-6 py-3 bg-white text-blue-600 hover:bg-gray-100 border-2 border-white font-semibold rounded"
            >
              <BookOpen className="mr-2 h-4 w-4" />
              查看获取会员教程
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>

            <a
              href="https://chatgpt.com/#pricing"
              target="_blank"
              className="inline-flex items-center text-base px-5 py-3 bg-black text-white hover:bg-gray-800 border-2 border-black font-semibold rounded"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              获取ChatGPT URL
            </a>

            <a
              href="https://work.weixin.qq.com/ca/cawcdeac58029da582"
              target="_blank"
              className="inline-flex items-center text-base px-5 py-3 bg-transparent text-white border-2 border-white hover:bg-white hover:text-blue-600 font-normal rounded"
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              立即联系微信客服
            </a>
          </div>

          {/* 底部提示 */}
          <p className="text-sm opacity-80 mt-6">
            有任何问题可点击立即联系微信客服
          </p>

          </div>
        </div>
      </div>

      {/* 蓝色区域 - 表单部分 */}
      <div className="bg-blue-600 py-10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center text-white">
            {/* 表单区域标题 */}
            <div className="text-center mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-white mb-3">
                填写服务信息
              </h2>
              <p className="text-base text-white opacity-90">
                请填写以下信息，我们将为您快速开通服务
              </p>

              {/* 添加标注信息 */}
              <div className="mt-4 mb-4 text-left max-w-3xl mx-auto">
                <p className="text-sm text-white opacity-90 mb-2 font-medium">标注：</p>
                <div className="text-sm text-white opacity-80 space-y-1">
                  <p>1. ChatGPT独享代充 ¥169/月 需要提供您的ChatGPT账号和ChatGPT支付链接URL可以点击获取填写。</p>
                  <p>2. 其它业务请填写好信息为您开通发送邮件给您。</p>
                </div>
              </div>
            </div>

            {/* 自定义表单 - 保持原有功能 */}
            <div className="max-w-2xl mx-auto">
              <ServiceSubmissionForm
                paymentAmount={paymentAmount}
                serviceName={serviceName}
                orderId={orderId}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}