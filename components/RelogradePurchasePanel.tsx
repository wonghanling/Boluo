"use client"

import * as React from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { CardProduct } from "@/content/cards"
import { getCardTheme } from "@/lib/card-theme"
import { RELOGRADE_BRANDS, type RelogradeBrandId } from "@/lib/relograde/catalog-public"

type CatalogOption = {
  productSlug: string
  label: string
  currency: string
  region: string | null
  faceValue: number | null
  isVariable: boolean
  min: number | null
  max: number | null
  inStock: boolean
}

type CatalogRegion = {
  code: string
  label: string
  currency: string
  inStockCount: number
}

type QuoteView = {
  productSlug: string
  isVariable: boolean
  faceValue: number
  faceValueCurrency: string
  sellCny: number
  usdCny: number
  inStock: boolean
  estimatedNewCardRemaining: number
  estimatedNewCardFeeUsd: number
  region: string | null
  showRewarbleFees: boolean
}

type RelogradePurchasePanelProps = {
  product: CardProduct
  brandId: RelogradeBrandId
}

function parseAmount(value: string) {
  const normalized = value.replace(/[^\d.]/g, "")
  if (!normalized) return Number.NaN
  return parseFloat(normalized)
}

export function RelogradePurchasePanel({ product, brandId }: RelogradePurchasePanelProps) {
  const brand = RELOGRADE_BRANDS[brandId]
  const currencies = brand.currencies as readonly string[]
  const groupedByRegion = brand.groupedByRegion
  const showRewarbleFees = brand.showRewarbleFees
  const theme = getCardTheme(product.id)

  const [currency, setCurrency] = React.useState(currencies[0] || "USD")
  const [region, setRegion] = React.useState("")
  const [regions, setRegions] = React.useState<CatalogRegion[]>([])
  const [options, setOptions] = React.useState<CatalogOption[]>([])
  const [catalogStatus, setCatalogStatus] = React.useState<"loading" | "ready" | "error">("loading")
  const [selectedSlug, setSelectedSlug] = React.useState("")
  const [customAmount, setCustomAmount] = React.useState("")
  const [quote, setQuote] = React.useState<QuoteView | null>(null)
  const [quoteStatus, setQuoteStatus] = React.useState<"idle" | "loading" | "ready" | "error">("idle")
  const [quoteError, setQuoteError] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [contact, setContact] = React.useState("")
  const [note, setNote] = React.useState("")
  const [errors, setErrors] = React.useState<{ email?: string; contact?: string; amount?: string }>({})
  const [isPaying, setIsPaying] = React.useState(false)

  const selected = options.find((item) => item.productSlug === selectedSlug) ?? null
  const faceValue = selected?.isVariable
    ? parseAmount(customAmount)
    : Number(selected?.faceValue)
  const amountValid =
    Number.isFinite(faceValue) &&
    faceValue > 0 &&
    (!selected?.min || faceValue >= selected.min) &&
    (!selected?.max || faceValue <= selected.max)

  React.useEffect(() => {
    let cancelled = false
    const load = async () => {
      setCatalogStatus("loading")
      try {
        const params = new URLSearchParams({ brand: brandId })
        if (currency) params.set("currency", currency)
        if (groupedByRegion && region) params.set("region", region)
        const response = await fetch(`/api/relograde/catalog?${params.toString()}`, {
          cache: "no-store",
        })
        const result = await response.json()
        if (!response.ok || !result.success) throw new Error(result.error || "目录加载失败")
        if (cancelled) return
        const nextRegions = (result.regions || []) as CatalogRegion[]
        const nextOptions = (result.options || []) as CatalogOption[]
        setRegions(nextRegions)
        if (groupedByRegion && !region && nextRegions[0]) {
          const firstLive = nextRegions.find((item) => item.inStockCount > 0) || nextRegions[0]
          setRegion(firstLive.code)
          setCurrency(firstLive.currency)
        } else if (result.currency) {
          setCurrency(result.currency)
        }
        setOptions(nextOptions)
        const firstInStock = nextOptions.find((item) => item.inStock) || nextOptions[0]
        setSelectedSlug(firstInStock?.productSlug || "")
        setCustomAmount("")
        setQuote(null)
        setQuoteStatus("idle")
        setCatalogStatus("ready")
      } catch (error) {
        console.error(error)
        if (cancelled) return
        setOptions([])
        setCatalogStatus("error")
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [brandId, currency, groupedByRegion, region])

  React.useEffect(() => {
    if (!selected || !amountValid) {
      setQuote(null)
      setQuoteStatus("idle")
      return
    }

    let cancelled = false
    const timer = window.setTimeout(async () => {
      setQuoteStatus("loading")
      setQuoteError("")
      try {
        const response = await fetch("/api/relograde/quote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            brandId,
            currency,
            faceValue,
            preferVariable: Boolean(selected.isVariable),
            region: groupedByRegion ? region : undefined,
            productSlug: selected.productSlug,
          }),
        })
        const result = await response.json()
        if (!response.ok || !result.success) throw new Error(result.error || "询价失败")
        if (cancelled) return
        setQuote(result.quote)
        setQuoteStatus("ready")
      } catch (error: any) {
        if (cancelled) return
        setQuote(null)
        setQuoteStatus("error")
        setQuoteError(error?.message || "询价失败")
      }
    }, 280)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [amountValid, brandId, currency, faceValue, groupedByRegion, region, selected?.isVariable, selected?.productSlug])

  const handleSubmit = async () => {
    const nextErrors: { email?: string; contact?: string; amount?: string } = {}
    if (!amountValid) {
      nextErrors.amount = selected?.isVariable
        ? `请输入 ${selected.min} - ${selected.max} ${currency}`
        : "请选择面额"
    }
    if (!email.trim()) nextErrors.email = "请输入接收邮箱"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) nextErrors.email = "请输入有效邮箱"
    if (!contact.trim()) nextErrors.contact = "请输入微信、Telegram 或手机号"
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0 || isPaying || !quote) return

    setIsPaying(true)
    try {
      const response = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: quote.sellCny,
          title: product.name,
          contactEmail: email.trim(),
          contactMethod: contact.trim(),
          customerNote: note.trim() || undefined,
          relograde: {
            brandId,
            currency,
            faceValue,
            preferVariable: Boolean(selected?.isVariable),
            region: groupedByRegion ? region : undefined,
            productSlug: selected?.productSlug,
          },
        }),
      })
      const result = await response.json()
      if (!result.success) {
        window.alert(result.error || "支付创建失败")
        return
      }
      const div = document.createElement("div")
      div.innerHTML = result.payUrl
      document.body.appendChild(div)
      const script = div.querySelector("script")
      if (script) eval(script.innerHTML)
    } catch (error) {
      console.error(error)
      window.alert("支付接口异常，请稍后重试")
    } finally {
      setIsPaying(false)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-[760px] flex-col gap-4 xl:max-w-[720px]">
      <div className="rounded-[28px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f4f7fb_100%)] p-4 shadow-[0_20px_50px_rgba(15,23,42,0.08)] sm:p-5">
        <div
          className="relative overflow-hidden rounded-[24px] px-5 py-5 text-white shadow-[0_26px_60px_rgba(15,23,42,0.22),inset_0_1px_0_rgba(255,255,255,0.24)] sm:px-6 sm:py-6"
          style={{ backgroundImage: theme.gradient }}
        >
          <div className="absolute inset-0" style={{ backgroundImage: theme.overlayHighlight }} />
          <div className="relative z-10 flex items-start justify-between gap-3">
            <div>
              <span className="rounded-full border border-white/14 bg-white/16 px-3 py-1 text-[11px] font-semibold tracking-[0.18em] text-white backdrop-blur-md">
                {product.badge}
              </span>
              <h2 className="mt-3 text-[26px] font-semibold tracking-tight sm:text-[30px]">
                {product.name}
              </h2>
              <p className="mt-1.5 text-[13px] leading-5 text-white/82">{product.subtitle}</p>
            </div>
            <span className="rounded-full border border-white/20 bg-white/8 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-white/84">
              {showRewarbleFees ? "可开卡 / 可充值" : "礼品卡兑换码"}
            </span>
          </div>
          <div className="relative z-10 mt-4 h-[90px] w-full sm:h-[112px]">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-contain object-left drop-shadow-[0_16px_30px_rgba(15,23,42,0.28)]"
              style={{ filter: theme.logoFilter }}
              sizes="720px"
            />
          </div>
          <div className="relative z-10 mt-5 grid gap-3 text-white/90 sm:grid-cols-3">
            <div className="rounded-[18px] px-3.5 py-3" style={{ backgroundColor: theme.statsBackground }}>
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/62">面额</p>
              <p className="mt-1.5 text-[18px] font-semibold">
                {amountValid ? `${faceValue.toFixed(2)} ${currency}` : "--"}
              </p>
            </div>
            <div className="rounded-[18px] px-3.5 py-3" style={{ backgroundColor: theme.statsBackground }}>
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/62">
                {showRewarbleFees ? "开卡后约可用" : "到账面额"}
              </p>
              <p className="mt-1.5 text-[18px] font-semibold">
                {showRewarbleFees
                  ? quote
                    ? `${quote.estimatedNewCardRemaining.toFixed(2)} ${currency}`
                    : "--"
                  : amountValid
                    ? `${faceValue.toFixed(2)} ${currency}`
                    : "--"}
              </p>
            </div>
            <div className="rounded-[18px] px-3.5 py-3" style={{ backgroundColor: theme.statsBackground }}>
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/62">应付人民币</p>
              <p className="mt-1.5 text-[18px] font-semibold">
                {quote ? `¥${quote.sellCny}` : quoteStatus === "loading" ? "询价中" : "--"}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-[20px] border border-slate-200 bg-white p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">购买说明</p>
          <p className="mt-2.5 text-[13px] leading-6 text-slate-600">{product.description}</p>
          <div className="mt-3 space-y-1.5 text-[12px] text-slate-700">
            {product.features.map((feature) => (
              <div key={feature} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[12px] leading-5 text-slate-500">{product.purchaseNote}</p>
        </div>
      </div>

      <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_20px_50px_rgba(15,23,42,0.06)] sm:p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">购买信息</p>
        <h2 className="mt-2 text-[24px] font-semibold tracking-tight text-slate-950">选择面额并付款</h2>

        {groupedByRegion && (
          <div className="mt-5">
            <label className="mb-2 block text-[12px] font-semibold text-slate-900">国家 / 地区</label>
            <select
              value={region}
              onChange={(event) => {
                const next = regions.find((item) => item.code === event.target.value)
                setRegion(event.target.value)
                if (next) setCurrency(next.currency)
              }}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-[14px] text-slate-900"
            >
              {regions.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.label}（{item.currency}
                {item.inStockCount ? "" : " · 整区缺货"}）
                </option>
              ))}
            </select>
          </div>
        )}

        {currencies.length > 1 && !groupedByRegion && (
          <div className="mt-5">
            <label className="mb-2 block text-[12px] font-semibold text-slate-900">币种</label>
            <select
              value={currency}
              onChange={(event) => setCurrency(event.target.value)}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-[14px] text-slate-900"
            >
              {currencies.map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="mt-4">
          <label className="mb-2 block text-[12px] font-semibold text-slate-900">面额</label>
          {catalogStatus === "loading" && <p className="text-[13px] text-slate-500">正在读取在售面额…</p>}
          {catalogStatus === "error" && <p className="text-[13px] text-red-600">目录加载失败，请刷新重试</p>}
          {catalogStatus === "ready" && (
            <select
              value={selectedSlug}
              onChange={(event) => {
                setSelectedSlug(event.target.value)
                setCustomAmount("")
              }}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-[14px] text-slate-900"
            >
              {options.map((option) => (
                <option key={option.productSlug} value={option.productSlug}>
                  {option.label}
                  {option.inStock ? "" : "（缺货）"}
                </option>
              ))}
            </select>
          )}
        </div>

        {selected?.isVariable && (
          <div className="mt-4">
            <label className="mb-2 block text-[12px] font-semibold text-slate-900">
              自定义金额（{currency}）
            </label>
            <Input
              inputMode="decimal"
              value={customAmount}
              onChange={(event) => {
                setCustomAmount(event.target.value)
                setErrors((prev) => ({ ...prev, amount: undefined }))
              }}
              placeholder={`范围 ${selected.min} - ${selected.max}`}
              className="h-10 rounded-xl border-slate-200"
            />
            {errors.amount && <p className="mt-2 text-sm text-red-600">{errors.amount}</p>}
          </div>
        )}

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-[12px] font-semibold text-slate-900">联系邮箱</label>
            <Input
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value)
                setErrors((prev) => ({ ...prev, email: undefined }))
              }}
              placeholder="you@example.com"
              className="h-10 rounded-xl border-slate-200"
            />
            {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email}</p>}
          </div>
          <div>
            <label className="mb-2 block text-[12px] font-semibold text-slate-900">联系方式</label>
            <Input
              value={contact}
              onChange={(event) => {
                setContact(event.target.value)
                setErrors((prev) => ({ ...prev, contact: undefined }))
              }}
              placeholder="微信 / Telegram / 手机号"
              className="h-10 rounded-xl border-slate-200"
            />
            {errors.contact && <p className="mt-2 text-sm text-red-600">{errors.contact}</p>}
          </div>
          <div className="sm:col-span-2">
            <label className="mb-2 block text-[12px] font-semibold text-slate-900">备注</label>
            <Textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="可选"
              className="min-h-[88px] rounded-[20px] border-slate-200"
            />
          </div>
        </div>

        <div className="mt-5 rounded-[20px] border border-slate-200 bg-slate-50 p-4 text-[12px] text-slate-600">
          <div className="flex items-center justify-between">
            <span>{showRewarbleFees ? "钱包到账面额" : "兑换码面额"}</span>
            <span className="text-slate-950">{amountValid ? `${faceValue.toFixed(2)} ${currency}` : "--"}</span>
          </div>
          {showRewarbleFees && (
            <>
              <div className="mt-2.5 flex items-center justify-between">
                <span>开新卡估算扣费</span>
                <span className="text-slate-950">
                  {quote ? `约 $${quote.estimatedNewCardFeeUsd.toFixed(2)}` : "--"}
                </span>
              </div>
              <div className="mt-2.5 flex items-center justify-between">
                <span>开新卡后约可用</span>
                <span className="text-slate-950">
                  {quote ? `${quote.estimatedNewCardRemaining.toFixed(2)} ${currency}` : "--"}
                </span>
              </div>
              <div className="mt-2.5 flex items-center justify-between">
                <span>已有卡充值估算</span>
                <span className="text-slate-950">
                  {amountValid ? `约 $${(0.99 + faceValue * 0.055).toFixed(2)}` : "--"}
                </span>
              </div>
            </>
          )}
          <div className="mt-2.5 flex items-center justify-between">
            <span>汇率</span>
            <span className="text-slate-950">{quote ? `1 USD = ${quote.usdCny.toFixed(4)} CNY` : "--"}</span>
          </div>
          {quoteError && <p className="mt-3 text-red-600">{quoteError}</p>}
          <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4">
            <span className="text-[13px] font-semibold text-slate-950">应付人民币</span>
            <span className="text-[24px] font-semibold text-slate-950">
              {quote ? `¥${quote.sellCny}` : "--"}
            </span>
          </div>
        </div>

        <Button
          className="mt-5 h-11 w-full rounded-[18px] border-0 bg-[#1faa45] text-[15px] font-semibold text-white hover:bg-[#18973c]"
          onClick={handleSubmit}
          disabled={isPaying || !quote || !selected?.inStock}
        >
          {isPaying ? "跳转支付中..." : "立即付款"}
        </Button>
        <p className="mt-3 text-[11px] leading-5 text-slate-500">
          {showRewarbleFees
            ? "付款成功后兑换码直接显示在本页，请自行复制保存。到 https://rewarble.com/redeem 兑换进钱包，可开新卡或给已有卡充值（充值更便宜）。开卡费、充值费、月费、KYC 由 Rewarble 收取，以兑换时页面为准。邮箱和联系方式仅用于订单查询与售后。"
            : "付款成功后兑换码直接显示在本页，请自行复制保存。请在对应国家的官方账户兑换，跨区通常无法使用。邮箱和联系方式仅用于订单查询与售后。"}
        </p>
      </div>
    </div>
  )
}
