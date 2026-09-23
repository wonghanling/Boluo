"use client"

import * as React from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

type OrderView = {
  order_id: string
  status: string
  face_value: number
  face_value_currency: string
  sell_cny: number
  voucher_code: string | null
  redemption_link: string | null
  voucher_expires_at: string | null
  error_message: string | null
}

const STATUS_TEXT: Record<string, string> = {
  pending_payment: "等待支付",
  paid: "已支付，正在出码",
  fulfilling: "正在向上游取码",
  delivered: "已发货",
  failed: "出码失败，请联系客服",
}

function CardSuccessContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get("orderId") || ""
  const [order, setOrder] = React.useState<OrderView | null>(null)
  const [error, setError] = React.useState("")

  React.useEffect(() => {
    if (!orderId) return
    let cancelled = false
    const load = async () => {
      try {
        const response = await fetch(`/api/relograde/order?orderId=${encodeURIComponent(orderId)}`, {
          cache: "no-store",
        })
        const result = await response.json()
        if (!response.ok) throw new Error(result.error || "查询失败")
        if (!cancelled) setOrder(result.order)
      } catch (err: any) {
        if (!cancelled) setError(err?.message || "查询失败")
      }
    }
    load()
    const timer = window.setInterval(load, 4000)
    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [orderId])

  const delivered = order?.status === "delivered"
  const failed = order?.status === "failed"

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto w-full max-w-[640px] px-4 py-12">
        <p className="text-[12px] font-semibold uppercase tracking-[0.24em] text-slate-400">
          Payment
        </p>
        <h1 className="mt-2 text-[28px] font-semibold tracking-tight text-slate-950">
          {delivered ? "兑换码已就绪" : failed ? "出码失败" : "支付结果"}
        </h1>
        <p className="mt-3 text-[14px] leading-6 text-slate-600">
          {orderId ? `订单号 ${orderId}` : "未找到订单号。如果已付款，请凭邮箱联系客服。"}
        </p>

        {error && <p className="mt-6 text-[14px] text-red-600">{error}</p>}

        {order && (
          <div className="mt-8 rounded-[24px] border border-slate-200 bg-slate-50 p-5">
            <p className="text-[13px] text-slate-500">
              {STATUS_TEXT[order.status] || order.status}
            </p>
            <p className="mt-2 text-[15px] font-medium text-slate-950">
              {order.face_value} {order.face_value_currency} · ¥{order.sell_cny}
            </p>

            {delivered && (
              <div className="mt-5 space-y-3">
                {order.voucher_code && (
                  <div>
                    <p className="text-[12px] text-slate-500">兑换码</p>
                    <p className="mt-1 break-all text-[18px] font-semibold tracking-wide text-slate-950">
                      {order.voucher_code}
                    </p>
                  </div>
                )}
                <a
                  href={order.redemption_link || "https://rewarble.com/redeem"}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-11 items-center rounded-full bg-[#1faa45] px-5 text-[14px] font-semibold text-white"
                >
                  {order.redemption_link ? "打开兑换页" : "去 Rewarble 兑换"}
                </a>
                <p className="text-[12px] leading-5 text-slate-500">
                  打开兑换页，粘贴兑换码。Visa / Mastercard 兑进钱包后可开新卡或给已有卡充值；礼品卡请在对应国家官方账户兑换。
                </p>
              </div>
            )}

            {!delivered && !failed && (
              <p className="mt-5 text-[13px] text-slate-500">正在出码，通常几十秒内完成，本页会自动刷新。</p>
            )}

            {failed && (
              <p className="mt-5 text-[13px] text-red-600">
                {order.error_message || "出码失败。请保留订单号联系客服，我们会补发或退款。"}
              </p>
            )}
          </div>
        )}

        <Link href="/cards" className="mt-8 inline-flex text-[13px] font-medium text-slate-600">
          返回卡片列表
        </Link>
      </div>
    </main>
  )
}

export default function CardSuccessPage() {
  return (
    <React.Suspense fallback={<main className="min-h-screen bg-white p-12 text-slate-500">加载中…</main>}>
      <CardSuccessContent />
    </React.Suspense>
  )
}
