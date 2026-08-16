import { NextRequest, NextResponse } from "next/server"
import { queryPayment } from "@/lib/alipay"
import {
  createVerificationAdminClient,
  enforceVerificationRateLimit,
  errorResponse,
  publicVerificationOrder,
  requireVerificationUser,
  VerificationRequestError,
} from "@/lib/verification/server"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest, context: { params: { orderId: string } }) {
  try {
    const user = await requireVerificationUser(request)
    const admin = createVerificationAdminClient()
    const { data, error } = await admin
      .from("verification_orders")
      .select("*")
      .eq("id", context.params.orderId)
      .eq("user_id", user.id)
      .maybeSingle()
    if (error) throw error
    if (!data) throw new VerificationRequestError("验证订单不存在", 404, "ORDER_NOT_FOUND")
    return NextResponse.json({ order: publicVerificationOrder(data) })
  } catch (error) {
    const result = errorResponse(error)
    return NextResponse.json(result.body, { status: result.status })
  }
}

function readAlipayField(result: Record<string, unknown>, camelCase: string, snakeCase: string): string {
  const value = result[camelCase] ?? result[snakeCase]
  return typeof value === "string" || typeof value === "number" ? String(value) : ""
}

export async function POST(request: NextRequest, context: { params: { orderId: string } }) {
  try {
    const user = await requireVerificationUser(request)
    await enforceVerificationRateLimit(request, user.id, `payment-status:${context.params.orderId}`, 15, 60)

    const admin = createVerificationAdminClient()
    const { data: order, error } = await admin
      .from("verification_orders")
      .select("*")
      .eq("id", context.params.orderId)
      .eq("user_id", user.id)
      .maybeSingle()

    if (error) throw error
    if (!order) throw new VerificationRequestError("验证订单不存在", 404, "ORDER_NOT_FOUND")

    if (order.payment_status !== "pending" || order.fulfillment_status !== "awaiting_payment") {
      return NextResponse.json({ order: publicVerificationOrder(order) })
    }

    const queryResult = await queryPayment(order.payment_order_no) as Record<string, unknown>
    const responseCode = readAlipayField(queryResult, "code", "code")
    const subCode = readAlipayField(queryResult, "subCode", "sub_code")

    // 尚未产生支付宝交易时保持待支付，页面继续安全轮询。
    if (responseCode === "40004" || subCode === "ACQ.TRADE_NOT_EXIST") {
      return NextResponse.json({ order: publicVerificationOrder(order) })
    }
    if (responseCode !== "10000") {
      throw new VerificationRequestError("支付宝付款状态暂时无法确认，请稍后自动重试", 503, "PAYMENT_QUERY_UNAVAILABLE")
    }

    const tradeStatus = readAlipayField(queryResult, "tradeStatus", "trade_status")
    if (tradeStatus !== "TRADE_SUCCESS" && tradeStatus !== "TRADE_FINISHED") {
      return NextResponse.json({ order: publicVerificationOrder(order) })
    }

    const queriedOrderNo = readAlipayField(queryResult, "outTradeNo", "out_trade_no")
    const tradeNo = readAlipayField(queryResult, "tradeNo", "trade_no")
    const paidAmountText = readAlipayField(queryResult, "totalAmount", "total_amount")
    const paidAmount = Number(paidAmountText)
    const expectedAmount = Number(order.sale_price)
    const queriedSellerId = readAlipayField(queryResult, "sellerId", "seller_id")
    const configuredSellerId = process.env.ALIPAY_SELLER_ID?.trim()

    if (
      queriedOrderNo !== order.payment_order_no
      || !tradeNo
      || !Number.isFinite(paidAmount)
      || !Number.isFinite(expectedAmount)
      || Math.round(paidAmount * 100) !== Math.round(expectedAmount * 100)
      || (configuredSellerId && !configuredSellerId.includes("@") && queriedSellerId !== configuredSellerId)
    ) {
      throw new VerificationRequestError("支付宝付款信息校验失败，请联系客服处理", 409, "PAYMENT_MISMATCH")
    }

    const { data: marked, error: markError } = await admin.rpc("mark_verification_payment_paid", {
      p_payment_order_no: order.payment_order_no,
      p_trade_no: tradeNo,
      p_paid_amount: paidAmount.toFixed(2),
    })
    if (markError || !marked?.ok) {
      throw new VerificationRequestError("付款已确认，订单状态更新失败，系统将自动重试", 503, "PAYMENT_UPDATE_FAILED")
    }

    const { data: updatedOrder, error: updatedError } = await admin
      .from("verification_orders")
      .select("*")
      .eq("id", order.id)
      .eq("user_id", user.id)
      .single()
    if (updatedError) throw updatedError

    return NextResponse.json({ order: publicVerificationOrder(updatedOrder) })
  } catch (error) {
    const result = errorResponse(error)
    return NextResponse.json(result.body, { status: result.status })
  }
}
