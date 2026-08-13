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
import { setUpstreamStatus, UpstreamVerificationError } from "@/lib/verification/upstream"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest, context: { params: { orderId: string } }) {
  let claimedOrder: any = null
  try {
    const user = await requireVerificationUser(request)
    await enforceVerificationRateLimit(request, user.id, `cancel:${context.params.orderId}`, 3, 60)
    const admin = createVerificationAdminClient()
    const { data: order } = await admin
      .from("verification_orders")
      .select("*")
      .eq("id", context.params.orderId)
      .eq("user_id", user.id)
      .maybeSingle()

    if (!order) throw new VerificationRequestError("验证订单不存在", 404, "ORDER_NOT_FOUND")
    if (!['waiting_code', 'change_available'].includes(order.fulfillment_status)) {
      throw new VerificationRequestError("订单当前状态不能取消", 409, "INVALID_STATUS")
    }
    if (order.fulfillment_status === "waiting_code") {
      const product = await getVerificationProduct(order.product_code)
      const waitSeconds = Number(order.metadata?.change_wait_seconds || product.config.change_wait_seconds || 120)
      const receivedAt = order.number_received_at ? new Date(order.number_received_at).getTime() : Date.now()
      const availableAt = receivedAt + waitSeconds * 1000
      if (Date.now() < availableAt) {
        const seconds = Math.max(1, Math.ceil((availableAt - Date.now()) / 1000))
        throw new VerificationRequestError(`请再等待 ${seconds} 秒后取消`, 409, "CANCEL_TOO_EARLY")
      }
    }
    const previousStatus = order.fulfillment_status
    const { data: claimed } = await admin
      .from("verification_orders")
      .update({ fulfillment_status: "cancel_pending", updated_at: new Date().toISOString() })
      .eq("id", order.id)
      .eq("user_id", user.id)
      .eq("fulfillment_status", previousStatus)
      .select("*")
      .maybeSingle()
    if (!claimed) throw new VerificationRequestError("取消请求正在处理中，请勿重复点击", 409, "ALREADY_PROCESSING")
    claimedOrder = claimed

    if (order.upstream_order_id) await setUpstreamStatus(order.upstream_order_id, 8)
    const now = new Date().toISOString()
    const { data: updated, error } = await admin
      .from("verification_orders")
      .update({
        payment_status: "refund_pending",
        fulfillment_status: "refund_pending",
        refund_status: "refund_pending",
        phone_number: null,
        verification_code: null,
        expires_at: null,
        cancelled_at: now,
        updated_at: now,
      })
      .eq("id", order.id)
      .eq("fulfillment_status", "cancel_pending")
      .select("*")
      .single()
    if (error || !updated) {
      await admin
        .from("verification_orders")
        .update({
          fulfillment_status: "manual_review",
          error_code: "UPSTREAM_CANCELLED_DB_FAILURE",
          error_message: "上游已取消，本站订单需要人工核对",
          updated_at: new Date().toISOString(),
        })
        .eq("id", order.id)
        .eq("fulfillment_status", "cancel_pending")
      throw new VerificationRequestError("上游已取消，订单已转人工核对，请勿重复操作", 500, "MANUAL_REVIEW")
    }
    await appendVerificationAudit({
      orderId: order.id,
      actorUserId: user.id,
      actorType: "user",
      action: "cancelled_refund_pending",
      fromStatus: previousStatus,
      toStatus: "refund_pending",
    })
    return NextResponse.json({ order: publicVerificationOrder(updated) })
  } catch (error) {
    if (claimedOrder && error instanceof UpstreamVerificationError) {
      const admin = createVerificationAdminClient()
      await admin
        .from("verification_orders")
        .update({
          fulfillment_status: claimedOrder.upstream_order_id ? "waiting_code" : "change_available",
          error_code: error.code,
          error_message: error.message,
          updated_at: new Date().toISOString(),
        })
        .eq("id", claimedOrder.id)
        .eq("fulfillment_status", "cancel_pending")
    }
    if (error instanceof UpstreamVerificationError) {
      return NextResponse.json({ error: error.message, code: "UPSTREAM_UNAVAILABLE" }, { status: 503 })
    }
    const result = errorResponse(error)
    return NextResponse.json(result.body, { status: result.status })
  }
}
