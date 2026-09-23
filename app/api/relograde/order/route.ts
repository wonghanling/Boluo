import { NextRequest, NextResponse } from "next/server"
import { createRelogradeAdminClient } from "@/lib/relograde/db"

export const dynamic = "force-dynamic"

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
    .select(
      "order_id,status,face_value,face_value_currency,sell_cny,voucher_code,redemption_link,voucher_expires_at,error_message,delivered_at",
    )
    .eq("order_id", orderId)
    .maybeSingle()

  if (error || !data) {
    return NextResponse.json({ error: "订单不存在" }, { status: 404 })
  }

  return NextResponse.json({
    success: true,
    order: data,
  })
}
