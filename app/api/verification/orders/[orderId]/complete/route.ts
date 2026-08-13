import { NextRequest, NextResponse } from "next/server"
import {
  appendVerificationAudit,
  createVerificationAdminClient,
  enforceVerificationRateLimit,
  errorResponse,
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
    await enforceVerificationRateLimit(request, user.id, `complete:${context.params.orderId}`, 3, 60)
    const admin = createVerificationAdminClient()
    const { data: order } = await admin
      .from("verification_orders")
      .select("*")
      .eq("id", context.params.orderId)
      .eq("user_id", user.id)
      .maybeSingle()

    if (!order) throw new VerificationRequestError("验证订单不存在", 404, "ORDER_NOT_FOUND")
    if (order.fulfillment_status !== "code_received" || !order.upstream_order_id) {
      throw new VerificationRequestError("收到验证码后才能完成订单", 409, "INVALID_STATUS")
    }
    const { data: claimed } = await admin
      .from("verification_orders")
      .update({ fulfillment_status: "manual_review", updated_at: new Date().toISOString() })
      .eq("id", order.id)
      .eq("user_id", user.id)
      .eq("fulfillment_status", "code_received")
      .select("*")
      .maybeSingle()
    if (!claimed) throw new VerificationRequestError("完成请求正在处理中，请勿重复点击", 409, "ALREADY_PROCESSING")
    claimedOrder = claimed

    await setUpstreamStatus(order.upstream_order_id, 6)
    const now = new Date().toISOString()
    const { data: updated, error } = await admin
      .from("verification_orders")
      .update({ fulfillment_status: "completed", completed_at: now, updated_at: now })
      .eq("id", order.id)
      .eq("fulfillment_status", "manual_review")
      .select("*")
      .single()
    if (error || !updated) throw new VerificationRequestError("完成结果保存失败，请联系客服", 500)
    await appendVerificationAudit({
      orderId: order.id,
      actorUserId: user.id,
      actorType: "user",
      action: "completed",
      fromStatus: "code_received",
      toStatus: "completed",
    })
    return NextResponse.json({ order: publicVerificationOrder(updated) })
  } catch (error) {
    if (claimedOrder && error instanceof UpstreamVerificationError) {
      const admin = createVerificationAdminClient()
      await admin
        .from("verification_orders")
        .update({
          fulfillment_status: "code_received",
          error_code: error.code,
          error_message: error.message,
          updated_at: new Date().toISOString(),
        })
        .eq("id", claimedOrder.id)
        .eq("fulfillment_status", "manual_review")
    }
    if (error instanceof UpstreamVerificationError) {
      return NextResponse.json({ error: error.message, code: "UPSTREAM_UNAVAILABLE" }, { status: 503 })
    }
    const result = errorResponse(error)
    return NextResponse.json(result.body, { status: result.status })
  }
}
