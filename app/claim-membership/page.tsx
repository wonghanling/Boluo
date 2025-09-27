"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, MessageCircle, BookOpen, Play, FileText, ExternalLink } from "lucide-react"
import React, { useEffect } from "react"

export default function ClaimMembershipPage() {
  const [showTutorialOptions, setShowTutorialOptions] = React.useState(false)

  // 简化的脚本加载
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://server.fillout.com/embed/v1/'
    script.async = true
    document.head.appendChild(script)

    return () => {
      // 清理脚本
      if (document.head.contains(script)) {
        document.head.removeChild(script)
      }
    }
  }, [])

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
      <div className="bg-gradient-to-b from-yellow-400 via-yellow-400 to-blue-600 pb-10">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center text-white">

          {/* 主标题 */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            一键代充<br />ChatGPT Plus
          </h1>

          {/* 副标题 */}
          <div className="max-w-3xl mx-auto mb-12">
            <p className="text-xl md:text-2xl leading-relaxed text-white font-bold text-center">
              无需沟通、无需提供密码；<br />
              提交官方支付链接，我们替你完成。<br />
              可开通发票。
            </p>
          </div>

          {/* 要点 */}
          <div className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-16 mb-16">
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">低价</div>
              <div className="text-lg opacity-90">最具性价比</div>
            </div>
            <div className="hidden md:block w-px h-16 bg-white opacity-30"></div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">极速</div>
              <div className="text-lg opacity-90">付完即开通</div>
            </div>
            <div className="hidden md:block w-px h-16 bg-white opacity-30"></div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">安全</div>
              <div className="text-lg opacity-90">无需密码</div>
            </div>
          </div>

          {/* 按钮 */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Button
              size="lg"
              className="text-lg px-8 py-4 bg-white text-blue-600 hover:bg-gray-100 border-2 border-white font-semibold"
              onClick={handleTutorialClick}
            >
              <BookOpen className="mr-2 h-5 w-5" />
              查看获取会员教程
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>

            <Button
              size="lg"
              className="text-lg px-6 py-4 bg-black text-white hover:bg-gray-800 border-2 border-black font-semibold"
              onClick={() => window.open('https://chatgpt.com/#pricing', '_blank')}
            >
              <ExternalLink className="mr-2 h-5 w-5" />
              获取ChatGPT URL
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="text-lg px-6 py-4 bg-transparent text-white border-2 border-white hover:bg-white hover:text-blue-600 font-normal"
              onClick={() => window.open('https://work.weixin.qq.com/ca/cawcdeac58029da582', '_blank')}
            >
              <MessageCircle className="mr-2 h-5 w-5" />
              立即联系微信客服
            </Button>
          </div>

          {/* 教程选择弹出 */}
          {showTutorialOptions && (
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="text-lg px-6 py-3 bg-black text-white hover:bg-gray-800 border-2 border-black font-medium"
                onClick={handleImageTutorial}
              >
                <FileText className="mr-2 h-5 w-5" />
                图文教程
              </Button>

              <Button
                size="lg"
                className="text-lg px-6 py-3 bg-black text-white hover:bg-gray-800 border-2 border-black font-medium"
                onClick={handleVideoTutorial}
              >
                <Play className="mr-2 h-5 w-5" />
                视频教程
              </Button>
            </div>
          )}

          {/* 底部提示 */}
          <p className="text-sm opacity-80 mt-8">
            有任何问题可点击立即联系微信客服
          </p>

          </div>
        </div>
      </div>

      {/* 蓝色区域 - 表单部分 */}
      <div className="bg-blue-600 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center text-white">
            {/* 表单区域标题 */}
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                填写领取信息
              </h2>
              <p className="text-lg text-white opacity-90">
                请填写以下信息，我们将为您快速开通服务
              </p>

              {/* 添加标注信息 */}
              <div className="mt-6 mb-6 text-left max-w-3xl mx-auto">
                <p className="text-sm text-white opacity-90 mb-2 font-medium">标注：</p>
                <div className="text-sm text-white opacity-80 space-y-2">
                  <p>1. ChatGPT独享代充 ¥169/月 需要提供您的ChatGPT账号和ChatGPT支付链接URL可以点击获取填写。</p>
                  <p>2. 其它业务请填写好信息为您开通发送邮件给您。</p>
                </div>
              </div>
            </div>

            {/* 第三方表单 - 缩小尺寸 */}
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-2xl p-6 shadow-xl">
                <div
                  style={{width: '100%', height: '400px'}}
                  data-fillout-id="dEHqnp6LGius"
                  data-fillout-embed-type="standard"
                  data-fillout-inherit-parameters
                  data-fillout-dynamic-resize
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}