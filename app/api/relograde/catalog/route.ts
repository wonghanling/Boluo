import { NextRequest, NextResponse } from "next/server"
import {
  getBrandProducts,
  isRelogradeBrand,
  listCatalogRegions,
  toCatalogOptions,
  type RelogradeBrandId,
} from "@/lib/relograde/catalog"
import { RELOGRADE_BRANDS } from "@/lib/relograde/catalog-public"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const brandId = request.nextUrl.searchParams.get("brand") || ""
  const currency = (request.nextUrl.searchParams.get("currency") || "").toUpperCase()
  const region = (request.nextUrl.searchParams.get("region") || "").toLowerCase()

  if (!isRelogradeBrand(brandId)) {
    return NextResponse.json({ error: "不支持的卡种" }, { status: 400 })
  }

  try {
    const brand = RELOGRADE_BRANDS[brandId as RelogradeBrandId]
    const products = await getBrandProducts(brandId as RelogradeBrandId)
    const regions = brand.groupedByRegion ? listCatalogRegions(products) : []
    const selectedRegion = region || (regions[0] && regions[0].code) || ""
    const selectedCurrency =
      currency ||
      (selectedRegion && regions.find((item) => item.code === selectedRegion)?.currency) ||
      (brand.currencies[0] as string) ||
      "USD"
    const options = toCatalogOptions(
      products,
      selectedCurrency,
      brand.groupedByRegion ? selectedRegion : undefined,
    )
    return NextResponse.json({
      success: true,
      brandId,
      currency: selectedCurrency,
      region: selectedRegion || null,
      groupedByRegion: brand.groupedByRegion,
      showRewarbleFees: brand.showRewarbleFees,
      regions,
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
