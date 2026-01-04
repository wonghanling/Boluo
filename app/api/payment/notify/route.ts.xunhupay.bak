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

      // 【更新】保存/更新订单信息到新的统一 orders 表
      try {
        // 先检查订单是否已存在
        const { data: existingOrder } = await supabase
          .from('orders')
          .select('*')
          .eq('order_id', body.trade_order_id)
          .single()

        if (existingOrder) {
          // 订单存在，更新支付状态
          const { error: updateError } = await supabase
            .from('orders')
            .update({
              payment_status: 'paid',
              updated_at: new Date().toISOString()
            })
            .eq('order_id', body.trade_order_id)

          if (updateError) {
            console.error('❌ 更新订单支付状态失败:', updateError)
          } else {
            console.log('✅ 订单支付状态已更新为已支付')
          }
        } else {
          // 订单不存在，创建新订单记录
          const { error: insertError } = await supabase
            .from('orders')
            .insert({
              order_id: body.trade_order_id,
              amount: parseFloat(body.total_fee),
              service_type: body.title || '未知服务',
              payment_status: 'paid',
              processing_status: 'waiting_for_info',
              payment_method: 'xunhupay'
            })

          if (insertError) {
            console.error('❌ 创建订单记录失败:', insertError)
          } else {
            console.log('✅ 新订单记录已创建并标记为已支付')
          }
        }
      } catch (saveOrderError) {
        console.error('❌ 处理订单信息异常（不影响支付流程）:', saveOrderError)
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