import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

// 强制动态渲染
export const dynamic = 'force-dynamic'

// 简单的内存存储，生产环境应该使用数据库
const tokenStore = new Map<string, {
  orderId: string
  used: boolean
  createdAt: number
  expiresAt: number
}>()

// 生成安全令牌
function generateToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

// 创建令牌（支付成功后调用）
export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json()

    if (!orderId) {
      return NextResponse.json({ error: '缺少订单ID' }, { status: 400 })
    }

    // 生成唯一令牌
    const token = generateToken()
    const now = Date.now()
    const expiresAt = now + (24 * 60 * 60 * 1000) // 24小时过期

    // 存储令牌信息
    tokenStore.set(token, {
      orderId,
      used: false,
      createdAt: now,
      expiresAt
    })

    return NextResponse.json({
      success: true,
      token,
      expiresAt
    })
  } catch (error) {
    console.error('生成令牌错误:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}

// 验证令牌
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ valid: false, reason: '缺少令牌' })
    }

    const tokenInfo = tokenStore.get(token)

    if (!tokenInfo) {
      return NextResponse.json({ valid: false, reason: '令牌不存在' })
    }

    // 检查是否过期
    if (Date.now() > tokenInfo.expiresAt) {
      tokenStore.delete(token)
      return NextResponse.json({ valid: false, reason: '令牌已过期' })
    }

    // 检查是否已使用
    if (tokenInfo.used) {
      return NextResponse.json({ valid: false, reason: '令牌已使用' })
    }

    return NextResponse.json({
      valid: true,
      orderId: tokenInfo.orderId,
      createdAt: tokenInfo.createdAt
    })
  } catch (error) {
    console.error('验证令牌错误:', error)
    return NextResponse.json({ valid: false, reason: '服务器错误' })
  }
}

// 使用令牌（点击按钮时调用）
export async function DELETE(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ error: '缺少令牌' }, { status: 400 })
    }

    const tokenInfo = tokenStore.get(token)

    if (!tokenInfo) {
      return NextResponse.json({ error: '令牌不存在' }, { status: 404 })
    }

    if (tokenInfo.used) {
      return NextResponse.json({ error: '令牌已使用' }, { status: 400 })
    }

    if (Date.now() > tokenInfo.expiresAt) {
      tokenStore.delete(token)
      return NextResponse.json({ error: '令牌已过期' }, { status: 400 })
    }

    // 标记为已使用
    tokenInfo.used = true
    tokenStore.set(token, tokenInfo)

    return NextResponse.json({
      success: true,
      message: '令牌已使用',
      orderId: tokenInfo.orderId
    })
  } catch (error) {
    console.error('使用令牌错误:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}