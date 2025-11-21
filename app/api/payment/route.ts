import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

// 强制动态渲染
export const dynamic = 'force-dynamic'

// 生成MD5哈希
function md5(text: string): string {
  return crypto.createHash('md5').update(text).digest('hex')
}

// 生成签名
function getHash(params: Record<string, any>, appSecret: string): string {
  const sortedParams = Object.keys(params)
    .filter(key => params[key] && key !== 'hash') // 过滤掉空值和hash本身
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&')
  const stringSignTemp = sortedParams + appSecret
  const hash = md5(stringSignTemp)
  console.log('签名参数:', sortedParams)
  console.log('签名字符串:', stringSignTemp)
  console.log('生成的签名:', hash)
  return hash
}

// 生成UUID
function generateUUID(): string {
  return 'xxxx-xxxx-4xxx-yxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

// 获取当前时间戳
function nowDate(): number {
  return Math.floor(Date.now() / 1000)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, amount, title, serviceType, planIndex } = body

    // 从环境变量获取虎皮椒配置
    const appId = process.env.XUNHUPAY_APPID
    const appSecret = process.env.XUNHUPAY_SECRET
    const notifyUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

    if (!appId || !appSecret) {
      return NextResponse.json({ error: '支付配置缺失' }, { status: 500 })
    }

    // 获取请求IP和User Agent
    const forwardedFor = request.headers.get('x-forwarded-for')
    const realIP = request.headers.get('x-real-ip')
    const clientIP = forwardedFor?.split(',')[0] || realIP || '未知'
    const userAgent = request.headers.get('user-agent') || '未知'

    // 获取当前登录用户信息
    const { supabase } = await import('@/lib/supabase')
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    // 🛡️ 防重复：检查是否已有pending订单
    if (user?.id) {
      const { data: existingOrder } = await supabase
        .from('orders')
        .select('order_id')
        .eq('user_id', user.id)
        .eq('payment_status', 'pending')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (existingOrder) {
        console.log('⚠️ 用户已有pending订单，使用已存在的订单:', existingOrder.order_id)
        // 使用已存在的订单ID生成支付链接
        const existingOrderId = existingOrder.order_id

        // 跳过创建新订单，直接生成支付链接
        const params = {
          version: '1.1',
          appid: appId,
          trade_order_id: existingOrderId,
          total_fee: parseFloat(amount).toFixed(2),
          title: title,
          time: nowDate(),
          notify_url: `${notifyUrl}/api/payment/notify`,
          return_url: `${notifyUrl}/api/payment/success?orderId=${existingOrderId}&amount=${amount}&service=${encodeURIComponent(title)}`,
          nonce_str: generateUUID(),
          type: 'WAP',
          wap_url: notifyUrl,
          wap_name: 'BoLuo支付'
        }

        const paramsStr = Object.keys(params)
          .sort()
          .map(key => `${key}=${params[key as keyof typeof params]}`)
          .join('&')

        const hash = MD5(`${paramsStr}${appSecret}`).toString()
        const paymentUrl = `${apiUrl}?${paramsStr}&hash=${hash}`

        console.log('✅ 使用已存在订单生成支付链接:', existingOrderId)
        return NextResponse.json({ url: paymentUrl })
      }
    }

    // 保存订单到数据库
    const { error: insertError } = await supabase
      .from('orders')
      .insert({
        order_id: orderId,
        amount: parseFloat(amount),
        service_type: title,
        payment_status: 'pending',
        processing_status: 'waiting_for_info',
        payment_method: 'xunhupay',
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

    // 构建支付参数
    const params = {
      version: '1.1',
      appid: appId,
      trade_order_id: orderId,
      total_fee: parseFloat(amount).toFixed(2),
      title: title,
      time: nowDate(),
      notify_url: `${notifyUrl}/api/payment/notify`,
      return_url: `${notifyUrl}/api/payment/success?orderId=${orderId}&amount=${amount}&service=${encodeURIComponent(title)}`,
      nonce_str: generateUUID(),
      type: 'WAP',
      wap_url: notifyUrl,
      wap_name: 'BoLuo支付'
    }

    console.log('支付参数:', params)
    console.log('AppId:', appId)
    console.log('AppSecret长度:', appSecret?.length)

    // 生成签名
    const hash = getHash(params, appSecret)

    // 构建请求参数
    const requestParams = new URLSearchParams({
      version: params.version,
      appid: params.appid,
      trade_order_id: params.trade_order_id,
      total_fee: params.total_fee,
      title: params.title,
      time: params.time.toString(),
      notify_url: params.notify_url,
      return_url: params.return_url,
      nonce_str: params.nonce_str,
      type: params.type,
      wap_url: params.wap_url,
      wap_name: params.wap_name,
      hash,
    })

    // 发起支付请求
    const response = await fetch('https://api.xunhupay.com/payment/do.html', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: requestParams,
    })

    const result = await response.text()

    try {
      const jsonResult = JSON.parse(result)
      if (jsonResult.errcode === 0) {
        return NextResponse.json({
          success: true,
          payUrl: jsonResult.url,
          orderId: orderId,
        })
      } else {
        return NextResponse.json({
          error: jsonResult.errmsg || '支付创建失败'
        }, { status: 400 })
      }
    } catch (parseError) {
      console.error('Parse payment response error:', parseError)
      return NextResponse.json({
        error: '支付响应解析失败'
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Payment API error:', error)
    return NextResponse.json({
      error: '支付接口异常'
    }, { status: 500 })
  }
}