import { NextRequest, NextResponse } from "next/server"
import {
  appendVerificationAudit,
  createVerificationAdminClient,
  errorResponse,
  publicVerificationOrder,
  requireVerificationUser,
  VerificationRequestError,
} from "@/lib/verification/server"
import { getVerificationStatus, setUpstreamStatus, UpstreamVerificationError } from "@/lib/verification/upstream"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest, context: { params: { orderId: string } }) {
  try {
    const user = await requireVerificationUser(request)
    const admin = createVerificationAdminClient()
    const { data: order } = await admin
      .from("verification_orders")
      .select("*")
      .eq("id", context.params.orderId)
      .eq("user_id", user.id)
      .maybeSingle()
    if (!order) throw new VerificationRequestError("验证订单不存在", 404, "ORDER_NOT_FOUND")
    if (order.fulfillment_status !== "waiting_code" || !order.upstream_order_id) {
      return NextResponse.json({ order: publicVerificationOrder(order) })
    }
    if (order.expires_at && new Date(order.expires_at).getTime() <= Date.now()) {
      const { data: claimedExpiry } = await admin
        .from("verification_orders")
        .update({ fulfillment_status: "cancel_pending", updated_at: new Date().toISOString() })
        .eq("id", order.id)
        .eq("user_id", user.id)
        .eq("fulfillment_status", "waiting_code")
        .select("*")
        .maybeSingle()
      if (!claimedExpiry) {
        const { data: current } = await admin
          .from("verification_orders")
          .select("*")
          .eq("id", order.id)
          .eq("user_id", user.id)
          .single()
        return NextResponse.json({ order: publicVerificationOrder(current || order) })
      }
      try {
        await setUpstreamStatus(order.upstream_order_id, 8)
      } catch (error) {
        await admin.from("verification_orders").update({
          fulfillment_status: "waiting_code",
          error_code: error instanceof UpstreamVerificationError ? error.code : "EXPIRY_CANCEL_FAILED",
          error_message: "号码已到期，系统稍后会重试取消",
          updated_at: new Date().toISOString(),
        }).eq("id", order.id).eq("fulfillment_status", "cancel_pending")
        throw error
      }
      const now = new Date().toISOString()
      const { data: expiredOrder, error: expirySaveError } = await admin
        .from("verification_orders")
        .update({
          payment_status: "refund_pending",
          fulfillment_status: "refund_pending",
          refund_status: "refund_pending",
          phone_number: null,
          verification_code: null,
          cancelled_at: now,
          updated_at: now,
        })
        .eq("id", order.id)
        .eq("fulfillment_status", "cancel_pending")
        .select("*")
        .single()
      if (expirySaveError || !expiredOrder) {
        await admin.from("verification_orders").update({ fulfillment_status: "manual_review" }).eq("id", order.id)
        throw new VerificationRequestError("号码已到期并取消，订单已转人工审核", 500, "MANUAL_REVIEW")
      }
      return NextResponse.json({ order: publicVerificationOrder(expiredOrder) })
    }

    const { data: claimed, error: claimError } = await admin.rpc("claim_verification_poll", {
      p_order_id: order.id,
      p_user_id: user.id,
      p_min_interval_seconds: 5,
    })
    if (claimError) throw new VerificationRequestError("验证码查询暂时不可用", 503)
    if (!claimed) return NextResponse.json({ order: publicVerificationOrder(order), throttled: true })

    const result = await getVerificationStatus(order.upstream_order_id)
    if (result.state === "waiting") {
      return NextResponse.json({ order: publicVerificationOrder(order) })
    }

    const now = new Date().toISOString()
    const { data: updated, error } = await admin
      .from("verification_orders")
      .update({
        verification_code: result.code,
        fulfillment_status: "code_received",
        code_received_at: now,
        updated_at: now,
      })
      .eq("id", order.id)
      .eq("fulfillment_status", "waiting_code")
      .select("*")
      .single()
    if (error || !updated) throw new VerificationRequestError("验证码保存失败，请刷新订单", 500)
    await appendVerificationAudit({
      orderId: order.id,
      actorType: "upstream",
      action: "code_received",
      fromStatus: "waiting_code",
      toStatus: "code_received",
    })
    return NextResponse.json({ order: publicVerificationOrder(updated) })
  } catch (error) {
    if (error instanceof UpstreamVerificationError) {
      const status = error.code === "EARLY_RATE_LIMIT" ? 429 : 503
      return NextResponse.json({ error: error.message, code: "UPSTREAM_UNAVAILABLE" }, { status })
    }
    const result = errorResponse(error)
    return NextResponse.json(result.body, { status: result.status })
  }
}
