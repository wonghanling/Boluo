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
  // 检查令牌状态
  const [canClaimMembership, setCanClaimMembership] = React.useState(false)
  const [currentToken, setCurrentToken] = React.useState<string | null>(null)

  React.useEffect(() => {
    // 检查URL参数中的token
    const urlParams = new URLSearchParams(window.location.search)
    const token = urlParams.get('token')

    if (token) {
      // 验证令牌
      fetch(`/api/token?token=${token}`)
        .then(response => response.json())
        .then(result => {
          if (result.valid) {
            setCanClaimMembership(true)
            setCurrentToken(token)
            console.log('✅ 令牌验证成功，订单号:', result.orderId)
          } else {
            setCanClaimMembership(false)
            setCurrentToken(null)
            console.log('❌ 令牌验证失败:', result.reason)
          }
        })
        .catch(error => {
          console.error('令牌验证请求失败:', error)
          setCanClaimMembership(false)
          setCurrentToken(null)
        })
    } else {
      // 没有令牌，检查是否已经使用过（防止重复）
      const claimed = localStorage.getItem('membershipClaimed')
      if (claimed === 'true') {
        setCanClaimMembership(false)
      }
    }
  }, [])

  const [openFAQ, setOpenFAQ] = React.useState<number | null>(null)
  const [selectedService, setSelectedService] = React.useState<any>(null)
  const [serviceModalOpen, setServiceModalOpen] = React.useState(false)
  const [selectedPlan, setSelectedPlan] = React.useState<number | null>(null)

  const copyWechatId = () => {
    navigator.clipboard.writeText(contactInfo.wechat)
    alert("微信号已复制到剪贴板")
  }

  const handlePayment = async () => {
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
        // 根据设备类型处理支付
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
          // 移动端：新窗口打开
          window.open(result.payUrl, '_blank')
        }
        setServiceModalOpen(false)
      } else {
        alert(result.error || '支付创建失败')
      }
    } catch (error) {
      console.error('支付错误:', error)
      alert('支付接口异常，请稍后重试')
    }
  }

  const handleServiceClick = (service: any) => {
    // 暂时禁用网络云加速服务的弹窗
    if (service.id === 'network') {
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
              className="text-base md:text-lg text-black mb-8 max-w-2xl mx-auto font-medium"
            >
              领取您的会员/无密码接触充值您的账号
            </motion.p>
            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button 
                size="lg" 
                className="text-lg px-8 py-4 bg-transparent text-blue-600 hover:bg-blue-50 border-2 border-blue-600 font-normal"
                onClick={() => window.open('https://work.weixin.qq.com/ca/cawcdeac58029da582', '_blank')}
              >
                {heroContent.primaryCta}
              </Button>
              <Button
                size="lg"
                className={`text-lg px-8 py-6 bg-transparent border-2 font-normal transition-all ${
                  canClaimMembership ?
                  'text-white border-white hover:bg-white hover:text-gray-800' :
                  'text-white/60 border-white/60 cursor-not-allowed'
                }`}
                onClick={async () => {
                  if (canClaimMembership && currentToken) {
                    try {
                      // 使用令牌（标记为已使用）
                      const response = await fetch('/api/token', {
                        method: 'DELETE',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ token: currentToken })
                      })

                      const result = await response.json()

                      if (result.success) {
                        // 令牌使用成功，立即禁用按钮
                        setCanClaimMembership(false)
                        setCurrentToken(null)
                        localStorage.setItem('membershipClaimed', 'true')

                        // 跳转到会员领取页面
                        window.open('/claim-membership', '_blank')

                        console.log('✅ 令牌已使用，订单号:', result.orderId)
                      } else {
                        alert('令牌已失效，请重新支付')
                        console.error('❌ 令牌使用失败:', result.error)
                      }
                    } catch (error) {
                      console.error('令牌使用请求失败:', error)
                      alert('网络错误，请稍后重试')
                    }
                  }
                }}
                disabled={!canClaimMembership}
              >
                <div className="flex flex-col items-center justify-center space-y-1">
                  <span className="font-semibold text-sm sm:text-base">进入领取</span>
                </div>
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

              {/* 提示文案 */}
              <div className="text-center text-black">
                <div
                  className="text-sm font-black"
                  style={{
                    fontWeight: 900,
                    fontFamily: '"Impact", "Franklin Gothic Heavy", "Arial Black", "黑体", "SimHei", "Microsoft YaHei Heavy", sans-serif',
                    letterSpacing: '-0.5px'
                  }}
                >
                  完成支付按钮可点击
                </div>
                <div
                  className="text-sm font-black"
                  style={{
                    fontWeight: 900,
                    fontFamily: '"Impact", "Franklin Gothic Heavy", "Arial Black", "黑体", "SimHei", "Microsoft YaHei Heavy", sans-serif',
                    letterSpacing: '-0.5px'
                  }}
                >
                  一次进入
                </div>
              </div>
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
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto p-4">
          {selectedService && (
            <>
              <DialogHeader className="pb-2">
                <DialogTitle className="text-lg sm:text-xl font-bold">{selectedService.name}</DialogTitle>
                <DialogDescription className="text-sm sm:text-base">
                  {selectedService.description}
                </DialogDescription>
              </DialogHeader>

              <div className="mt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedService.pricing?.map((plan: any, index: number) => (
                    <div
                      key={index}
                      className={`relative p-2 rounded-lg text-gray-800 shadow-lg cursor-pointer transition-all duration-300 ${
                        selectedPlan === index
                          ? 'bg-yellow-400 border-2 border-blue-600'
                          : 'bg-yellow-400 hover:shadow-xl'
                      }`}
                      onClick={() => handlePlanSelect(index)}
                    >
                      {plan.popular && (
                        <div className="absolute -top-1.5 left-1/2 -translate-x-1/2">
                          <span className="bg-blue-600 text-white px-2 py-0.5 rounded-full text-xs font-medium">
                            热门
                          </span>
                        </div>
                      )}

                      <div className="text-center mb-2">
                        <h3 className="text-sm sm:text-base font-bold mb-0.5">{plan.name}</h3>
                        <div className="mb-1">
                          <span className="text-lg sm:text-xl font-bold">{plan.price}</span>
                          {plan.period && <span className="text-gray-600 text-xs">/{plan.period}</span>}
                        </div>
                      </div>

                      <ul className="space-y-0.5">
                        {plan.features?.slice(0, 5).map((feature: string, idx: number) => (
                          <li key={idx} className="flex items-start text-xs leading-tight">
                            <Icons.Check className="h-2.5 w-2.5 text-blue-600 mr-1 mt-0.5 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                <div className="mt-4 text-center">
                  <Button
                    className="text-sm sm:text-base px-4 py-2 bg-transparent border border-blue-600 text-blue-600 hover:bg-blue-50 font-normal"
                    onClick={() => {
                      if (selectedService?.id === 'others') {
                        window.open('https://work.weixin.qq.com/ca/cawcdeac58029da582', '_blank')
                        setServiceModalOpen(false)
                      } else {
                        handlePayment()
                      }
                    }}
                    disabled={selectedService?.id !== 'others' && selectedPlan === null}
                  >
                    {selectedService?.id === 'others' ? '联系微信' : '立即支付'}
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}