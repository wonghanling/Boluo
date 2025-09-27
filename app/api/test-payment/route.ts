import { NextRequest, NextResponse } from 'next/server'

// 测试接口 - 模拟支付成功生成令牌
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('orderId') || `test_${Date.now()}`

    console.log('🧪 模拟支付成功，订单号:', orderId)

    // 生成测试令牌
    const tokenResponse = await fetch(`${request.nextUrl.origin}/api/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ orderId })
    })

    const tokenResult = await tokenResponse.json()

    if (tokenResult.success) {
      // 跳转到带令牌的首页
      const successUrl = `${request.nextUrl.origin}?token=${tokenResult.token}`
      console.log('🎯 跳转到:', successUrl)

      return NextResponse.redirect(successUrl)
    } else {
      console.error('❌ 令牌生成失败:', tokenResult.error)
      return NextResponse.json({ error: '令牌生成失败', details: tokenResult.error }, { status: 500 })
    }

  } catch (error) {
    console.error('❌ 模拟支付测试错误:', error)
    return NextResponse.json({
      error: '测试接口错误',
      details: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 })
  }
}