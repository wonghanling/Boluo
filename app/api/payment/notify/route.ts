import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

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

      // 这里可以添加订单处理逻辑
      // 1. 根据订单号查询数据库
      // 2. 更新订单状态
      // 3. 发送服务开通通知等

      // TODO: 添加具体的业务处理逻辑
      // - 更新订单状态为已支付
      // - 根据服务类型开通对应服务
      // - 发送邮件/微信通知用户

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