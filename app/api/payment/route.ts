import { NextRequest, NextResponse } from 'next/server'
import { createPCPayment, createMobilePayment, isMobile, generateOrderNo } from '@/lib/alipay'

// 强制动态渲染
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amount, title } = body

    // 获取请求IP和User Agent
    const forwardedFor = request.headers.get('x-forwarded-for')
    const realIP = request.headers.get('x-real-ip')
    const clientIP = forwardedFor?.split(',')[0] || realIP || '未知'
    const userAgent = request.headers.get('user-agent') || '未知'

    // 获取当前登录用户信息
    const { supabase } = await import('@/lib/supabase')
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    // 生成订单号
    const orderId = generateOrderNo()

    console.log('✅ 创建新订单:', orderId)

    // 保存订单到数据库（新表结构：只存支付信息）
    const { error: insertError } = await supabase
      .from('orders')
      .insert({
        order_id: orderId,
        amount: parseFloat(amount),
        service_type: title,
        payment_status: 'pending',
        payment_method: 'alipay',
        ip_address: clientIP,
        user_agent: userAgent,
        user_id: user?.id || null,
        user_email: user?.email || null
      })

    if (insertError) {
      console.error('保存订单失败:', insertError)
      return NextResponse.json({ error: '订单创建失败' }, { status: 500 })
    }

    console.log('✅ 订单已保存到数据库:', orderId)

    // 获取基础URL
    const notifyUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

    // 判断设备类型
    const isMobileDevice = isMobile(userAgent)

    // 支付参数
    const paymentParams = {
      outTradeNo: orderId,
      totalAmount: parseFloat(amount).toFixed(2),
      subject: title,
      body: `订单号:${orderId}`,
      returnUrl: `${notifyUrl}/api/payment/success?orderId=${orderId}&amount=${amount}&service=${encodeURIComponent(title)}`,
      notifyUrl: `${notifyUrl}/api/payment/notify`,
    }

    console.log('支付参数:', paymentParams)
    console.log('设备类型:', isMobileDevice ? '移动端' : 'PC端')

    // 根据设备类型选择支付方式
    let paymentUrl
    if (isMobileDevice) {
      // 手机网站支付 - 直接跳转支付宝APP
      paymentUrl = await createMobilePayment(paymentParams)
    } else {
      // 电脑网站支付 - 跳转支付宝页面显示二维码
      paymentUrl = await createPCPayment(paymentParams)
    }

    return NextResponse.json({
      success: true,
      payUrl: paymentUrl,
      orderId: orderId,
      isMobile: isMobileDevice,
    })

  } catch (error: any) {
    console.error('Payment API error:', error)
    return NextResponse.json({
      error: error.message || '支付接口异常'
    }, { status: 500 })
  }
}
