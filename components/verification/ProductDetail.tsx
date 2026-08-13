"use client"

import { useEffect, useState } from "react"
import type { VerificationProductView } from "@/types/verification"
import { BuyVerificationProduct } from "./BuyVerificationProduct"

export function ProductDetail({
  productCode,
  children,
}: {
  productCode: string
  children: React.ReactNode
}) {
  const [product, setProduct] = useState<VerificationProductView | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch("/api/verification/products", { cache: "no-store" })
      .then(async (response) => {
        const result = await response.json()
        if (!response.ok) throw new Error(result.error)
        const current = (result.products || []).find((item: VerificationProductView) => item.code === productCode)
        if (!current) throw new Error("商品不存在")
        setProduct(current)
      })
      .catch((reason) => setError(reason instanceof Error ? reason.message : "商品信息读取失败"))
  }, [productCode])

  if (error) return <div className="rounded-2xl border border-red-400/30 bg-red-400/10 p-5 text-red-200">{error}</div>
  if (!product) return <div className="h-44 animate-pulse rounded-3xl bg-white/5" />

  const paused = !product.is_active || product.sales_paused
  return (
    <div className="rounded-3xl border border-yellow-400/20 bg-yellow-400/[0.06] p-6 md:p-8">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div>
          <p className="text-sm text-white/50">服务端实时定价</p>
          <p className="mt-1 text-4xl font-bold text-yellow-400">¥{Number(product.sale_price).toFixed(2)}</p>
          <p className="mt-2 text-sm text-white/50">付款后不会自动取号，由您准备好后手动开始。</p>
        </div>
        <BuyVerificationProduct productCode={productCode} disabled={paused} />
      </div>
      <div className="mt-7 border-t border-white/10 pt-6">{children}</div>
    </div>
  )
}
