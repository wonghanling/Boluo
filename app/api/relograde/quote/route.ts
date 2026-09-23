import { NextRequest, NextResponse } from "next/server"
import { isRelogradeBrand, quoteBrandProduct, type RelogradeBrandId } from "@/lib/relograde/catalog"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const brandId = String(body.brandId || "")
    const currency = String(body.currency || "USD").toUpperCase()
    const faceValue = Number(body.faceValue)
    const preferVariable = Boolean(body.preferVariable)

    if (!isRelogradeBrand(brandId)) {
      return NextResponse.json({ error: "不支持的卡种" }, { status: 400 })
    }
    if (!Number.isFinite(faceValue) || faceValue <= 0) {
      return NextResponse.json({ error: "请输入有效面额" }, { status: 400 })
    }

    const quote = await quoteBrandProduct({
      brandId: brandId as RelogradeBrandId,
      currency,
      faceValue,
      preferVariable,
    })

    return NextResponse.json({
      success: true,
      quote: {
        productSlug: quote.productSlug,
        isVariable: quote.isVariable,
        faceValue: quote.faceValue,
        faceValueCurrency: quote.faceValueCurrency,
        sellCny: quote.sellCny,
        usdCny: quote.usdCny,
        inStock: quote.inStock,
        estimatedNewCardRemaining: quote.estimatedNewCardRemaining,
        estimatedNewCardFeeUsd: quote.estimatedNewCardFeeUsd,
      },
    })
  } catch (error: any) {
    console.error("Relograde quote error:", error)
    return NextResponse.json(
      { error: error?.message || "询价失败，请稍后重试" },
      { status: 400 },
    )
  }
}
