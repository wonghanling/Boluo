"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Loader2, Package, ArrowRight } from "lucide-react"
import { useAuth } from "@/components/AuthProvider"
import { verificationFetch } from "@/lib/verification/client"
import { VERIFICATION_STATUS_LABELS, VerificationOrderView } from "@/types/verification"

const productNames: Record<string, string> = {
  US_SHORT: "美国短期验证套餐",
  UK_FIRST: "英国首次验证",
  UK_LONG_MONTH: "英国长期首月",
  UK_RENEWAL: "英国号码续租",
}

export function VerificationOrdersList() {
  const { user, loading: authLoading } = useAuth()
  const [orders, setOrders] = useState<VerificationOrderView[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      setLoading(false)
      return
    }
    verificationFetch("/api/verification/orders")
      .then((result) => setOrders(result.orders || []))
      .catch((reason) => setError(reason instanceof Error ? reason.message : "订单读取失败"))
      .finally(() => setLoading(false))
  }, [user, authLoading])

  if (authLoading || loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-yellow-400" /></div>
  if (!user) return (
    <div className="rounded-3xl border border-white/10 p-8 text-center">
      <p className="text-white/60">登录后才能查看自己的验证订单。</p>
      <Link href={`/auth/login?returnUrl=${encodeURIComponent("/verification/orders")}`} className="mt-5 inline-flex rounded-full bg-yellow-400 px-6 py-3 font-medium text-[#111113]">立即登录</Link>
    </div>
  )
  if (error) return <p className="rounded-2xl border border-red-400/30 bg-red-400/10 p-5 text-red-200">{error}</p>
  if (!orders.length) return (
    <div className="rounded-3xl border border-white/10 p-10 text-center">
      <Package className="mx-auto h-10 w-10 text-white/30" />
      <p className="mt-4 text-white/60">暂无验证订单</p>
      <Link href="/verification" className="mt-5 inline-flex rounded-full bg-yellow-400 px-6 py-3 font-medium text-[#111113]">查看验证套餐</Link>
    </div>
  )

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <Link key={order.id} href={`/verification/orders/${order.id}`} className="flex flex-col justify-between gap-5 rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-yellow-400/30 md:flex-row md:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="font-semibold">{productNames[order.product_code] || order.product_code}</h2>
              <span className="rounded-full bg-yellow-400/10 px-3 py-1 text-xs text-yellow-300">{VERIFICATION_STATUS_LABELS[order.fulfillment_status] || order.fulfillment_status}</span>
            </div>
            <p className="mt-2 text-xs text-white/40">订单号 {order.payment_order_no}</p>
            <p className="mt-1 text-xs text-white/40">{new Date(order.created_at).toLocaleString("zh-CN")}</p>
          </div>
          <div className="flex items-center justify-between gap-5 md:justify-end">
            <span className="font-semibold text-yellow-400">¥{Number(order.sale_price).toFixed(2)}</span>
            <ArrowRight className="h-5 w-5 text-white/40" />
          </div>
        </Link>
      ))}
    </div>
  )
}
