import { AlipaySdk } from 'alipay-sdk';

// 延迟初始化支付宝SDK，避免构建时报错
let alipaySdk: AlipaySdk | null = null;

function getAlipaySdk(): AlipaySdk {
  if (!alipaySdk) {
    if (!process.env.ALIPAY_APP_ID || !process.env.ALIPAY_PRIVATE_KEY || !process.env.ALIPAY_PUBLIC_KEY) {
      throw new Error('支付宝配置未完成，请配置环境变量：ALIPAY_APP_ID, ALIPAY_PRIVATE_KEY, ALIPAY_PUBLIC_KEY');
    }

    alipaySdk = new AlipaySdk({
      appId: process.env.ALIPAY_APP_ID,
      privateKey: process.env.ALIPAY_PRIVATE_KEY,
      alipayPublicKey: process.env.ALIPAY_PUBLIC_KEY,
      gateway: 'https://openapi.alipay.com/gateway.do',
      signType: 'RSA2',
      charset: 'utf-8',
      version: '1.0',
    });
  }
  return alipaySdk;
}

// 设备类型检测
export function isMobile(userAgent: string): boolean {
  return /mobile|android|iphone|ipad|phone/i.test(userAgent);
}

// 创建支付订单（PC端 - 电脑网站支付）
export async function createPCPayment(params: {
  outTradeNo: string;
  totalAmount: string;
  subject: string;
  body?: string;
  returnUrl: string;
  notifyUrl: string;
}) {
  const sdk = getAlipaySdk();
  const result = await sdk.pageExec('alipay.trade.page.pay', {
    bizContent: {
      out_trade_no: params.outTradeNo,
      product_code: 'FAST_INSTANT_TRADE_PAY',
      total_amount: params.totalAmount,
      subject: params.subject,
      body: params.body || params.subject,
    },
    returnUrl: params.returnUrl,
    notifyUrl: params.notifyUrl,
  });

  return result;
}

// 创建支付订单（移动端 - 手机网站支付）
export async function createMobilePayment(params: {
  outTradeNo: string;
  totalAmount: string;
  subject: string;
  body?: string;
  returnUrl: string;
  notifyUrl: string;
}) {
  const sdk = getAlipaySdk();
  const result = await sdk.pageExec('alipay.trade.wap.pay', {
    bizContent: {
      out_trade_no: params.outTradeNo,
      product_code: 'QUICK_WAP_WAY',
      total_amount: params.totalAmount,
      subject: params.subject,
      body: params.body || params.subject,
    },
    returnUrl: params.returnUrl,
    notifyUrl: params.notifyUrl,
  });

  return result;
}

// 验证支付宝回调签名
export function verifyCallback(params: any): boolean {
  const sdk = getAlipaySdk();
  return sdk.checkNotifySign(params);
}

// 查询订单支付状态
export async function queryPayment(outTradeNo: string) {
  const sdk = getAlipaySdk();
  const result = await sdk.exec('alipay.trade.query', {
    bizContent: {
      out_trade_no: outTradeNo,
    },
  });

  return result;
}

// 生成订单号
export function generateOrderNo(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `ORDER${timestamp}${random}`;
}
