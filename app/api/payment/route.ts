import { NextRequest, NextResponse } from 'next/server'
import { createPCPayment, createMobilePayment, isMobile, generateOrderNo } from '@/lib/alipay'
import { isRelogradeBrand, quoteBrandProduct, type RelogradeBrandId } from '@/lib/relograde/catalog'
import { createRelogradeAdminClient } from '@/lib/relograde/db'

// 强制动态渲染
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      amount,
      title,
      contactEmail,
      contactMethod,
      customerNote,
      relograde,
    } = body

    // 获取请求IP和User Agent
    const forwardedFor = request.headers.get('x-forwarded-for')
    const realIP = request.headers.get('x-real-ip')
    const clientIP = forwardedFor?.split(',')[0] || realIP || '未知'
    const userAgent = request.headers.get('user-agent') || '未知'

    // 获取当前登录用户信息
    const { supabase } = await import('@/lib/supabase')
    const { data: { user } } = await supabase.auth.getUser()

    if (!amount || !title || !contactEmail || !contactMethod) {
      return NextResponse.json({ error: '缺少支付参数' }, { status: 400 })
    }

    let chargedAmount = parseFloat(amount)
    let serviceTitle = title
    let quote = null as Awaited<ReturnType<typeof quoteBrandProduct>> | null

    if (relograde) {
      const brandId = String(relograde.brandId || '')
      const currency = String(relograde.currency || 'USD').toUpperCase()
      const faceValue = Number(relograde.faceValue)
      const preferVariable = Boolean(relograde.preferVariable)
      const region = relograde.region ? String(relograde.region).toLowerCase() : undefined
      const productSlug = relograde.productSlug ? String(relograde.productSlug) : undefined

      if (!isRelogradeBrand(brandId) || !Number.isFinite(faceValue) || faceValue <= 0) {
        return NextResponse.json({ error: '礼品卡参数无效' }, { status: 400 })
      }

      quote = await quoteBrandProduct({
        brandId: brandId as RelogradeBrandId,
        currency,
        faceValue,
        preferVariable,
        region,
        productSlug,
      })

      if (!quote.inStock) {
        return NextResponse.json({ error: '该面额暂时缺货' }, { status: 400 })
      }

      chargedAmount = quote.sellCny
      serviceTitle = region
        ? `${title} ${region.toUpperCase()} ${currency} ${faceValue}`
        : `${title} ${currency} ${faceValue}`
    }

    // 生成订单号
    const orderId = generateOrderNo()

    console.log('✅ 创建新订单:', orderId)
    console.log('📝 收到联系方式:', {
      contactEmail,
      contactMethod,
      customerNote,
    })

    // 保存订单到数据库（新表结构：只存支付信息）
    const { error: insertError } = await supabase
      .from('orders')
      .insert({
        order_id: orderId,
        amount: chargedAmount,
        service_type: serviceTitle,
        payment_status: 'pending',
        payment_method: 'alipay',
        ip_address: clientIP,
        user_agent: userAgent,
        user_id: user?.id || null,
        user_email: contactEmail,
        contact_method: contactMethod || null,
        customer_note: customerNote || null,
      })

    if (insertError) {
      console.error('保存订单失败:', insertError)
      return NextResponse.json({ error: '订单创建失败' }, { status: 500 })
    }

    console.log('✅ 订单已保存到数据库:', orderId)

    if (quote) {
      const admin = createRelogradeAdminClient()
      if (!admin) {
        return NextResponse.json({ error: '出码服务未配置' }, { status: 500 })
      }

      const { error: voucherError } = await admin.from('voucher_orders').insert({
        order_id: orderId,
        user_id: user?.id || null,
        user_email: contactEmail,
        brand_slug: quote.brandId,
        product_slug: quote.productSlug,
        face_value: quote.faceValue,
        face_value_currency: quote.faceValueCurrency,
        is_variable: quote.isVariable,
        cost_amount: quote.costAmount,
        cost_currency: quote.costCurrency,
        sell_cny: quote.sellCny,
        margin_rate: quote.marginRate,
        profit_cny: quote.profitCny,
        status: 'pending_payment',
        quote_snapshot: quote,
      })

      if (voucherError) {
        console.error('保存兑换码订单失败:', voucherError)
        return NextResponse.json({ error: '订单创建失败' }, { status: 500 })
      }
    }

    // 获取基础URL
    const notifyUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

    // 判断设备类型
    const isMobileDevice = isMobile(userAgent)

    // 支付参数
    const paymentParams = {
      outTradeNo: orderId,
      totalAmount: chargedAmount.toFixed(2),
      subject: serviceTitle,
      body: `订单号:${orderId}`,
      returnUrl: `${notifyUrl}/api/payment/success?orderId=${orderId}`,
      notifyUrl: `${notifyUrl}/api/payment/notify`,
    }

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
