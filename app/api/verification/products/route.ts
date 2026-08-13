import { NextResponse } from "next/server"
import { createVerificationAdminClient } from "@/lib/verification/server"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET() {
  const admin = createVerificationAdminClient()
  const { data, error } = await admin
    .from("verification_products")
    .select("code,name,description,product_type,country_code,sale_price,is_active,sales_paused,config")
    .order("sale_price", { ascending: true })

  if (error) {
    return NextResponse.json({ error: "商品配置暂时不可用" }, { status: 503 })
  }

  const products = (data || []).map((product) => ({
    ...product,
    sale_price: Number(product.sale_price),
    config: {
      max_numbers: product.config?.max_numbers,
      change_wait_seconds: product.config?.change_wait_seconds,
      period_days: product.config?.period_days,
      manual_fulfillment: product.config?.manual_fulfillment,
    },
  }))
  return NextResponse.json(
    { products },
    { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } },
  )
}
