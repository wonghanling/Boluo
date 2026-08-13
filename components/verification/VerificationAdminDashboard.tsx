"use client"

import { useCallback, useEffect, useState } from "react"
import { Loader2, RefreshCw, Save, ShieldAlert, WalletCards } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/components/AuthProvider"
import { verificationFetch } from "@/lib/verification/client"
import { VERIFICATION_STATUS_LABELS } from "@/types/verification"

interface AdminData {
  products: any[]
  orders: any[]
  renewals: any[]
  balance: number | null
  balanceError: string | null
  stats: { total: number; active: number; codeReceived: number; review: number; sales: number; cost: number; profit: number }
}

export function VerificationAdminDashboard() {
  const { user, loading: authLoading } = useAuth()
  const [data, setData] = useState<AdminData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState("")
  const [error, setError] = useState("")

  const load = useCallback(async () => {
    setError("")
    try {
      const result = await verificationFetch("/api/verification/admin")
      setData(result)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "管理数据读取失败")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (authLoading) return
    if (!user) { setLoading(false); return }
    load()
  }, [user, authLoading, load])

  const saveProduct = async (product: any) => {
    setSaving(product.code)
    try {
      const result = await verificationFetch("/api/verification/admin", {
        method: "PATCH",
        body: JSON.stringify({
          type: "product",
          code: product.code,
          salePrice: product.sale_price,
          isActive: product.is_active,
          salesPaused: product.sales_paused,
        }),
      })
      updateProduct(product.code, "sale_price", Number(result.product.sale_price))
      updateProduct(product.code, "is_active", result.product.is_active)
      updateProduct(product.code, "sales_paused", result.product.sales_paused)
      alert(result.product.is_active && !result.product.sales_paused ? "已开放销售，客户现在可以购买" : "配置已保存，商品当前未开放销售")
    } catch (reason) {
      alert(reason instanceof Error ? reason.message : "保存失败")
    } finally {
      setSaving("")
    }
  }

  const openProductSales = async (product: any) => {
    setSaving(product.code)
    try {
      const result = await verificationFetch("/api/verification/admin", {
        method: "PATCH",
        body: JSON.stringify({
          type: "product",
          code: product.code,
          salePrice: product.sale_price,
          isActive: true,
          salesPaused: false,
        }),
      })
      updateProduct(product.code, "sale_price", Number(result.product.sale_price))
      updateProduct(product.code, "is_active", result.product.is_active)
      updateProduct(product.code, "sales_paused", result.product.sales_paused)
      alert("已开放销售，客户现在可以购买")
    } catch (reason) {
      alert(reason instanceof Error ? reason.message : "开放销售失败")
    } finally {
      setSaving("")
    }
  }

  const updateProduct = (code: string, field: string, value: unknown) => {
    setData((current) => current ? {
      ...current,
      products: current.products.map((product) => product.code === code ? { ...product, [field]: value } : product),
    } : current)
  }

  const handleOrderAction = async (order: any, actionName: "complete" | "cancel" | "refunded") => {
    const labels = { complete: "手动完成", cancel: "手动取消", refunded: "确认客户已退款" }
    if (!window.confirm(`确认对订单 ${order.payment_order_no} 执行“${labels[actionName]}”？`)) return
    const key = `order:${order.id}:${actionName}`
    setSaving(key)
    try {
      await verificationFetch("/api/verification/admin", {
        method: "PATCH",
        body: JSON.stringify({ type: "order", orderId: order.id, action: actionName }),
      })
      await load()
    } catch (reason) {
      alert(reason instanceof Error ? reason.message : "订单操作失败")
    } finally {
      setSaving("")
    }
  }

  const handleRenewal = async (renewal: any) => {
    const defaultEnd = renewal.period_end || new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10)
    const periodEndInput = window.prompt("请输入新的到期日期（YYYY-MM-DD）", String(defaultEnd).slice(0, 10))
    if (!periodEndInput) return
    const periodEnd = new Date(`${periodEndInput}T23:59:59+08:00`)
    if (Number.isNaN(periodEnd.getTime())) {
      alert("到期日期格式不正确")
      return
    }
    const upstreamReference = window.prompt("请输入上游续租参考号（可留空）", "") || ""
    const adminNotes = window.prompt("请输入管理员备注（可留空）", "") || ""
    const key = `renewal:${renewal.id}`
    setSaving(key)
    try {
      await verificationFetch("/api/verification/admin", {
        method: "PATCH",
        body: JSON.stringify({
          type: "renewal",
          renewalId: renewal.id,
          periodEnd: periodEnd.toISOString(),
          upstreamReference,
          adminNotes,
        }),
      })
      await load()
    } catch (reason) {
      alert(reason instanceof Error ? reason.message : "续租确认失败")
    } finally {
      setSaving("")
    }
  }

  if (authLoading || loading) return <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-yellow-400" /></div>
  if (!user) return <p className="rounded-2xl border border-white/10 p-6 text-white/60">请先登录管理员账号。</p>
  if (error) return <p className="rounded-2xl border border-red-400/30 bg-red-400/10 p-5 text-red-200">{error}</p>
  if (!data) return null

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap justify-end"><Button variant="outline" onClick={() => { setLoading(true); load() }} className="border-white/20 bg-transparent text-white hover:bg-white/10"><RefreshCw className="mr-2 h-4 w-4" />刷新</Button></div>

      <section className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        {[
          ["上游余额", data.balance === null ? "不可用" : `¥${Number(data.balance).toFixed(2)}`],
          ["订单总数", data.stats.total], ["进行中", data.stats.active], ["待人工审核", data.stats.review],
          ["销售金额", `¥${data.stats.sales.toFixed(2)}`], ["估算毛利", `¥${data.stats.profit.toFixed(2)}`],
        ].map(([label, value]) => <div key={String(label)} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"><p className="text-xs text-white/40">{label}</p><p className="mt-2 text-xl font-bold text-yellow-400">{value}</p></div>)}
      </section>
      {data.balanceError && <p className="flex items-center gap-2 rounded-xl border border-yellow-400/20 bg-yellow-400/5 p-4 text-sm text-yellow-200"><WalletCards className="h-4 w-4" />{data.balanceError}</p>}

      <section>
        <h2 className="text-2xl font-bold">商品定价与销售开关</h2>
        <p className="mt-2 text-sm text-white/50">美国价格未确认最坏成本前建议保持暂停；保存后新订单立即使用数据库价格。</p>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {data.products.map((product) => (
            <div key={product.code} className="rounded-2xl border border-white/10 p-5">
              <div className="flex items-center justify-between gap-3"><div><h3 className="font-semibold">{product.name}</h3><p className="mt-1 text-xs text-white/40">{product.code}</p></div><ShieldAlert className={product.sales_paused ? "h-5 w-5 text-yellow-400" : "h-5 w-5 text-green-400"} /></div>
              <label className="mt-5 block text-xs text-white/50">销售价（人民币）</label>
              <Input type="number" min="0" step="0.01" value={product.sale_price} onChange={(event) => updateProduct(product.code, "sale_price", event.target.value)} className="mt-2 border-white/10 bg-black/20 text-white" />
              <div className="mt-4 flex flex-wrap gap-5 text-sm">
                <label className="flex items-center gap-2"><input type="checkbox" checked={product.is_active} onChange={(event) => updateProduct(product.code, "is_active", event.target.checked)} />商品启用</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={product.sales_paused} onChange={(event) => updateProduct(product.code, "sales_paused", event.target.checked)} />暂停销售/取号</label>
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <Button onClick={() => saveProduct(product)} disabled={saving === product.code} className="bg-yellow-400 text-[#111113] hover:bg-yellow-300"><Save className="mr-2 h-4 w-4" />保存配置</Button>
                {(!product.is_active || product.sales_paused) && (
                  <Button onClick={() => openProductSales(product)} disabled={saving === product.code} className="bg-green-500 text-white hover:bg-green-400">一键开放销售</Button>
                )}
                {product.is_active && !product.sales_paused && <span className="self-center text-sm font-medium text-green-400">当前已开放销售</span>}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold">最近验证订单</h2>
        <div className="mt-5 overflow-x-auto rounded-2xl border border-white/10">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-white/5 text-white/50"><tr><th className="p-4">订单号</th><th className="p-4">商品</th><th className="p-4">状态</th><th className="p-4">销售/成本</th><th className="p-4">创建时间</th><th className="p-4">操作</th></tr></thead>
            <tbody>{data.orders.map((order) => (
              <tr key={order.id} className="border-t border-white/10">
                <td className="p-4 font-mono text-xs">{order.payment_order_no}</td>
                <td className="p-4">{order.product_code}</td>
                <td className="p-4">{VERIFICATION_STATUS_LABELS[order.fulfillment_status] || order.fulfillment_status}</td>
                <td className="p-4">¥{Number(order.sale_price).toFixed(2)} / ¥{Number(order.upstream_cost).toFixed(2)}</td>
                <td className="p-4 text-white/50">{new Date(order.created_at).toLocaleString("zh-CN")}</td>
                <td className="p-4"><div className="flex min-w-56 flex-wrap gap-2">
                  {!['completed', 'cancelled', 'refunded', 'expired'].includes(order.fulfillment_status) && order.fulfillment_status !== 'refund_pending' && (
                    <><Button size="sm" disabled={!!saving} onClick={() => handleOrderAction(order, "complete")} className="bg-green-400/15 text-green-200 hover:bg-green-400/25">完成</Button><Button size="sm" disabled={!!saving} onClick={() => handleOrderAction(order, "cancel")} className="bg-red-400/15 text-red-200 hover:bg-red-400/25">取消</Button></>
                  )}
                  {order.fulfillment_status === 'refund_pending' && <Button size="sm" disabled={!!saving} onClick={() => handleOrderAction(order, "refunded")} className="bg-yellow-400 text-[#111113] hover:bg-yellow-300">确认客户已退款</Button>}
                </div></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold">英国续租待处理</h2>
        <p className="mt-2 text-sm text-white/50">未取得正式续租 API 前，仅由管理员人工处理并填写新的到期时间。</p>
        <div className="mt-4 space-y-3">
          {data.renewals.filter((item) => item.status === "manual_review").map((renewal) => (
            <div key={renewal.id} className="flex flex-col justify-between gap-4 rounded-2xl border border-white/10 p-5 text-sm md:flex-row md:items-center">
              <div><p className="font-mono text-xs">{renewal.payment_order_no}</p><p className="mt-2 text-white/50">金额 ¥{Number(renewal.sale_price).toFixed(2)} · 创建于 {new Date(renewal.created_at).toLocaleString("zh-CN")}</p></div>
              <Button disabled={!!saving} onClick={() => handleRenewal(renewal)} className="bg-yellow-400 text-[#111113] hover:bg-yellow-300">填写续租结果</Button>
            </div>
          ))}
          {!data.renewals.some((item) => item.status === "manual_review") && <div className="rounded-2xl border border-white/10 p-5 text-sm text-white/50">暂无待处理续租</div>}
        </div>
      </section>
    </div>
  )
}
