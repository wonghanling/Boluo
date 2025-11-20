import { NextRequest, NextResponse } from 'next/server'

// 强制动态渲染
export const dynamic = 'force-dynamic'

// 用于存储订单到令牌的映射关系
const orderTokenMap = new Map<string, string>()

// 支付成功后，直接跳转到claim-membership页面
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const orderId = searchParams.get('orderId')
    const amount = searchParams.get('amount')
    const service = searchParams.get('service')

    if (!orderId) {
      console.log('❌ 缺少订单号，跳转到首页')
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/`)
    }

    console.log('✅ 支付成功，准备跳转到claim-membership', { orderId, amount, service })

    // 构建claim-membership URL，携带支付信息
    let claimUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://boluoing.com'}/claim-membership`

    const params = new URLSearchParams()
    if (amount) params.append('amount', amount)
    if (service) params.append('service', service)
    params.append('orderId', orderId)
    params.append('paymentSuccess', 'true')

    if (params.toString()) {
      claimUrl += '?' + params.toString()
    }

    console.log('🔗 跳转到:', claimUrl)
    return NextResponse.redirect(claimUrl)

  } catch (error) {
    console.error('支付成功跳转处理错误:', error)
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://boluoing.com'}/`)
  }
}