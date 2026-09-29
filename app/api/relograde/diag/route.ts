import { NextRequest, NextResponse } from "next/server"
import { queryPayment } from "@/lib/alipay"
import { createRelogradeAdminClient } from "@/lib/relograde/db"

export const dynamic = "force-dynamic"

/**
 * 只读诊断：看一笔订单在本地的真实状态，以及支付宝查单返回什么。
 * 不写任何数据，不调用上游下单接口，不产生任何扣款。
 */
export async function GET(request: NextRequest) {
  const orderId = request.nextUrl.searchParams.get("orderId")
  if (!orderId) {
    return NextResponse.json({ error: "缺少 orderId" }, { status: 400 })
  }

  const admin = createRelogradeAdminClient()
  if (!admin) {
    return NextResponse.json({ error: "未配置 SUPABASE_SERVICE_ROLE_KEY" }, { status: 503 })
  }

  const { data: rows, error } = await admin
    .from("voucher_orders")
    .select(
      "order_id,status,brand_slug,product_slug,face_value,face_value_currency,sell_cny,relograde_trx,voucher_code,redemption_link,error_message,created_at,paid_at,delivered_at,quote_snapshot",
    )
    .eq("order_id", orderId)

  if (error) {
    return NextResponse.json({ error: `本地查询失败: ${error.message}` }, { status: 500 })
  }

  let alipay: Record<string, unknown> | null = null
  let alipayError: string | null = null
  try {
    const result = (await queryPayment(orderId)) as Record<string, unknown>
    alipay = {
      tradeStatus: result.tradeStatus ?? result.trade_status ?? null,
      tradeNo: result.tradeNo ?? result.trade_no ?? null,
      totalAmount: result.totalAmount ?? result.total_amount ?? null,
      code: result.code ?? null,
      msg: result.msg ?? null,
      subMsg: result.subMsg ?? result.sub_msg ?? null,
    }
  } catch (err: unknown) {
    alipayError = err instanceof Error ? err.message : "支付宝查单失败"
  }

  const summary = (rows ?? []).map((row) => {
    const snapshot = (row.quote_snapshot || null) as Record<string, unknown> | null
    return {
      status: row.status,
      relograde_trx: row.relograde_trx,
      has_voucher_code: Boolean(row.voucher_code),
      has_redemption_link: Boolean(row.redemption_link),
      error_message: row.error_message,
      created_at: row.created_at,
      paid_at: row.paid_at,
      delivered_at: row.delivered_at,
      product_slug: row.product_slug,
      face: `${row.face_value} ${row.face_value_currency}`,
      sell_cny: row.sell_cny,
      snapshot_product_slug: snapshot ? snapshot.productSlug : null,
    }
  })

  return NextResponse.json({
    orderId,
    rowCount: rows?.length ?? 0,
    rows: summary,
    alipay,
    alipayError,
  })
}
