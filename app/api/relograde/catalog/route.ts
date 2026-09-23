import { NextRequest, NextResponse } from "next/server"
import {
  getBrandProducts,
  isRelogradeBrand,
  toCatalogOptions,
  type RelogradeBrandId,
} from "@/lib/relograde/catalog"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const brandId = request.nextUrl.searchParams.get("brand") || ""
  const currency = (request.nextUrl.searchParams.get("currency") || "USD").toUpperCase()

  if (!isRelogradeBrand(brandId)) {
    return NextResponse.json({ error: "不支持的卡种" }, { status: 400 })
  }

  try {
    const products = await getBrandProducts(brandId as RelogradeBrandId)
    const options = toCatalogOptions(products, currency)
    return NextResponse.json({
      success: true,
      brandId,
      currency,
      options,
    })
  } catch (error: any) {
    console.error("Relograde catalog error:", error)
    return NextResponse.json(
      { error: error?.message || "商品目录暂时不可用" },
      { status: 502 },
    )
  }
}
