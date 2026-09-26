import { NextRequest, NextResponse } from "next/server"
import { queryPayment } from "@/lib/alipay"
import { createRelogradeAdminClient } from "@/lib/relograde/db"
import { fulfillRelogradeOrder } from "@/lib/relograde/fulfill"
import type { QuoteResult } from "@/lib/relograde/catalog"
import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"
export const maxDuration = 60

const PUBLIC_FIELDS =
  "order_id,status,face_value,face_value_currency,sell_cny,voucher_code,redemption_link,voucher_expires_at,error_message,delivered_at"

function isPaidTrade(result: any): boolean {
  const status = String(result?.tradeStatus || result?.trade_status || "")
  return status === "TRADE_SUCCESS" || status === "TRADE_FINISHED"
}

async function markPaidAndFulfill(orderId: string, tradeNo: string | null) {
  const admin = createRelogradeAdminClient()
  if (!admin) return

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (url && key) {
    const supabase = createClient(url, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
    await supabase
      .from("orders")
      .update({
        payment_status: "paid",
        trade_order_id: tradeNo,
        paid_at: new Date().toISOString(),
      })
      .eq("order_id", orderId)
      .neq("payment_status", "paid")
  }

  const { data } = await admin
    .from("voucher_orders")
    .select("*")
    .eq("order_id", orderId)
    .maybeSingle()

  if (!data || data.status === "delivered" || data.status === "fulfilling") return

  await admin
    .from("voucher_orders")
    .update({
      status: "paid",
      paid_at: data.paid_at || new Date().toISOString(),
    })
    .eq("order_id", orderId)

  const snapshot = (data.quote_snapshot || {}) as QuoteResult
  if (!snapshot.productSlug) return

  await fulfillRelogradeOrder({
    orderId,
    quote: snapshot,
  })
}

export async function GET(request: NextRequest) {
  const orderId = request.nextUrl.searchParams.get("orderId")
  if (!orderId) {
    return NextResponse.json({ error: "缺少订单号" }, { status: 400 })
  }

  const admin = createRelogradeAdminClient()
  if (!admin) {
    return NextResponse.json({ error: "服务暂不可用" }, { status: 503 })
  }

  const { data, error } = await admin
    .from("voucher_orders")
    .select(PUBLIC_FIELDS)
    .eq("order_id", orderId)
    .maybeSingle()

  if (error || !data) {
    return NextResponse.json({ error: "订单不存在" }, { status: 404 })
  }

  if (data.status === "pending_payment") {
    try {
      const payment = await queryPayment(orderId)
      if (isPaidTrade(payment)) {
        const tradeNo = String(payment?.tradeNo || payment?.trade_no || "") || null
        await markPaidAndFulfill(orderId, tradeNo)
        const { data: refreshed } = await admin
          .from("voucher_orders")
          .select(PUBLIC_FIELDS)
          .eq("order_id", orderId)
          .maybeSingle()
        if (refreshed) {
          return NextResponse.json({ success: true, order: refreshed })
        }
      }
    } catch (queryError) {
      console.error("主动查询支付宝失败:", queryError)
    }
  }

  return NextResponse.json({
    success: true,
    order: data,
  })
}
