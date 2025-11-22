"use client"

import React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Icons } from "@/components/icons"
import { services } from "@/content/services"
import { heroContent, advantages } from "@/content/general"
import { faqs } from "@/content/faq"
import { contactInfo } from "@/content/general"
import { useAuth } from "@/components/AuthProvider"
import Image from "next/image"

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 }
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

export default function HomePage() {
  const { user, loading } = useAuth()


  // 注册引导弹窗状态
  const [showRegisterModal, setShowRegisterModal] = React.useState(false)
  const [hasShownRegisterPrompt, setHasShownRegisterPrompt] = React.useState(false)

  // 页面加载时显示注册提醒（仅对未登录用户显示一次）
  React.useEffect(() => {
    if (!loading) {
      const hasShownBefore = localStorage.getItem('hasShownRegisterPrompt')

      if (!user && !hasShownBefore && !hasShownRegisterPrompt) {
        const timer = setTimeout(() => {
          setShowRegisterModal(true)
          setHasShownRegisterPrompt(true)
          localStorage.setItem('hasShownRegisterPrompt', 'true')
        }, 3000) // 3秒后显示注册提醒

        return () => clearTimeout(timer)
      }
    }
  }, [user, loading, hasShownRegisterPrompt])


  const [openFAQ, setOpenFAQ] = React.useState<number | null>(null)
  const [selectedService, setSelectedService] = React.useState<any>(null)
  const [serviceModalOpen, setServiceModalOpen] = React.useState(false)
  const [selectedPlan, setSelectedPlan] = React.useState<number | null>(null)
  const [isPaying, setIsPaying] = React.useState(false) // 🛡️ 防重复支付

  const copyWechatId = () => {
    navigator.clipboard.writeText(contactInfo.wechat)
    alert("微信号已复制到剪贴板")
  }

  const handlePayment = async () => {
    // 🛡️ 防重复点击
    if (isPaying) {
      console.log('⚠️ 支付正在进行中，请勿重复点击')
      return
    }

    if (!selectedService || selectedPlan === null) {
      alert('请先选择套餐')
      return
    }

    const plan = selectedService.pricing[selectedPlan]

    // 解析价格（去掉 ¥ 符号和 /月 等后缀）
    const priceStr = plan.price.replace(/[¥￥]/g, '').replace(/\/.*$/, '')
    const amount = parseFloat(priceStr)

    if (isNaN(amount) || amount <= 0) {
      alert('价格信息异常，请联系客服')
      return
    }

    setIsPaying(true) // 🛡️ 开始支付，禁用按钮

    try {
      // 生成订单号
      const orderId = `${selectedService.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      // 构建订单标题
      const title = `${selectedService.name} - ${plan.name}`

      // 检测设备类型
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      const deviceType = isMobile ? 'mobile' : 'pc'

      const response = await fetch('/api/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          amount: amount.toString(),
          title,
          serviceType: selectedService.id,
          planIndex: selectedPlan,
        }),
      })

      const result = await response.json()

      if (result.success) {
        // 直接跳转虎皮椒支付，不再检查登录
        if (deviceType === 'pc') {
          // PC端：显示支付提示模态框
          const paymentModal = document.createElement('div')
          paymentModal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.8); z-index: 9999; display: flex;
            justify-content: center; align-items: center;
          `
          paymentModal.innerHTML = `
            <div style="background: white; padding: 30px; border-radius: 10px; max-width: 400px; text-align: center;">
              <h3 style="margin-bottom: 20px; font-size: 18px; font-weight: bold;">📱 手机端支付提示</h3>
              <p style="margin-bottom: 20px; color: #666;">检测到您正在使用电脑访问，当前支付需要在手机端完成。</p>
              <div style="text-align: left; margin-bottom: 20px;">
                <p style="font-weight: bold; margin-bottom: 10px;">请按以下步骤操作：</p>
                <p style="margin: 5px 0;">1️⃣ 点击下方"复制支付链接"按钮</p>
                <p style="margin: 5px 0;">2️⃣ 在手机浏览器中粘贴并打开链接</p>
                <p style="margin: 5px 0;">3️⃣ 完成支付宝付款</p>
              </div>
              <div style="display: flex; gap: 10px; justify-content: center;">
                <button onclick="navigator.clipboard.writeText('${result.payUrl}').then(() => alert('支付链接已复制到剪贴板！'))" style="background: #1976d2; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">复制支付链接</button>
                <button onclick="this.parentElement.parentElement.parentElement.remove()" style="background: #ccc; color: black; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">取消</button>
              </div>
            </div>
          `
          document.body.appendChild(paymentModal)
        } else {
          // 移动端：直接跳转支付宝
          window.open(result.payUrl, '_blank')
        }
        setServiceModalOpen(false)
      } else {
        alert(result.error || '支付创建失败')
      }
    } catch (error) {
      console.error('支付错误:', error)
      alert('支付接口异常，请稍后重试')
    } finally {
      setIsPaying(false) // 🛡️ 支付结束，恢复按钮
    }
  }

  const handleServiceClick = (service: any) => {
    // 暂时禁用网络云加速服务的弹窗
    if (service.id === 'network') {
      return
    }

    // 检查用户登录状态
    if (!user) {
      setShowRegisterModal(true)
      return
    }

    setSelectedService(service)
    setSelectedPlan(null) // 重置选中的套餐
    setServiceModalOpen(true)
  }

  const handlePlanSelect = (planIndex: number) => {
    setSelectedPlan(planIndex)
  }

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section id="hero" className="px-4 py-20 md:py-32 bg-gradient-to-b from-yellow-400 to-blue-600 text-center">
        <div className="container mx-auto">
          <motion.div
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className="max-w-4xl mx-auto"
          >
            <motion.h1
              variants={fadeInUp}
              className="text-6xl md:text-8xl font-bold tracking-tight mb-4 text-gray-800"
            >
              {heroContent.title}
            </motion.h1>
            <motion.h2
              variants={fadeInUp}
              className="text-2xl md:text-3xl font-medium mb-6 text-gray-700"
            >
              {heroContent.subtitle}
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-lg md:text-xl text-gray-600 mb-12 max-w-2xl mx-auto"
            >
              {heroContent.description}
            </motion.p>
            <motion.p
              variants={fadeInUp}
              className="text-base md:text-lg text-white mb-8 max-w-2xl mx-auto font-medium shadow-lg shadow-white/50 drop-shadow-lg px-4"
              style={{ wordBreak: 'keep-all', whiteSpace: 'nowrap' }}
            >
              领取您的会员/无密码接触充值您的账号
            </motion.p>
            <motion.div
              variants={fadeInUp}
              className="flex justify-center"
            >
              <Button
                size="lg"
                className="text-lg px-8 py-4 bg-transparent text-blue-600 hover:bg-blue-50 border-2 border-blue-600 font-normal"
                onClick={() => window.open('https://work.weixin.qq.com/ca/cawcdeac58029da582', '_blank')}
              >
                {heroContent.primaryCta}
              </Button>
            </motion.div>

            {/* 动态提示 - 移到按钮外层确保居中 */}
            <motion.div
              className="mt-4 flex flex-col items-center space-y-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
            >
              {/* 向上的三个箭头动画 */}
              <div className="flex space-x-1">
                {[0, 1, 2].map((index) => (
                  <motion.div
                    key={index}
                    className="text-black text-3xl font-black"
                    style={{ fontWeight: 900 }}
                    animate={{
                      y: [0, -8, 0],
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: index * 0.2
                    }}
                  >
                    ▲
                  </motion.div>
                ))}
              </div>

              {/* 三条营销文案 */}
              <motion.div
                className="mt-6 space-y-2 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2, duration: 0.5 }}
              >
                <div className="flex items-center justify-center">
                  <Icons.Check className="h-6 w-6 text-white bg-green-500 rounded-full p-1 mr-2" />
                  <p className="text-yellow-300 font-medium text-lg">安全极速开通，可退款。</p>
                </div>
                <div className="flex items-center justify-center">
                  <Icons.Check className="h-6 w-6 text-white bg-green-500 rounded-full p-1 mr-2" />
                  <p className="text-yellow-300 font-medium text-lg">3000+用户信赖享用全球最先进的AI能力。</p>
                </div>
                <div className="flex items-center justify-center">
                  <Icons.Check className="h-6 w-6 text-white bg-green-500 rounded-full p-1 mr-2" />
                  <p className="text-yellow-300 font-medium text-lg">任何问题均可随时联系。</p>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="px-4 py-20 bg-yellow-300">
        <div className="container mx-auto">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-black">核心服务</h2>
              <p className="text-xl text-black max-w-2xl mx-auto">
                专业的海外 AI 工具代充服务，让您轻松享受全球最先进的人工智能技术
              </p>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {services.map((service, index) => {
                const IconComponent = Icons[service.icon as keyof typeof Icons]
                return (
                  <motion.div
                    key={service.id}
                    variants={fadeInUp}
                    className="group"
                  >
                    <div 
                      className="p-6 rounded-2xl bg-black text-white border shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full cursor-pointer"
                      onClick={() => handleServiceClick(service)}
                    >
                      <div className="flex items-center justify-center w-12 h-12 bg-brand/10 rounded-xl mb-4 group-hover:bg-brand/20 transition-colors">
                        <IconComponent className="h-6 w-6 text-brand" />
                      </div>
                      <h3 className="text-xl font-semibold mb-3">{service.name}</h3>
                      <p className="text-muted-foreground mb-4">{service.description}</p>
                      <div className="space-y-2">
                        {service.features.slice(0, 6).map((feature, idx) => (
                          <div key={idx} className="flex items-center text-sm">
                            <Icons.Check className="h-4 w-4 text-brand mr-2 flex-shrink-0" />
                            {feature}
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 flex items-center text-brand text-sm font-medium">
                        查看套餐 <Icons.ArrowRight className="h-4 w-4 ml-1" />
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Advantages Section */}
      <section className="px-4 py-20 bg-yellow-300">
        <div className="container mx-auto">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-black">为什么选择我们</h2>
              <p className="text-xl text-black max-w-2xl mx-auto">
                专业、安全、便捷的服务体验
              </p>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {advantages.map((advantage, index) => {
                const IconComponent = Icons[advantage.icon as keyof typeof Icons]
                return (
                  <motion.div
                    key={index}
                    variants={fadeInUp}
                    className="text-center"
                  >
                    <div className="flex items-center justify-center w-16 h-16 bg-brand/10 rounded-full mb-4 mx-auto">
                      <IconComponent className="h-8 w-8 text-brand" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-black">{advantage.title}</h3>
                    <p className="text-black">{advantage.description}</p>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="px-4 py-20 bg-yellow-300">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-black">联系我们</h2>
          <p className="text-xl text-black mb-8 max-w-2xl mx-auto">
            有任何问题或需要咨询？我们随时为您提供专业服务
          </p>
          <Button 
            size="lg" 
            className="text-lg px-8 py-4"
            onClick={() => window.open('https://work.weixin.qq.com/ca/cawcdeac58029da582', '_blank')}
          >
            立即联系
          </Button>
        </div>
      </section>

      {/* Service Modal */}
      <Dialog open={serviceModalOpen} onOpenChange={setServiceModalOpen}>
        <DialogContent className="sm:max-w-md w-[90vw] max-h-[80vh] overflow-y-auto">
          {selectedService && (
            <>
              <DialogHeader className="space-y-3">
                <DialogTitle className="text-lg font-bold text-center">{selectedService.name}</DialogTitle>
                <DialogDescription className="text-sm text-center text-gray-600">
                  {selectedService.description}
                </DialogDescription>
              </DialogHeader>

              <div className="mt-6 space-y-4">
                {selectedService.pricing?.map((plan: any, index: number) => (
                  <div
                    key={index}
                    className={`relative p-4 rounded-lg cursor-pointer border-2 transition-all ${
                      selectedPlan === index
                        ? 'bg-yellow-400 border-blue-600 shadow-md'
                        : 'bg-yellow-400 border-yellow-300 hover:border-yellow-400'
                    }`}
                    onClick={() => handlePlanSelect(index)}
                  >
                    {plan.popular && (
                      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                        <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                          热门
                        </span>
                      </div>
                    )}

                    <div className="text-center space-y-2">
                      <h3 className="font-bold text-lg text-gray-800">{plan.name}</h3>
                      <div className="font-bold text-2xl text-gray-900">
                        {plan.price}
                        {plan.period && <span className="text-sm text-gray-600">/{plan.period}</span>}
                      </div>
                    </div>

                    <div className="mt-3 space-y-1">
                      {plan.features?.slice(0, 4).map((feature: string, idx: number) => (
                        <div key={idx} className="flex items-center text-sm text-gray-700">
                          <span className="text-green-600 mr-2 text-base">✓</span>
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>

                    {selectedPlan === index && (
                      <div className="absolute top-3 right-3">
                        <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                <Button
                  className="w-full mt-6 py-3 bg-green-600 hover:bg-green-700 text-white text-lg font-medium rounded-lg"
                  onClick={() => {
                    if (selectedService?.id === 'others') {
                      window.open('https://work.weixin.qq.com/ca/cawcdeac58029da582', '_blank')
                      setServiceModalOpen(false)
                    } else {
                      handlePayment()
                    }
                  }}
                  disabled={selectedService?.id !== 'others' && (selectedPlan === null || isPaying)}
                >
                  {selectedService?.id === 'others'
                    ? '联系微信'
                    : isPaying
                      ? '创建订单中...'
                      : '立即支付'}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* 注册引导弹窗 */}
      <Dialog open={showRegisterModal} onOpenChange={setShowRegisterModal}>
        <DialogContent className="sm:max-w-md bg-yellow-300">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center text-black">
              🎉 欢迎来到BoLuo AI服务平台
            </DialogTitle>
            <DialogDescription className="text-center text-base text-black">
              注册账户，享受专业的AI工具代充服务
            </DialogDescription>
            <DialogDescription className="text-center text-lg font-medium text-black mt-2">
              代充海外最先进AI
            </DialogDescription>
          </DialogHeader>

          <div className="mt-6">
            <div className="text-center mb-6">
              <div className="bg-black bg-opacity-10 p-4 rounded-lg mb-4">
                <h3 className="font-semibold text-black mb-2">✨ 注册即享优惠</h3>
                <div className="text-sm text-black space-y-1">
                  <p>• ChatGPT Plus 专业代充服务</p>
                  <p>• Claude Code 官方申请服务</p>
                  <p>• 安全快速，无需密码</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Button
                className="w-full py-3 text-base bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => {
                  setShowRegisterModal(false)
                  window.open('/auth/signup', '_blank')
                }}
              >
                立即注册账户
              </Button>

              <Button
                variant="outline"
                className="w-full py-3 text-base bg-green-600 hover:bg-green-700 text-white border-green-600 hover:border-green-700"
                onClick={() => {
                  setShowRegisterModal(false)
                  window.open('/auth/login', '_blank')
                }}
              >
                已有账户？登录
              </Button>

              <Button
                variant="ghost"
                className="w-full py-2 text-sm text-black hover:bg-black hover:bg-opacity-10"
                onClick={() => setShowRegisterModal(false)}
              >
                稍后再说
              </Button>
            </div>

            <div className="mt-4 text-center">
              <p className="text-xs text-black">
                注册完成后，请选择相应服务套餐进行购买
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}