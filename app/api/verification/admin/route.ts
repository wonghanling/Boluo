import { NextRequest, NextResponse } from "next/server"
import {
  createVerificationAdminClient,
  errorResponse,
  requireVerificationAdmin,
} from "@/lib/verification/server"
import { getUpstreamBalance } from "@/lib/verification/upstream"
import { setUpstreamStatus } from "@/lib/verification/upstream"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    await requireVerificationAdmin(request)
    const admin = createVerificationAdminClient()
    const [{ data: products, error: productError }, { data: orders, error: orderError }, { data: renewals, error: renewalError }] =
      await Promise.all([
        admin.from("verification_products").select("*").order("sale_price"),
        admin.from("verification_orders").select("id,payment_order_no,user_id,user_email,product_code,product_type,payment_status,fulfillment_status,country_code,phone_number,verification_code,numbers_used,numbers_remaining,sale_price,upstream_cost,refund_status,expires_at,renewed_until,error_message,created_at,paid_at,number_received_at,code_received_at,completed_at,cancelled_at,updated_at").order("created_at", { ascending: false }).limit(200),
        admin.from("verification_renewals").select("*").order("created_at", { ascending: false }).limit(100),
      ])
    if (productError || orderError || renewalError) throw new Error("管理数据读取失败")

    let balance: number | null = null
    let balanceError: string | null = null
    try {
      balance = await getUpstreamBalance()
      const threshold = Number(products?.find((item) => item.code === "US_SHORT")?.config?.low_balance_threshold || 20)
      await admin.from("verification_balance_snapshots").insert({ balance, is_low: balance < threshold })
    } catch {
      balanceError = "上游余额暂时无法读取"
    }

    const stats = (orders || []).reduce(
      (result, order) => {
        result.sales += Number(order.sale_price || 0)
        result.cost += Number(order.upstream_cost || 0)
        result.total += 1
        if (["ready", "requesting_number", "waiting_code", "changing_number"].includes(order.fulfillment_status)) result.active += 1
        if (order.fulfillment_status === "code_received") result.codeReceived += 1
        if (["manual_review", "refund_pending"].includes(order.fulfillment_status)) result.review += 1
        return result
      },
      { total: 0, active: 0, codeReceived: 0, review: 0, sales: 0, cost: 0 },
    )
    return NextResponse.json({ products, orders, renewals, balance, balanceError, stats: { ...stats, profit: stats.sales - stats.cost } })
  } catch (error) {
    const result = errorResponse(error)
    return NextResponse.json(result.body, { status: result.status })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await requireVerificationAdmin(request)
    const body = await request.json()
    const admin = createVerificationAdminClient()

    if (body.type === "product") {
      const salePrice = Number(body.salePrice)
      const isActive = body.isActive
      const salesPaused = body.salesPaused
      if (
        !body.code ||
        !Number.isFinite(salePrice) ||
        salePrice < 0 ||
        typeof isActive !== "boolean" ||
        typeof salesPaused !== "boolean"
      ) {
        return NextResponse.json({ error: "商品配置参数不正确" }, { status: 400 })
      }
      const { data, error } = await admin
        .from("verification_products")
        .update({
          sale_price: salePrice,
          is_active: isActive,
          sales_paused: salesPaused,
          updated_at: new Date().toISOString(),
        })
        .eq("code", body.code)
        .select("*")
        .single()
      if (error) throw error
      return NextResponse.json(
        { product: data },
        { headers: { "Cache-Control": "no-store" } },
      )
    }

    if (body.type === "order") {
      const orderId = String(body.orderId || "")
      const action = String(body.action || "")
      const { data: order, error: orderError } = await admin
        .from("verification_orders")
        .select("*")
        .eq("id", orderId)
        .maybeSingle()
      if (orderError || !order) return NextResponse.json({ error: "验证订单不存在" }, { status: 404 })

      const terminal = ["completed", "cancelled", "refunded", "expired"]
      if (action === "complete") {
        if (terminal.includes(order.fulfillment_status)) {
          return NextResponse.json({ error: "订单已经是终态" }, { status: 409 })
        }
        if (order.upstream_order_id) await setUpstreamStatus(order.upstream_order_id, 6)
        const now = new Date().toISOString()
        const { data: updated, error } = await admin
          .from("verification_orders")
          .update({ fulfillment_status: "completed", completed_at: now, updated_at: now })
          .eq("id", order.id)
          .eq("fulfillment_status", order.fulfillment_status)
          .select("id,fulfillment_status")
          .maybeSingle()
        if (error || !updated) return NextResponse.json({ error: "订单状态已变化，请刷新后重试" }, { status: 409 })
        await admin.from("verification_audit_logs").insert({
          verification_order_id: order.id,
          actor_user_id: user.id,
          actor_type: "admin",
          action: "manually_completed",
          from_status: order.fulfillment_status,
          to_status: "completed",
        })
        return NextResponse.json({ success: true, order: updated })
      }

      if (action === "cancel") {
        if (terminal.includes(order.fulfillment_status)) {
          return NextResponse.json({ error: "订单已经是终态" }, { status: 409 })
        }
        if (order.upstream_order_id) await setUpstreamStatus(order.upstream_order_id, 8)
        const now = new Date().toISOString()
        const { data: updated, error } = await admin
          .from("verification_orders")
          .update({
            payment_status: order.payment_status === "paid" ? "refund_pending" : order.payment_status,
            fulfillment_status: order.payment_status === "paid" ? "refund_pending" : "cancelled",
            refund_status: order.payment_status === "paid" ? "refund_pending" : "none",
            phone_number: null,
            verification_code: null,
            cancelled_at: now,
            updated_at: now,
          })
          .eq("id", order.id)
          .eq("fulfillment_status", order.fulfillment_status)
          .select("id,fulfillment_status,refund_status")
          .maybeSingle()
        if (error || !updated) return NextResponse.json({ error: "订单状态已变化，请刷新后重试" }, { status: 409 })
        await admin.from("verification_audit_logs").insert({
          verification_order_id: order.id,
          actor_user_id: user.id,
          actor_type: "admin",
          action: "manually_cancelled",
          from_status: order.fulfillment_status,
          to_status: updated.fulfillment_status,
        })
        return NextResponse.json({ success: true, order: updated })
      }

      if (action === "refunded") {
        if (order.fulfillment_status !== "refund_pending" || order.refund_status !== "refund_pending") {
          return NextResponse.json({ error: "订单当前不在客户退款待审核状态" }, { status: 409 })
        }
        const { data: updated, error } = await admin
          .from("verification_orders")
          .update({ payment_status: "refunded", fulfillment_status: "refunded", refund_status: "refunded", updated_at: new Date().toISOString() })
          .eq("id", order.id)
          .eq("fulfillment_status", "refund_pending")
          .select("id,fulfillment_status,refund_status")
          .maybeSingle()
        if (error || !updated) return NextResponse.json({ error: "退款状态已变化，请刷新后重试" }, { status: 409 })
        await admin.from("verification_audit_logs").insert({
          verification_order_id: order.id,
          actor_user_id: user.id,
          actor_type: "admin",
          action: "customer_refund_confirmed",
          from_status: "refund_pending",
          to_status: "refunded",
        })
        return NextResponse.json({ success: true, order: updated })
      }

      return NextResponse.json({ error: "不支持的订单操作" }, { status: 400 })
    }

    if (body.type === "renewal") {
      if (!body.renewalId || !body.periodEnd) {
        return NextResponse.json({ error: "续租结果不完整" }, { status: 400 })
      }
      const { data: renewal, error } = await admin
        .from("verification_renewals")
        .update({
          status: "completed",
          period_end: body.periodEnd,
          upstream_reference: body.upstreamReference || null,
          admin_notes: body.adminNotes || null,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", body.renewalId)
        .eq("status", "manual_review")
        .select("*")
        .single()
      if (error || !renewal) return NextResponse.json({ error: "续租记录状态已变化" }, { status: 409 })
      await admin
        .from("verification_orders")
        .update({ renewed_until: body.periodEnd, updated_at: new Date().toISOString() })
        .eq("id", renewal.verification_order_id)
        .eq("user_id", renewal.user_id)
      await admin.from("verification_audit_logs").insert({
        verification_order_id: renewal.verification_order_id,
        actor_user_id: user.id,
        actor_type: "admin",
        action: "renewal_completed_manually",
        details: { renewal_id: renewal.id, period_end: body.periodEnd },
      })
      return NextResponse.json({ renewal })
    }

    return NextResponse.json({ error: "不支持的管理操作" }, { status: 400 })
  } catch (error) {
    const result = errorResponse(error)
    return NextResponse.json(result.body, { status: result.status })
  }
}
