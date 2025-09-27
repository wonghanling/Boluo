import { NextRequest, NextResponse } from 'next/server'

// 用于存储订单到令牌的映射关系
const orderTokenMap = new Map<string, string>()

// 支付成功后，根据订单号获取令牌跳转链接
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const orderId = searchParams.get('orderId')

    if (!orderId) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/`)
    }

    // 生成令牌
    const tokenResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://boluo.onrender.com'}/api/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ orderId })
    })

    const tokenResult = await tokenResponse.json()

    if (tokenResult.success) {
      // 跳转到带令牌的首页
      const successUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://boluo.onrender.com'}?token=${tokenResult.token}`
      return NextResponse.redirect(successUrl)
    } else {
      console.error('令牌生成失败:', tokenResult.error)
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://boluo.onrender.com'}/`)
    }

  } catch (error) {
    console.error('支付成功跳转处理错误:', error)
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://boluo.onrender.com'}/`)
  }
}