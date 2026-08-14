"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight, Clock, Globe2, ShieldCheck } from "lucide-react"
import type { VerificationProductView } from "@/types/verification"

const productLinks: Record<string, string> = {
  US_SHORT: "/verification/us",
  UK_FIRST: "/verification/uk",
  UK_LONG_MONTH: "/verification/uk",
  UK_RENEWAL: "/verification/uk",
}

export function ProductCards({ theme = "dark" }: { theme?: "dark" | "light" }) {
  const [products, setProducts] = useState<VerificationProductView[]>([])
  const [error, setError] = useState("")
  const light = theme === "light"

  useEffect(() => {
    fetch("/api/verification/products", { cache: "no-store" })
      .then(async (response) => {
        const result = await response.json()
        if (!response.ok) throw new Error(result.error)
        setProducts(result.products || [])
      })
      .catch(() => setError("商品信息暂时无法读取，请稍后刷新"))
  }, [])

  if (error) return <p className={`rounded-2xl border border-red-400/30 bg-red-400/10 p-5 ${light ? "text-red-700" : "text-red-200"}`}>{error}</p>
  if (!products.length) return <div className={`h-48 animate-pulse rounded-3xl ${light ? "bg-black/5" : "bg-white/5"}`} />

  return (
    <div className="grid gap-5 md:grid-cols-2">
      {products.map((product) => {
        const isUs = product.product_type === "us_short"
        const paused = !product.is_active || product.sales_paused
        return (
          <article key={product.code} className={`rounded-3xl border p-6 ${light ? "border-black/10 bg-[#f5f5f7]" : "border-white/10 bg-white/[0.04]"}`}>
            <div className="flex items-center justify-between gap-4">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-yellow-400 text-[#111113]">
                {isUs ? <ShieldCheck className="h-6 w-6" /> : <Globe2 className="h-6 w-6" />}
              </span>
              <span className={`rounded-full px-3 py-1 text-xs ${paused ? (light ? "bg-black/5 text-[#1d1d1f]/60" : "bg-white/10 text-white/60") : (light ? "bg-green-100 text-green-700" : "bg-green-400/15 text-green-300")}`}>
                {paused ? "暂未开放" : "可购买"}
              </span>
            </div>
            <h2 className="mt-5 text-2xl font-bold">{product.name}</h2>
            <p className={`mt-3 min-h-12 text-sm leading-6 ${light ? "text-[#1d1d1f]/60" : "text-white/60"}`}>{product.description}</p>
            <div className="mt-6 flex items-end justify-between gap-4">
              <div>
                <p className={`text-xs ${light ? "text-[#1d1d1f]/40" : "text-white/40"}`}>管理员实时定价</p>
                <p className={`text-3xl font-bold ${light ? "text-yellow-600" : "text-yellow-400"}`}>¥{Number(product.sale_price).toFixed(2)}</p>
              </div>
              <Link href={productLinks[product.code] || "/verification"} className="flex items-center gap-2 rounded-full bg-yellow-400 px-5 py-3 font-medium text-[#111113] hover:bg-yellow-300">
                查看说明 <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            {isUs && (
              <p className={`mt-5 flex items-center gap-2 border-t pt-4 text-xs ${light ? "border-black/10 text-[#1d1d1f]/50" : "border-white/10 text-white/50"}`}>
                <Clock className="h-4 w-4" /> 首次获取 1 个号码，符合条件时最多可更换 5 次
              </p>
            )}
          </article>
        )
      })}
    </div>
  )
}
