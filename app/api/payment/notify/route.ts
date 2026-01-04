import { NextRequest, NextResponse } from 'next/server'
import { verifyCallback } from '@/lib/alipay'
import { createClient } from '@supabase/supabase-js'

// 强制动态渲染
export const dynamic = 'force-dynamic'

// 初始化 Supabase 客户端（用于服务端）
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// 支付宝异步通知回调
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const params: any = {}

    formData.forEach((value, key) => {
      params[key] = value
    })

    console.log('支付宝异步通知:', params)

    // 验证签名
    const isValid = verifyCallback(params)

    if (!isValid) {
      console.error('签名验证失败')
      return new NextResponse('fail', { status: 400 })
    }

    // 提取关键信息
    const {
      out_trade_no, // 商户订单号
      trade_no, // 支付宝交易号
      trade_status, // 交易状态
      total_amount, // 订单金额
    } = params

    // 处理支付成功
    if (trade_status === 'TRADE_SUCCESS' || trade_status === 'TRADE_FINISHED') {
      console.log(`订单 ${out_trade_no} 支付成功，支付宝交易号: ${trade_no}`)

      // 更新数据库订单状态为已支付
      try {
        const { error } = await supabase
          .from('orders')
          .update({
            payment_status: 'paid',
            trade_order_id: trade_no,
            paid_at: new Date().toISOString(),
          })
          .eq('order_id', out_trade_no)

        if (error) {
          console.error('更新订单状态失败:', error)
        } else {
          console.log(`订单 ${out_trade_no} 状态已更新为已支付`)
        }
      } catch (dbError) {
        console.error('数据库更新异常:', dbError)
      }
    }

    // 返回success给支付宝，表示已收到通知
    return new NextResponse('success')
  } catch (error) {
    console.error('处理支付回调失败:', error)
    return new NextResponse('fail', { status: 500 })
  }
}

// 不允许GET请求
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}
