import { NextRequest, NextResponse } from "next/server"
import { createRelogradeAdminClient } from "@/lib/relograde/db"
import { listOrders, findOrder, extractVoucher, type RelogradeOrder } from "@/lib/relograde/client"

export const dynamic = "force-dynamic"
export const maxDuration = 60

function adminToken(): string {
  return (process.env.RELOGRADE_RECOVER_TOKEN || "").trim()
}

/**
 * 补救接口：上游已经出码但本地没存下来时，按 reference 找回那一单并写回兑换码。
 * 只读上游、只写本地，不会创建新订单，也不会产生新的扣款。
 */
export async function POST(request: NextRequest) {
  const token = adminToken()
  if (!token) {
    return NextResponse.json({ error: "未配置 RELOGRADE_RECOVER_TOKEN" }, { status: 503 })
  }
  if (request.headers.get("x-recover-token") !== token) {
    return NextResponse.json({ error: "无权访问" }, { status: 403 })
  }

  const admin = createRelogradeAdminClient()
  if (!admin) {
    return NextResponse.json({ error: "服务暂不可用" }, { status: 503 })
  }

  let body: { orderId?: string; trx?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "请求体无效" }, { status: 400 })
  }

  const orderId = String(body.orderId || "").trim()
  if (!orderId) {
    return NextResponse.json({ error: "缺少 orderId" }, { status: 400 })
  }

  const { data: row } = await admin
    .from("voucher_orders")
    .select("order_id,status,relograde_trx,voucher_code,redemption_link")
    .eq("order_id", orderId)
    .maybeSingle()

  if (!row) {
    return NextResponse.json({ error: "本地找不到该订单" }, { status: 404 })
  }
  if (row.status === "delivered" && (row.voucher_code || row.redemption_link)) {
    return NextResponse.json({ success: true, message: "已经是已发货状态", order: row })
  }

  const localTrx = String(row.relograde_trx || "")
  const hintTrx = String(body.trx || "").trim()
  let upstream: RelogradeOrder | null = null

  const candidate = hintTrx || (localTrx && !localTrx.startsWith("claiming:") ? localTrx : "")
  if (candidate) {
    try {
      upstream = await findOrder(candidate)
    } catch {
      upstream = null
    }
  }

  // 本地没有可用单号时，按 reference 在上游最近的订单里找
  if (!upstream) {
    try {
      const page = await listOrders({ limit: 100, sortOrder: "desc" })
      const hit = (page.data || []).find((item) => item.reference === orderId)
      if (hit?.trx) upstream = await findOrder(hit.trx)
    } catch (error: any) {
      return NextResponse.json(
        { error: `上游查询失败: ${error?.message || "未知错误"}` },
        { status: 502 },
      )
    }
  }

  if (!upstream) {
    return NextResponse.json({ error: "上游找不到对应订单" }, { status: 404 })
  }
  if (upstream.orderStatus !== "finished") {
    return NextResponse.json(
      { error: `上游订单状态为 ${upstream.orderStatus}，暂时无法回捞` },
      { status: 409 },
    )
  }

  const voucher = extractVoucher(upstream)
  if (!voucher.voucherCode && !voucher.redemptionLink) {
    return NextResponse.json({ error: "上游订单已完成但没有返回兑换码" }, { status: 502 })
  }

  const { error: updateError } = await admin
    .from("voucher_orders")
    .update({
      status: "delivered",
      relograde_trx: upstream.trx,
      voucher_code: voucher.voucherCode,
      voucher_serial: voucher.voucherSerial,
      redemption_link: voucher.redemptionLink,
      voucher_expires_at: voucher.voucherExpiresAt,
      error_message: null,
      delivered_at: new Date().toISOString(),
    })
    .eq("order_id", orderId)

  if (updateError) {
    return NextResponse.json({ error: `写回失败: ${updateError.message}` }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    orderId,
    trx: upstream.trx,
    voucher: {
      hasCode: Boolean(voucher.voucherCode),
      redemptionLink: voucher.redemptionLink,
    },
  })
}
