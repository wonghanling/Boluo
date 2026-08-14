import { NextRequest, NextResponse } from "next/server"
import { createMobilePayment, createPCPayment, isMobile } from "@/lib/alipay"
import { isAutomatedVerificationProductCode, isVerificationProductCode } from "@/lib/verification/products"
import {
  createVerificationAdminClient,
  enforceVerificationRateLimit,
  errorResponse,
  generateVerificationPaymentOrderNo,
  getVerificationProduct,
  requireVerificationUser,
  VerificationRequestError,
} from "@/lib/verification/server"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const user = await requireVerificationUser(request)
    await enforceVerificationRateLimit(request, user.id, "create-payment", 5, 60)
    const body = await request.json()
    const productCode = String(body.productCode || "")
    const idempotencyKey = String(body.idempotencyKey || "")

    if (!isVerificationProductCode(productCode)) {
      throw new VerificationRequestError("验证商品不存在", 404, "PRODUCT_NOT_FOUND")
    }
    if (!isAutomatedVerificationProductCode(productCode)) {
      throw new VerificationRequestError("该商品等待上游接口文档，当前不能购买", 409, "PRODUCT_NOT_IMPLEMENTED")
    }
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(idempotencyKey)) {
      throw new VerificationRequestError("请刷新页面后重新发起支付", 400, "INVALID_IDEMPOTENCY_KEY")
    }

    const product = await getVerificationProduct(productCode)
    if (!product.is_active || product.sales_paused) {
      throw new VerificationRequestError("该商品暂未开放销售，请稍后再试", 409, "SALES_PAUSED")
    }

    const admin = createVerificationAdminClient()
    const { count, error: countError } = await admin
      .from("verification_orders")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .in("fulfillment_status", ["paid", "ready", "requesting_number", "waiting_code", "changing_number", "code_received"])
    if (countError) throw new VerificationRequestError("订单检查失败，请稍后重试", 503)
    const maxActive = Number(product.config.max_active_orders || 2)
    if ((count || 0) >= maxActive) {
      throw new VerificationRequestError("您有尚未完成的验证订单，请处理后再购买", 409, "MAX_ACTIVE_ORDERS")
    }

    let order: any
    const { data: existing } = await admin
      .from("verification_orders")
      .select("*")
      .eq("user_id", user.id)
      .eq("idempotency_key", idempotencyKey)
      .maybeSingle()

    if (existing) {
      if (existing.product_code !== productCode || existing.payment_status !== "pending") {
        throw new VerificationRequestError("这次支付请求已经使用，请刷新页面后重试", 409, "IDEMPOTENCY_CONFLICT")
      }
      order = existing
    } else {
      const paymentOrderNo = generateVerificationPaymentOrderNo()
      const maxNumbers = product.product_type === "us_short"
        ? Math.min(6, Math.max(1, Number(product.config.max_numbers || 6)))
        : 1
      const initialRemaining = product.product_type === "us_short" ? Math.max(0, maxNumbers - 1) : 0
      const { data: created, error } = await admin
        .from("verification_orders")
        .insert({
          payment_order_no: paymentOrderNo,
          idempotency_key: idempotencyKey,
          user_id: user.id,
          user_email: user.email || null,
          product_code: product.code,
          product_type: product.product_type,
          country_code: product.country_code,
          sale_price: product.sale_price,
          numbers_remaining: initialRemaining,
          metadata: {
            product_name: product.name,
            upstream_cost_estimate: product.upstream_cost_estimate,
            change_wait_seconds: Number(product.config.change_wait_seconds || 120),
            max_numbers: maxNumbers,
          },
        })
        .select("*")
        .single()
      if (error || !created) {
        throw new VerificationRequestError("订单创建失败，请稍后重试", 500, "CREATE_FAILED")
      }
      order = created
    }

    const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000").replace(/\/$/, "")
    const paymentParams = {
      outTradeNo: order.payment_order_no,
      totalAmount: Number(order.sale_price).toFixed(2),
      subject: product.name,
      body: `号码验证订单:${order.payment_order_no}`,
      returnUrl: `${baseUrl}/verification/orders/${order.id}/?payment=returned`,
      notifyUrl: `${baseUrl}/api/verification/payment/notify/`,
    }
    const userAgent = request.headers.get("user-agent") || ""
    const payUrl = isMobile(userAgent)
      ? await createMobilePayment(paymentParams)
      : await createPCPayment(paymentParams)

    return NextResponse.json({ success: true, payUrl, orderId: order.id })
  } catch (error) {
    const result = errorResponse(error)
    return NextResponse.json(result.body, { status: result.status })
  }
}
