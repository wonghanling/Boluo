import { NextRequest, NextResponse } from 'next/server';
import { createPCPayment, createMobilePayment, isMobile, generateOrderNo } from '@/lib/alipay';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, userInfo, userId } = body;

    // 计算金额
    const itemsTotal = items.reduce((sum: number, item: any) => {
      return sum + (item.price * item.quantity);
    }, 0);

    const totalAmount = itemsTotal.toFixed(2);

    // 生成订单号
    const orderNo = generateOrderNo();

    // 保存订单到数据库
    const host = request.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;

    try {
      const saveOrderResponse = await fetch(`${baseUrl}/api/orders/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderNo,
          userId,
          userName: userInfo.name,
          userPhone: userInfo.phone,
          userAddress: userInfo.address,
          items: items.map((item: any) => ({
            productId: item.id,
            productName: item.name,
            productImage: item.imageUrl,
            price: item.price,
            quantity: item.quantity,
            subtotal: item.price * item.quantity,
          })),
          totalAmount,
        }),
      });

      const saveOrderResult = await saveOrderResponse.json();
      if (!saveOrderResult.success) {
        console.error('保存订单失败:', saveOrderResult.error);
      }
    } catch (saveError) {
      console.error('保存订单异常:', saveError);
      // 继续执行，不中断支付流程
    }

    // 获取User-Agent判断设备类型
    const userAgent = request.headers.get('user-agent') || '';
    const isMobileDevice = isMobile(userAgent);

    // 支付参数
    const paymentParams = {
      outTradeNo: orderNo,
      totalAmount: totalAmount,
      subject: '山姆代购订单',
      body: `订单号:${orderNo}, 共${items.length}件商品`,
      returnUrl: `${baseUrl}/payment/return?orderNo=${orderNo}`,
      notifyUrl: `${baseUrl}/api/payment/notify`,
    };

    // 根据设备类型选择支付方式
    let paymentUrl;
    if (isMobileDevice) {
      // 手机网站支付
      paymentUrl = await createMobilePayment(paymentParams);
    } else {
      // 电脑网站支付
      paymentUrl = await createPCPayment(paymentParams);
    }

    return NextResponse.json({
      success: true,
      data: {
        orderNo,
        paymentUrl,
        totalAmount,
        isMobile: isMobileDevice,
      },
    });
  } catch (error: any) {
    console.error('创建支付订单失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || '创建支付订单失败',
      },
      { status: 500 }
    );
  }
}
