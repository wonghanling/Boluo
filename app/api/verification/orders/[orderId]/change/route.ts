import { NextRequest, NextResponse } from "next/server"
import {
  appendVerificationAudit,
  createVerificationAdminClient,
  enforceVerificationRateLimit,
  errorResponse,
  getVerificationProduct,
  publicVerificationOrder,
  requireVerificationUser,
  VerificationRequestError,
} from "@/lib/verification/server"
import { getCardUsage, getUsNumber, setUpstreamStatus, UpstreamVerificationError } from "@/lib/verification/upstream"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest, context: { params: { orderId: string } }) {
  let claimedOrder: any = null
  let oldNumberCancelled = false
  let restoreStatus: "waiting_code" | "change_available" = "waiting_code"
  try {
    const user = await requireVerificationUser(request)
    await enforceVerificationRateLimit(request, user.id, `change:${context.params.orderId}`, 3, 60)
    const admin = createVerificationAdminClient()
    const { data: order } = await admin
      .from("verification_orders")
      .select("*")
      .eq("id", context.params.orderId)
      .eq("user_id", user.id)
      .maybeSingle()

    if (!order) throw new VerificationRequestError("验证订单不存在", 404, "ORDER_NOT_FOUND")
    if (order.product_type !== "us_short" || !order.card_code) {
      throw new VerificationRequestError("该订单不支持自助换号", 409, "CHANGE_NOT_SUPPORTED")
    }
    if (!['waiting_code', 'change_available'].includes(order.fulfillment_status)) {
      throw new VerificationRequestError("订单当前状态不能换号", 409, "INVALID_STATUS")
    }
    if (order.numbers_remaining <= 0) {
      throw new VerificationRequestError("该套餐的换号次数已用完", 409, "NO_CHANGES_LEFT")
    }

    const product = await getVerificationProduct(order.product_code)
    if (!product.is_active || product.sales_paused) {
      throw new VerificationRequestError("换号功能已暂停，请稍后重试", 409, "SALES_PAUSED")
    }
    if (order.fulfillment_status === 'waiting_code') {
      const waitSeconds = Number(order.metadata?.change_wait_seconds || product.config.change_wait_seconds || 120)
      const receivedAt = order.number_received_at ? new Date(order.number_received_at).getTime() : Date.now()
      const availableAt = receivedAt + waitSeconds * 1000
      if (Date.now() < availableAt) {
        const seconds = Math.max(1, Math.ceil((availableAt - Date.now()) / 1000))
        throw new VerificationRequestError(`请再等待 ${seconds} 秒后换号`, 409, "CHANGE_TOO_EARLY")
      }
    }
    const usage = await getCardUsage(order.card_code)
    if (Number(order.numbers_remaining) <= 0 || usage.remaining <= 0) {
      throw new VerificationRequestError("该套餐的上游换号额度已用完", 409, "NO_CHANGES_LEFT")
    }

    const previousStatus = order.fulfillment_status
    restoreStatus = previousStatus as "waiting_code" | "change_available"
    const { data: claimed, error: claimError } = await admin
      .from("verification_orders")
      .update({ fulfillment_status: "changing_number", updated_at: new Date().toISOString() })
      .eq("id", order.id)
      .eq("user_id", user.id)
      .eq("fulfillment_status", previousStatus)
      .select("*")
      .maybeSingle()
    if (claimError) throw claimError
    if (!claimed) throw new VerificationRequestError("换号请求正在处理中，请勿重复点击", 409, "ALREADY_PROCESSING")
    claimedOrder = claimed

    if (previousStatus === "waiting_code" && order.upstream_order_id) {
      await setUpstreamStatus(order.upstream_order_id, 8)
      oldNumberCancelled = true
      const { data: changeAvailable, error: cancelSaveError } = await admin
        .from("verification_orders")
        .update({
          fulfillment_status: "change_available",
          upstream_order_id: null,
          phone_number: null,
          expires_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", order.id)
        .eq("fulfillment_status", "changing_number")
        .select("id")
        .maybeSingle()
      if (cancelSaveError || !changeAvailable) {
        await admin.from("verification_orders").update({
          fulfillment_status: "manual_review",
          error_code: "UPSTREAM_CANCELLED_DB_FAILURE",
          error_message: "旧号码已取消，订单需要人工核对",
          updated_at: new Date().toISOString(),
        }).eq("id", order.id).eq("fulfillment_status", "changing_number")
        throw new VerificationRequestError("旧号码已取消，订单已转人工核对", 500, "MANUAL_REVIEW")
      }
    }

    const number = await getUsNumber(order.card_code)
    const maxNumbers = Math.min(6, Math.max(1, Number(product.config.max_numbers || 6)))
    const nextNumbersUsed = Math.min(maxNumbers, Math.max(Number(order.numbers_used) + 1, usage.totalUsed + 1))
    const nextNumbersRemaining = Math.max(
      0,
      Math.min(maxNumbers - nextNumbersUsed, Number(order.numbers_remaining) - 1, usage.remaining - 1),
    )
    const ttlSeconds = Number(product.config.number_ttl_seconds || 1200)
    const now = new Date()
    const { data: updated, error } = await admin
      .from("verification_orders")
      .update({
        fulfillment_status: "waiting_code",
        upstream_order_id: number.upstreamOrderId,
        phone_number: number.phoneNumber,
        verification_code: null,
        numbers_used: nextNumbersUsed,
        numbers_remaining: nextNumbersRemaining,
        upstream_cost: Number(order.upstream_cost) + 1.3,
        number_received_at: now.toISOString(),
        expires_at: new Date(now.getTime() + ttlSeconds * 1000).toISOString(),
        last_polled_at: null,
        poll_count: 0,
        error_code: null,
        error_message: null,
        updated_at: now.toISOString(),
      })
      .eq("id", order.id)
      .eq("fulfillment_status", oldNumberCancelled ? "change_available" : "changing_number")
      .select("*")
      .single()
    if (error || !updated) {
      await admin
        .from("verification_orders")
        .update({
          fulfillment_status: "manual_review",
          upstream_order_id: number.upstreamOrderId,
          phone_number: number.phoneNumber,
          numbers_used: nextNumbersUsed,
          numbers_remaining: nextNumbersRemaining,
          upstream_cost: Number(order.upstream_cost) + 1.3,
          error_code: "NUMBER_RECEIVED_DB_FAILURE",
          error_message: "新号码已分配，订单需要人工核对",
          updated_at: now.toISOString(),
        })
        .eq("id", order.id)
      throw new VerificationRequestError("新号码已分配但订单保存异常，请联系客服处理", 500, "MANUAL_REVIEW")
    }
    await appendVerificationAudit({
      orderId: order.id,
      actorUserId: user.id,
      actorType: "user",
      action: "number_changed",
      fromStatus: previousStatus,
      toStatus: "waiting_code",
      details: { numbers_used: updated.numbers_used },
    })
    return NextResponse.json({ order: publicVerificationOrder(updated) })
  } catch (error) {
    if (claimedOrder && error instanceof UpstreamVerificationError) {
      const admin = createVerificationAdminClient()
      await admin
        .from("verification_orders")
        .update({
          fulfillment_status: oldNumberCancelled ? "change_available" : restoreStatus,
          upstream_order_id: oldNumberCancelled ? null : claimedOrder.upstream_order_id,
          phone_number: oldNumberCancelled ? null : claimedOrder.phone_number,
          error_code: error.code,
          error_message: error.message,
          updated_at: new Date().toISOString(),
        })
        .eq("id", claimedOrder.id)
        .eq("fulfillment_status", oldNumberCancelled ? "change_available" : "changing_number")
    }
    if (error instanceof UpstreamVerificationError) {
      return NextResponse.json({ error: error.message, code: "UPSTREAM_UNAVAILABLE" }, { status: 503 })
    }
    const result = errorResponse(error)
    return NextResponse.json(result.body, { status: result.status })
  }
}
