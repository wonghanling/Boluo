import { NextRequest, NextResponse } from "next/server"
import { matchesConfiguredAlipaySeller, verifyCallback } from "@/lib/alipay"
import { createVerificationAdminClient } from "@/lib/verification/server"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const params: Record<string, string> = {}
    formData.forEach((value, key) => {
      if (typeof value === "string") params[key] = value
    })

    if (!verifyCallback(params)) return new NextResponse("fail", { status: 400 })

    const orderNo = params.out_trade_no
    const tradeNo = params.trade_no
    const paidAmount = Number(params.total_amount)
    const validTradeStatus = params.trade_status === "TRADE_SUCCESS" || params.trade_status === "TRADE_FINISHED"
    const expectedAppId = process.env.ALIPAY_APP_ID
    const sellerMatches = matchesConfiguredAlipaySeller(params)

    if (
      !validTradeStatus ||
      !orderNo ||
      !tradeNo ||
      !Number.isFinite(paidAmount) ||
      !expectedAppId ||
      params.app_id !== expectedAppId ||
      !sellerMatches
    ) {
      return new NextResponse("fail", { status: 400 })
    }

    const admin = createVerificationAdminClient()
    const { data, error } = await admin.rpc("mark_verification_payment_paid", {
      p_payment_order_no: orderNo,
      p_trade_no: tradeNo,
      p_paid_amount: paidAmount.toFixed(2),
    })

    if (error || !data?.ok) {
      return new NextResponse("fail", { status: 500 })
    }
    return new NextResponse("success")
  } catch {
    return new NextResponse("fail", { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 })
}
