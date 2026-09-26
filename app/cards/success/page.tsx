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
  const [copied, setCopied] = React.useState(false)

  React.useEffect(() => {
    if (!orderId) return
    let cancelled = false
    let timer = 0
    const load = async () => {
      try {
        const response = await fetch(`/api/relograde/order?orderId=${encodeURIComponent(orderId)}`, {
          cache: "no-store",
          signal: AbortSignal.timeout(55000),
        })
        const result = await response.json()
        if (!response.ok) throw new Error(result.error || "查询失败")
        if (cancelled) return
        setOrder(result.order)
        setError("")
        if (result.order?.status === "delivered" || result.order?.status === "failed") return
      } catch (err: any) {
        if (!cancelled && err?.name !== "AbortError" && err?.name !== "TimeoutError") {
          setError(err?.message || "查询失败")
        }
      }
      if (!cancelled) timer = window.setTimeout(load, 3000)
    }
    load()
    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [orderId])

  const delivered = order?.status === "delivered"
  const failed = order?.status === "failed"
  const waiting = Boolean(order) && !delivered && !failed
  const claimToken = order?.voucher_code || ""
  const hasClaimPage = Boolean(order?.redemption_link)

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto w-full max-w-[640px] px-4 py-12">
        <p className="text-[12px] font-semibold uppercase tracking-[0.24em] text-slate-400">
          Payment
        </p>
        <h1 className="mt-2 text-[28px] font-semibold tracking-tight text-slate-950">
          {delivered ? "兑换码已就绪" : failed ? "出码失败" : waiting ? "正在生成兑换码" : "支付结果"}
        </h1>
        <p className="mt-3 text-[14px] leading-6 text-slate-600">
          {orderId ? `订单号 ${orderId}` : "未找到订单号。如果已付款，请凭邮箱联系客服。"}
        </p>

        {waiting && (
          <div className="mt-8 rounded-[24px] border border-amber-200 bg-amber-50 p-6">
            <div className="flex items-center gap-3">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-amber-300 border-t-amber-700" />
              <p className="text-[16px] font-semibold text-amber-950">正在向上游取兑换码</p>
            </div>
            <p className="mt-3 text-[13px] leading-6 text-amber-900/80">
              支付已收到。通常 10–30 秒，本页会自动更新，请不要关闭。
            </p>
          </div>
        )}

        {error && !order && <p className="mt-6 text-[14px] text-red-600">{error}</p>}

        {order && (delivered || failed) && (
          <div className="mt-8 rounded-[24px] border border-slate-200 bg-slate-50 p-5">
            <p className="text-[13px] text-slate-500">
              {STATUS_TEXT[order.status] || order.status}
            </p>
            <p className="mt-2 text-[15px] font-medium text-slate-950">
              {order.face_value} {order.face_value_currency} · ¥{order.sell_cny}
            </p>

            {delivered && hasClaimPage && (
              <div className="mt-5 space-y-3">
                <a
                  href={order.redemption_link!}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-11 items-center rounded-full bg-[#1faa45] px-5 text-[14px] font-semibold text-white"
                >
                  打开兑换页，复制礼品卡码
                </a>
                <p className="rounded-[14px] bg-amber-50 px-3 py-2 text-[13px] font-medium leading-5 text-amber-950">
                  真正要兑换的码在下一页，以「测试」开头的那一串。请在兑换页复制保存，不会发到邮箱。本页不展示会变动的领取凭证。
                </p>
              </div>
            )}

            {delivered && !hasClaimPage && claimToken && (
              <div className="mt-5 space-y-3">
                <div>
                  <p className="text-[12px] text-slate-500">兑换码</p>
                  <p className="mt-1 break-all text-[18px] font-semibold tracking-wide text-slate-950">
                    {claimToken}
                  </p>
                </div>
                <button
                  type="button"
                  className="inline-flex h-11 items-center rounded-full bg-[#1faa45] px-5 text-[14px] font-semibold text-white"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(claimToken)
                      setCopied(true)
                    } catch {
                      setCopied(false)
                    }
                  }}
                >
                  {copied ? "已复制" : "复制兑换码"}
                </button>
                <p className="rounded-[14px] bg-amber-50 px-3 py-2 text-[13px] font-medium leading-5 text-amber-950">
                  兑换码只显示在本页，不会发到邮箱。请立刻复制保存。
                </p>
              </div>
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
