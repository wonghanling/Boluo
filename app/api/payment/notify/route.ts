import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'

// 强制动态渲染
export const dynamic = 'force-dynamic'

// 初始化 Supabase 客户端（用于服务端）
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// 生成MD5哈希
function md5(text: string): string {
  return crypto.createHash('md5').update(text).digest('hex')
}

// 验证签名
function getHash(params: Record<string, any>, appSecret: string): string {
  const sortedParams = Object.keys(params)
    .filter(key => params[key] && key !== 'hash') // 过滤掉空值和hash本身
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&')
  const stringSignTemp = sortedParams + appSecret
  const hash = md5(stringSignTemp)
  console.log('回调验签参数:', sortedParams)
  console.log('回调验签字符串:', stringSignTemp)
  console.log('回调生成的签名:', hash)
  return hash
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const appSecret = process.env.XUNHUPAY_SECRET

    if (!appSecret) {
      console.error('虎皮椒密钥配置缺失')
      return new NextResponse('success', { status: 200 })
    }

    console.log('支付回调数据:', body)

    // 验签
    const calculatedHash = getHash(body, appSecret)
    if (body.hash !== calculatedHash) {
      console.error('验签失败:', {
        received: body.hash,
        calculated: calculatedHash
      })
      return new NextResponse('success', { status: 200 })
    }

    // 处理支付成功
    if (body.status === 'OD') {
      console.log('支付成功:', {
        orderId: body.trade_order_id,
        amount: body.total_fee,
        transactionId: body.transaction_id
      })

      // 生成安全令牌
      try {
        const tokenResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            orderId: body.trade_order_id
          })
        })

        const tokenResult = await tokenResponse.json()

        if (tokenResult.success) {
          console.log('✅ 令牌生成成功:', tokenResult.token)

          // 注意：虎皮椒回调不能直接跳转用户页面
          // 实际跳转需要在支付接口的return_url中处理
          // 这里只是生成令牌供后续使用
        } else {
          console.error('❌ 生成令牌失败:', tokenResult.error)
        }
      } catch (tokenError) {
        console.error('❌ 令牌生成接口调用失败:', tokenError)
      }

      // 【新增】保存订单信息到 user_orders 表
      // 注意：这个操作独立进行，即使失败也不影响上面的token生成
      try {
        const { error: saveError } = await supabase
          .from('user_orders')
          .insert({
            order_id: body.trade_order_id,
            service_type: body.title || '未知服务',
            amount: parseFloat(body.total_fee),
            status: 'completed',
            payment_method: 'xunhupay',
            transaction_id: body.transaction_id,
            user_id: null // 此时还没有user_id，后续用户提交表单时可以关联
          })

        if (saveError) {
          console.error('❌ 保存订单信息失败（不影响支付流程）:', saveError)
        } else {
          console.log('✅ 订单信息已保存到 user_orders 表')
        }
      } catch (saveOrderError) {
        console.error('❌ 保存订单信息异常（不影响支付流程）:', saveOrderError)
      }

    } else {
      console.log('支付未成功:', {
        orderId: body.trade_order_id,
        status: body.status
      })
    }

    // 虎皮椒要求返回 success 字符串
    return new NextResponse('success', { status: 200 })

  } catch (error) {
    console.error('支付回调处理错误:', error)
    return new NextResponse('success', { status: 200 })
  }
}