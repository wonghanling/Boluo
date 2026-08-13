import { NextRequest, NextResponse } from "next/server"
import {
  appendVerificationAudit,
  createVerificationAdminClient,
  enforceVerificationRateLimit,
  errorResponse,
  generatePrivateCardCode,
  getVerificationProduct,
  publicVerificationOrder,
  requireVerificationUser,
  VerificationRequestError,
} from "@/lib/verification/server"
import { getUpstreamBalance, getUsNumber, UpstreamVerificationError } from "@/lib/verification/upstream"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest, context: { params: { orderId: string } }) {
  let claimedOrder: any = null
  try {
    const user = await requireVerificationUser(request)
    await enforceVerificationRateLimit(request, user.id, `start:${context.params.orderId}`, 4, 60)
    const admin = createVerificationAdminClient()
    const { data: order } = await admin
      .from("verification_orders")
      .select("*")
      .eq("id", context.params.orderId)
      .eq("user_id", user.id)
      .maybeSingle()

    if (!order) throw new VerificationRequestError("验证订单不存在", 404, "ORDER_NOT_FOUND")
    if (order.product_type !== "us_short") {
      throw new VerificationRequestError("该商品当前由管理员人工履约", 409, "MANUAL_FULFILLMENT")
    }
    if (order.payment_status !== "paid" || order.fulfillment_status !== "ready") {
      throw new VerificationRequestError("订单当前状态不能开始取号", 409, "INVALID_STATUS")
    }

    const product = await getVerificationProduct(order.product_code)
    if (!product.is_active || product.sales_paused) {
      throw new VerificationRequestError("取号功能已暂停，请稍后重试", 409, "SALES_PAUSED")
    }

    const cardCode = order.card_code || generatePrivateCardCode()
    const { data: claimed, error: claimError } = await admin
      .from("verification_orders")
      .update({
        fulfillment_status: "requesting_number",
        card_code: cardCode,
        error_code: null,
        error_message: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", order.id)
      .eq("user_id", user.id)
      .eq("payment_status", "paid")
      .eq("fulfillment_status", "ready")
      .select("*")
      .maybeSingle()
    if (claimError) throw claimError
    if (!claimed) throw new VerificationRequestError("取号请求正在处理中，请勿重复点击", 409, "ALREADY_PROCESSING")
    claimedOrder = claimed

    const balance = await getUpstreamBalance()
    const lowThreshold = Number(product.config.low_balance_threshold || 20)
    await admin.from("verification_balance_snapshots").insert({ balance, is_low: balance < lowThreshold })
    if (balance < 1.3) throw new UpstreamVerificationError("NO_BALANCE")

    const number = await getUsNumber(cardCode)
    const maxNumbers = Math.min(6, Math.max(1, Number(product.config.max_numbers || 6)))
    const ttlSeconds = Number(product.config.number_ttl_seconds || 1200)
    const now = new Date()
    const { data: updated, error: updateError } = await admin
      .from("verification_orders")
      .update({
        fulfillment_status: "waiting_code",
        upstream_order_id: number.upstreamOrderId,
        phone_number: number.phoneNumber,
        verification_code: null,
        numbers_used: 1,
        numbers_remaining: Math.max(0, maxNumbers - 1),
        upstream_cost: 1.3,
        number_received_at: now.toISOString(),
        expires_at: new Date(now.getTime() + ttlSeconds * 1000).toISOString(),
        last_polled_at: null,
        poll_count: 0,
        updated_at: now.toISOString(),
      })
      .eq("id", order.id)
      .eq("fulfillment_status", "requesting_number")
      .select("*")
      .single()
    if (updateError || !updated) {
      await admin
        .from("verification_orders")
        .update({
          fulfillment_status: "manual_review",
          upstream_order_id: number.upstreamOrderId,
          phone_number: number.phoneNumber,
          numbers_used: 1,
          numbers_remaining: Math.max(0, maxNumbers - 1),
          upstream_cost: 1.3,
          error_code: "NUMBER_RECEIVED_DB_FAILURE",
          error_message: "号码已分配，订单需要人工核对",
          updated_at: now.toISOString(),
        })
        .eq("id", order.id)
      throw new VerificationRequestError("号码已分配但订单保存异常，请联系客服处理", 500, "MANUAL_REVIEW")
    }
    await appendVerificationAudit({
      orderId: order.id,
      actorUserId: user.id,
      actorType: "user",
      action: "number_requested",
      fromStatus: "ready",
      toStatus: "waiting_code",
    })
    return NextResponse.json({ order: publicVerificationOrder(updated) })
  } catch (error) {
    if (claimedOrder && error instanceof UpstreamVerificationError) {
      const admin = createVerificationAdminClient()
      await admin
        .from("verification_orders")
        .update({
          fulfillment_status: "ready",
          error_code: error.code,
          error_message: error.message,
          updated_at: new Date().toISOString(),
        })
        .eq("id", claimedOrder.id)
        .eq("fulfillment_status", "requesting_number")
    }
    if (error instanceof UpstreamVerificationError) {
      return NextResponse.json({ error: error.message, code: "UPSTREAM_UNAVAILABLE" }, { status: 503 })
    }
    const result = errorResponse(error)
    return NextResponse.json(result.body, { status: result.status })
  }
}
