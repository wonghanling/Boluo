import { NextRequest, NextResponse } from "next/server"
import { isRelogradeBrand, quoteBrandProduct, type RelogradeBrandId } from "@/lib/relograde/catalog"
import {
  cancelOrder,
  createOrder,
  extractVoucher,
  RelogradeError,
  resolveOrder,
} from "@/lib/relograde/client"

export const dynamic = "force-dynamic"

function paymentCurrency(): string {
  return (process.env.RELOGRADE_PAYMENT_CURRENCY || "EUR").toUpperCase()
}

export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "生产环境禁用沙盒下单" }, { status: 403 })
  }

  try {
    const body = await request.json()
    const brandId = String(body.brandId || "visa")
    const currency = String(body.currency || "USD").toUpperCase()
    const faceValue = Number(body.faceValue || 30)
    const preferVariable = Boolean(body.preferVariable)

    if (!isRelogradeBrand(brandId)) {
      return NextResponse.json({ error: "不支持的卡种" }, { status: 400 })
    }

    const quote = await quoteBrandProduct({
      brandId: brandId as RelogradeBrandId,
      currency,
      faceValue,
      preferVariable,
    })

    const item: { productSlug: string; amount: number; faceValue?: number } = {
      productSlug: quote.productSlug,
      amount: 1,
    }
    if (quote.isVariable) item.faceValue = quote.faceValue

    const created = await createOrder({
      items: [item],
      paymentCurrency: paymentCurrency(),
      reference: `sandbox-${Date.now()}`,
    })

    let resolved
    try {
      resolved = await resolveOrder(created.trx)
    } catch (error) {
      try {
        await cancelOrder(created.trx)
      } catch {
        // ignore
      }
      throw error
    }

    const voucher = extractVoucher(resolved)

    return NextResponse.json({
      success: true,
      quote: {
        productSlug: quote.productSlug,
        faceValue: quote.faceValue,
        faceValueCurrency: quote.faceValueCurrency,
        sellCny: quote.sellCny,
        costAmount: quote.costAmount,
        costCurrency: quote.costCurrency,
      },
      relograde: {
        trx: resolved.trx,
        orderStatus: resolved.orderStatus,
        priceInclVat: resolved.priceInclVat,
        priceCurrency: resolved.priceCurrency,
      },
      voucher,
    })
  } catch (error: any) {
    const extra = error instanceof RelogradeError ? error.body : undefined
    console.error("sandbox-order error:", error)
    return NextResponse.json(
      { error: error?.message || "沙盒下单失败", extra },
      { status: 400 },
    )
  }
}
