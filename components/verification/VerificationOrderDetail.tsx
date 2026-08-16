"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { Check, Clipboard, Loader2, RefreshCw, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/AuthProvider"
import { verificationFetch } from "@/lib/verification/client"
import { VERIFICATION_STATUS_LABELS, VerificationOrderView } from "@/types/verification"

const terminalStates = new Set(["completed", "cancelled", "refund_pending", "refunded", "expired", "failed", "manual_review"])
const productNames: Record<string, string> = {
  US_SHORT: "美国短期验证套餐",
  UK_FIRST: "英国首次验证",
  UK_LONG_MONTH: "英国长期首月",
  UK_RENEWAL: "英国号码续租",
}

export function VerificationOrderDetail({ orderId }: { orderId: string }) {
  const { user, loading: authLoading } = useAuth()
  const [order, setOrder] = useState<VerificationOrderView | null>(null)
  const [loading, setLoading] = useState(true)
  const [action, setAction] = useState("")
  const [error, setError] = useState("")
  const [now, setNow] = useState(Date.now())
  const retryDelay = useRef(5000)
  const paymentRetryDelay = useRef(5000)

  const loadOrder = useCallback(async () => {
    const result = await verificationFetch(`/api/verification/orders/${orderId}`)
    setOrder(result.order)
    return result.order as VerificationOrderView
  }, [orderId])

  useEffect(() => {
    if (authLoading) return
    if (!user) { setLoading(false); return }
    loadOrder()
      .catch((reason) => setError(reason instanceof Error ? reason.message : "订单读取失败"))
      .finally(() => setLoading(false))
  }, [user, authLoading, loadOrder])

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (!order || order.fulfillment_status !== "waiting_code") return
    let cancelled = false
    let timer: ReturnType<typeof setTimeout>
    const poll = async () => {
      try {
        const result = await verificationFetch(`/api/verification/orders/${orderId}/status`, { method: "POST", body: "{}" })
        if (cancelled) return
        setOrder(result.order)
        setError("")
        retryDelay.current = 5000
        if (result.order.fulfillment_status === "waiting_code") timer = setTimeout(poll, 5000)
      } catch (reason) {
        if (cancelled) return
        setError(reason instanceof Error ? reason.message : "验证码查询失败，系统将自动重试")
        retryDelay.current = Math.min(retryDelay.current * 2, 30000)
        timer = setTimeout(poll, retryDelay.current)
      }
    }
    timer = setTimeout(poll, 1000)
    return () => { cancelled = true; clearTimeout(timer) }
  }, [order?.fulfillment_status, orderId])

  useEffect(() => {
    if (!order || order.payment_status !== "pending" || order.fulfillment_status !== "awaiting_payment") return
    let cancelled = false
    let timer: ReturnType<typeof setTimeout>
    const pollPayment = async () => {
      try {
        const result = await verificationFetch(`/api/verification/orders/${orderId}`, { method: "POST", body: "{}" })
        if (cancelled) return
        setOrder(result.order)
        setError("")
        paymentRetryDelay.current = 5000
        if (result.order.payment_status === "pending" && result.order.fulfillment_status === "awaiting_payment") {
          timer = setTimeout(pollPayment, 5000)
        }
      } catch (reason) {
        if (cancelled) return
        setError(reason instanceof Error ? reason.message : "付款状态确认失败，系统将自动重试")
        paymentRetryDelay.current = Math.min(paymentRetryDelay.current * 2, 30000)
        timer = setTimeout(pollPayment, paymentRetryDelay.current)
      }
    }
    timer = setTimeout(pollPayment, 800)
    return () => { cancelled = true; clearTimeout(timer) }
  }, [order?.payment_status, order?.fulfillment_status, orderId])

  const changeAvailableAt = useMemo(() => {
    if (!order?.number_received_at) return null
    return new Date(order.number_received_at).getTime() + Number(order.change_wait_seconds || 120) * 1000
  }, [order?.number_received_at, order?.change_wait_seconds])
  const changeWait = changeAvailableAt ? Math.max(0, Math.ceil((changeAvailableAt - now) / 1000)) : 0

  const perform = async (name: string) => {
    if (!order || action) return
    if (name === "cancel" && !window.confirm("确认取消当前号码？上游取消成功后，客户退款仍需管理员审核。")) return
    setAction(name)
    setError("")
    try {
      const result = await verificationFetch(`/api/verification/orders/${order.id}/${name}`, { method: "POST", body: "{}" })
      setOrder(result.order)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "操作失败，请稍后重试")
      await loadOrder().catch(() => undefined)
    } finally {
      setAction("")
    }
  }

  const copy = async (value: string, label: string) => {
    await navigator.clipboard.writeText(value)
    alert(`${label}已复制`)
  }

  if (authLoading || loading) return <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-yellow-400" /></div>
  if (!user) return <div className="rounded-3xl border border-white/10 p-8 text-center"><p className="text-white/60">请登录后查看订单。</p><Link href={`/auth/login?returnUrl=${encodeURIComponent(`/verification/orders/${orderId}`)}`} className="mt-5 inline-flex rounded-full bg-yellow-400 px-6 py-3 text-[#111113]">立即登录</Link></div>
  if (!order) return <p className="rounded-2xl border border-red-400/30 bg-red-400/10 p-5 text-red-200">{error || "订单不存在"}</p>

  const phoneForUse = order.phone_number ? (order.country_code === "187" ? `+1${order.phone_number}` : order.phone_number.startsWith("+") ? order.phone_number : `+44${order.phone_number}`) : ""
  const canChange = order.product_type === "us_short" && ["waiting_code", "change_available"].includes(order.fulfillment_status) && order.numbers_remaining > 0 && changeWait === 0
  const canCancel = order.fulfillment_status === "change_available" || (order.fulfillment_status === "waiting_code" && changeWait === 0)

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs text-white/40">{productNames[order.product_code] || order.product_code} · {order.country_code === "187" ? "美国 +1" : "英国 +44"}</p>
            <p className="mt-1 font-mono text-sm">订单号 {order.payment_order_no}</p>
          </div>
          <span className="rounded-full bg-yellow-400/10 px-4 py-2 text-sm text-yellow-300">{VERIFICATION_STATUS_LABELS[order.fulfillment_status] || order.fulfillment_status}</span>
        </div>
        {error && <p className="mt-5 rounded-xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-200">{error}</p>}

        {order.fulfillment_status === "awaiting_payment" && <p className="mt-8 text-white/60">正在向支付宝确认付款状态，页面会自动刷新，请勿重复支付。</p>}
        {["cancelled", "refund_pending", "refunded", "expired"].includes(order.fulfillment_status) && (
          <p className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm text-white/60">
            当前订单已经结束，号码已释放，因此不再显示号码、验证码或换号操作。
          </p>
        )}
        {order.fulfillment_status === "ready" && (
          <div className="mt-8 rounded-2xl border border-yellow-400/20 bg-yellow-400/[0.05] p-6 text-center">
            <h2 className="text-xl font-semibold">付款成功，准备好后再开始</h2>
            <p className="mt-3 text-sm text-white/50">点击后才会向上游取号，避免号码在您尚未准备时过期。</p>
            <Button onClick={() => perform("start")} disabled={!!action} className="mt-6 rounded-full bg-yellow-400 px-7 text-[#111113] hover:bg-yellow-300">{action === "start" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}我已准备好，开始取号</Button>
          </div>
        )}

        {order.phone_number && (
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-black/30 p-5">
              <p className="text-xs text-white/40">当前号码</p>
              <div className="mt-2 flex items-center justify-between gap-3"><span className="text-2xl font-bold text-yellow-400">{phoneForUse}</span><button onClick={() => copy(phoneForUse, "号码")} className="rounded-full border border-white/10 p-2 hover:bg-white/10"><Clipboard className="h-4 w-4" /></button></div>
              {order.country_code === "187" && <p className="mt-3 text-xs text-white/40">上游号码不含 +1；上方已按国际格式补全，目标网站另有要求时请按其提示填写。</p>}
            </div>
            <div className="rounded-2xl bg-black/30 p-5">
              <p className="text-xs text-white/40">验证码</p>
              {order.verification_code ? <div className="mt-2 flex items-center justify-between gap-3"><span className="text-3xl font-bold tracking-widest text-yellow-400">{order.verification_code}</span><button onClick={() => copy(order.verification_code!, "验证码")} className="rounded-full border border-white/10 p-2 hover:bg-white/10"><Clipboard className="h-4 w-4" /></button></div> : <p className="mt-3 flex items-center gap-2 text-white/50"><RefreshCw className="h-4 w-4 animate-spin" />每 5 秒自动查询</p>}
            </div>
          </div>
        )}

        {order.product_type === "us_short" && order.numbers_used > 0 && !["cancelled", "refund_pending", "refunded", "expired"].includes(order.fulfillment_status) && (
          <div className="mt-5 grid grid-cols-2 gap-4 text-center">
            <div className="rounded-xl border border-white/10 p-4"><p className="text-2xl font-bold">{order.numbers_used}</p><p className="mt-1 text-xs text-white/40">已使用号码数</p></div>
            <div className="rounded-xl border border-white/10 p-4"><p className="text-2xl font-bold">{order.numbers_remaining}</p><p className="mt-1 text-xs text-white/40">剩余换号次数</p></div>
          </div>
        )}

        {!terminalStates.has(order.fulfillment_status) && order.fulfillment_status !== "ready" && (
          <div className="mt-6 flex flex-wrap gap-3">
            {canChange && <Button variant="outline" disabled={!!action} onClick={() => perform("change")} className="border-yellow-400/40 bg-transparent text-yellow-300 hover:bg-yellow-400/10">{action === "change" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}更换号码</Button>}
            {order.fulfillment_status === "waiting_code" && changeWait > 0 && <span className="self-center text-sm text-white/40">{changeWait} 秒后可申请{order.product_type === "us_short" ? "换号或取消" : "取消"}</span>}
            {order.fulfillment_status === "code_received" && <Button onClick={() => perform("complete")} disabled={!!action} className="bg-yellow-400 text-[#111113] hover:bg-yellow-300"><Check className="mr-2 h-4 w-4" />完成订单</Button>}
            {canCancel && <Button variant="outline" disabled={!!action} onClick={() => perform("cancel")} className="border-red-400/30 bg-transparent text-red-300 hover:bg-red-400/10"><XCircle className="mr-2 h-4 w-4" />取消订单</Button>}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-white/10 p-5 text-sm leading-6 text-white/50">
        上游取消退款仅退回号码服务代理余额，不等于客户支付退款。本站客户退款第一版由管理员审核处理。手机号与验证码属于敏感信息，请勿转发；订单完成一定时间后将按运营策略脱敏。
      </section>
    </div>
  )
}
