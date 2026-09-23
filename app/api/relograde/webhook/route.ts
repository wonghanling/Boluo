import { NextRequest, NextResponse } from "next/server"
import { invalidateRelogradeCache } from "@/lib/relograde/catalog"
import { createRelogradeAdminClient } from "@/lib/relograde/db"
import { fulfillRelogradeOrder } from "@/lib/relograde/fulfill"
import type { QuoteResult } from "@/lib/relograde/catalog"

export const dynamic = "force-dynamic"

const ALLOWED_IP = "18.195.134.217"

function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for")
  if (forwarded) return forwarded.split(",")[0].trim()
  return request.headers.get("x-real-ip") || ""
}

export async function POST(request: NextRequest) {
  const ip = clientIp(request)
  if (process.env.NODE_ENV === "production" && ip && ip !== ALLOWED_IP) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 })
  }

  let payload: any
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 })
  }

  const event = String(payload?.event || "")

  if (event === "PRODUCT_CATALOGUE_UPDATED") {
    const slugs = Array.isArray(payload?.data) ? payload.data.map(String) : []
    invalidateRelogradeCache(slugs)
    return NextResponse.json({ ok: true })
  }

  if (event === "ORDER_FINISHED") {
    const trx = String(payload?.data?.trx || "")
    const reference = String(payload?.data?.reference || "")
    if (!trx && !reference) return NextResponse.json({ ok: true })

    const admin = createRelogradeAdminClient()
    if (!admin) return NextResponse.json({ ok: true })

    const query = admin.from("voucher_orders").select("*")
    const { data } = reference
      ? await query.eq("order_id", reference).maybeSingle()
      : await query.eq("relograde_trx", trx).maybeSingle()

    if (!data || data.status === "delivered") {
      return NextResponse.json({ ok: true })
    }

    const snapshot = (data.quote_snapshot || {}) as QuoteResult
    if (snapshot.productSlug) {
      await fulfillRelogradeOrder({
        orderId: data.order_id,
        quote: snapshot,
      })
    }

    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ ok: true })
}
