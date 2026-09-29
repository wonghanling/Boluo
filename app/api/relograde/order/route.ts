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
      global: {
        fetch: (input, init) =>
          fetch(input as RequestInfo | URL, { ...(init || {}), cache: "no-store" }),
      },
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

  if (!data || data.status === "delivered") return

  const snapshot = (data.quote_snapshot || {}) as QuoteResult
  if (!snapshot.productSlug) return

  const trx = String(data.relograde_trx || "")
  const isSentinel = trx.startsWith("claiming:")

  // 已经有真实上游单号：只去回捞那一单的兑换码，绝不会再下单（fulfill 内部走 recovery 分支）
  if (trx && !isSentinel) {
    await fulfillRelogradeOrder({ orderId, quote: snapshot })
    return
  }

  // 哨兵还在，说明另一个请求正在下单，直接退出，等它写回真实单号
  if (isSentinel) return

  // 走到这里 relograde_trx 为空，说明还没下过单
  if (data.status === "fulfilling") return

  // 只有仍处于待支付时才标记为已支付，避免把 fulfilling 锁覆盖掉造成重复下单
  const { data: marked } = await admin
    .from("voucher_orders")
    .update({
      status: "paid",
      paid_at: data.paid_at || new Date().toISOString(),
    })
    .eq("order_id", orderId)
    .eq("status", "pending_payment")
    .select("id")
    .maybeSingle()

  if (!marked && data.status !== "paid") return

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

  if (data.status === "pending_payment" || data.status === "paid") {
    try {
      const payment =
        data.status === "paid" ? { tradeStatus: "TRADE_SUCCESS" } : await queryPayment(orderId)
      if (isPaidTrade(payment) || data.status === "paid") {
        const tradeNo = String(
          (payment as { tradeNo?: string; trade_no?: string }).tradeNo
            || (payment as { trade_no?: string }).trade_no
            || "",
        ) || null
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
