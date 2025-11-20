"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, MessageCircle, BookOpen, Play, FileText, ExternalLink } from "lucide-react"
import React, { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import ServiceSubmissionForm from "@/components/ServiceSubmissionForm"

export default function ClaimMembershipPage() {
  const searchParams = useSearchParams()
  const [showTutorialOptions, setShowTutorialOptions] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState<number | null>(null)
  const [serviceName, setServiceName] = useState<string | null>(null)

  useEffect(() => {
    // Read URL parameters for payment amount and service name
    const amount = searchParams.get('amount')
    const service = searchParams.get('service')

    if (amount) {
      const numAmount = parseFloat(amount)
      if (!isNaN(numAmount)) {
        setPaymentAmount(numAmount)
      }
    }

    if (service) {
      setServiceName(service)
    }
  }, [searchParams])

  const handleTutorialClick = () => {
    setShowTutorialOptions(!showTutorialOptions)
  }

  const handleImageTutorial = () => {
    // 跳转到图文教程页面
    window.open('/tutorial', '_blank')
  }

  const handleVideoTutorial = () => {
    // 后期添加视频教程链接
    alert('视频教程即将推出，敬请期待！')
  }
  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-b from-yellow-400 via-yellow-400 to-blue-600 pb-6">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto text-center text-white">

          {/* 主标题 */}
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            一键代充<br />ChatGPT Plus
          </h1>

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
            <Button
              size="lg"
              className="text-base px-6 py-3 bg-white text-blue-600 hover:bg-gray-100 border-2 border-white font-semibold"
              onClick={handleTutorialClick}
            >
              <BookOpen className="mr-2 h-4 w-4" />
              查看获取会员教程
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            <Button
              size="lg"
              className="text-base px-5 py-3 bg-black text-white hover:bg-gray-800 border-2 border-black font-semibold"
              onClick={() => window.open('https://chatgpt.com/#pricing', '_blank')}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              获取ChatGPT URL
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="text-base px-5 py-3 bg-transparent text-white border-2 border-white hover:bg-white hover:text-blue-600 font-normal"
              onClick={() => window.open('https://work.weixin.qq.com/ca/cawcdeac58029da582', '_blank')}
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              立即联系微信客服
            </Button>
          </div>

          {/* 教程选择弹出 */}
          {showTutorialOptions && (
            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                size="lg"
                className="text-base px-5 py-2 bg-black text-white hover:bg-gray-800 border-2 border-black font-medium"
                onClick={handleImageTutorial}
              >
                <FileText className="mr-2 h-4 w-4" />
                图文教程
              </Button>

              <Button
                size="lg"
                className="text-base px-5 py-2 bg-black text-white hover:bg-gray-800 border-2 border-black font-medium"
                onClick={handleVideoTutorial}
              >
                <Play className="mr-2 h-4 w-4" />
                视频教程
              </Button>
            </div>
          )}

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
                填写领取信息
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

            {/* 自定义表单 - 替换 Fillout */}
            <div className="max-w-2xl mx-auto">
              <ServiceSubmissionForm
                paymentAmount={paymentAmount}
                serviceName={serviceName}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}