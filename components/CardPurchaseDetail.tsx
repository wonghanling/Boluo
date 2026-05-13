"use client"

import * as React from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { CardProduct } from "@/content/cards"

type CardPurchaseDetailProps = {
  product: CardProduct
}

type FormErrors = {
  email?: string
  contact?: string
  usdAmount?: string
}

const SERVICE_FEE_USD = 2.5
const FALLBACK_USD_CNY_RATE = 6.79

export function CardPurchaseDetail({ product }: CardPurchaseDetailProps) {
  const [usdAmount, setUsdAmount] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [contact, setContact] = React.useState("")
  const [note, setNote] = React.useState("")
  const [errors, setErrors] = React.useState<FormErrors>({})
  const [isPaying, setIsPaying] = React.useState(false)
  const [exchangeRate, setExchangeRate] = React.useState(FALLBACK_USD_CNY_RATE)
  const [rateUpdatedAt, setRateUpdatedAt] = React.useState<string | null>(null)
  const [rateStatus, setRateStatus] = React.useState<"loading" | "success" | "fallback">("loading")

  React.useEffect(() => {
    let isMounted = true

    const loadRate = async () => {
      try {
        const response = await fetch("https://open.er-api.com/v6/latest/USD", {
          cache: "no-store",
        })

        if (!response.ok) {
          throw new Error("Failed to load exchange rate")
        }

        const result = await response.json()
        const nextRate = Number(result?.rates?.CNY)

        if (!Number.isFinite(nextRate) || nextRate <= 0) {
          throw new Error("Invalid exchange rate")
        }

        if (!isMounted) return

        setExchangeRate(nextRate)
        setRateUpdatedAt(
          typeof result?.time_last_update_utc === "string"
            ? result.time_last_update_utc
            : null
        )
        setRateStatus("success")
      } catch (error) {
        console.error("Exchange rate load failed:", error)
        if (!isMounted) return

        setExchangeRate(FALLBACK_USD_CNY_RATE)
        setRateUpdatedAt(null)
        setRateStatus("fallback")
      }
    }

    loadRate()

    return () => {
      isMounted = false
    }
  }, [])

  const amountNumber = parseUsdAmount(usdAmount)
  const isValidAmount = Number.isFinite(amountNumber) && amountNumber > 0
  const checkoutUsd = isValidAmount ? amountNumber + SERVICE_FEE_USD : 0
  const checkoutCny = checkoutUsd * exchangeRate

  const handleSubmit = async () => {
    const nextErrors: FormErrors = {}

    if (!isValidAmount) {
      nextErrors.usdAmount = "请输入正确的美元面额"
    }

    if (!email.trim()) {
      nextErrors.email = "请输入接收邮箱"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = "请输入有效的邮箱地址"
    }

    if (!contact.trim()) {
      nextErrors.contact = "请输入微信、Telegram 或手机号"
    }

    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0 || isPaying || !isValidAmount) {
      return
    }

    setIsPaying(true)

    try {
      const summaryNote = [
        `卡种: ${product.name}`,
        `用户输入面额: ${amountNumber.toFixed(2)} USD`,
        `服务费: ${SERVICE_FEE_USD.toFixed(2)} USD`,
        `结算美元: ${checkoutUsd.toFixed(2)} USD`,
        `汇率 USD/CNY: ${exchangeRate.toFixed(4)}`,
        `结算人民币: ${checkoutCny.toFixed(2)} CNY`,
        note.trim() ? `用户备注: ${note.trim()}` : "",
      ]
        .filter(Boolean)
        .join(" | ")

      const response = await fetch("/api/payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: checkoutCny.toFixed(2),
          title: `${product.name} - ${amountNumber.toFixed(2)} USD`,
          serviceType: product.id,
          contactEmail: email.trim(),
          contactMethod: contact.trim(),
          customerNote: summaryNote,
        }),
      })

      const result = await response.json()

      if (!result.success) {
        alert(result.error || "支付创建失败")
        return
      }

      const div = document.createElement("div")
      div.innerHTML = result.payUrl
      document.body.appendChild(div)

      const script = div.querySelector("script")
      if (script) {
        eval(script.innerHTML)
      }
    } catch (error) {
      console.error("支付错误:", error)
      alert("支付接口异常，请稍后重试")
    } finally {
      setIsPaying(false)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-[760px] flex-col gap-4 xl:max-w-[720px]">
      <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_14px_32px_rgba(15,23,42,0.05)] sm:p-5">
        <div
          className={`rounded-[24px] bg-gradient-to-br ${product.accent} px-5 py-5 text-white sm:px-6 sm:py-6`}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="rounded-full bg-white/18 px-3 py-1 text-[11px] font-semibold tracking-[0.18em] text-white">
                {product.badge}
              </span>
              <h2 className="mt-3 text-[26px] font-semibold tracking-tight sm:text-[30px]">
                {product.name}
              </h2>
              <p className="mt-1.5 text-[13px] leading-5 text-white/80">
                {product.subtitle}
              </p>
            </div>
            <span className="rounded-full border border-white/20 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-white/80">
              Ready
            </span>
          </div>
          <div className="mt-4 rounded-[20px] bg-white/10 p-4 backdrop-blur-[2px]">
            <div className="relative h-[90px] w-full sm:h-[112px]">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-contain object-left"
                sizes="720px"
              />
            </div>
          </div>
          <div className="mt-5 grid gap-3 text-white/88 sm:grid-cols-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/60">
                输入美元
              </p>
              <p className="mt-1.5 text-[18px] font-semibold">
                {isValidAmount ? `${amountNumber.toFixed(2)} USD` : "--"}
              </p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/60">
                服务费
              </p>
              <p className="mt-1.5 text-[18px] font-semibold">
                {SERVICE_FEE_USD.toFixed(2)} USD
              </p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/60">
                结算美元
              </p>
              <p className="mt-1.5 text-[18px] font-semibold">
                {isValidAmount ? `${checkoutUsd.toFixed(2)} USD` : "--"}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-[20px] border border-slate-200 bg-slate-50 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
            卡片说明
          </p>
          <p className="mt-2.5 text-[13px] leading-6 text-slate-600">
            {product.description}
          </p>
          <div className="mt-3 space-y-1.5 text-[12px] text-slate-700">
            {product.features.map((feature) => (
              <div key={feature} className="flex items-center gap-2">
                <span className="text-[13px] text-green-600">✓</span>
                <span>{feature}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[12px] leading-5 text-slate-500">{product.purchaseNote}</p>
        </div>
      </div>

      <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_14px_32px_rgba(15,23,42,0.05)] sm:p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
              Purchase
            </p>
            <h2 className="mt-2 text-[24px] font-semibold tracking-tight text-slate-950">
              填写购买信息
            </h2>
          </div>
          <div className="rounded-full border border-slate-200 px-3 py-1.5 text-[11px] font-medium text-slate-500">
            {product.supportsSubscription ? "支持订阅" : "不支持软件订阅"}
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-2 block text-[12px] font-semibold text-slate-900">
              输入购买面额（USD）
            </label>
            <Input
              inputMode="decimal"
              value={usdAmount}
              onChange={(event) => {
                setUsdAmount(event.target.value)
                setErrors((prev) => ({ ...prev, usdAmount: undefined }))
              }}
              placeholder="例如 20"
              className="h-10 rounded-xl border-slate-200 bg-white text-[16px] text-slate-900 placeholder:text-slate-400 sm:text-[14px]"
            />
            <p className="mt-2 text-[11px] leading-5 text-slate-500">
              例如输入 20 USD，系统会按 22.50 USD 结算，再按汇率换算成人民币支付。
            </p>
            {errors.usdAmount && (
              <p className="mt-2 text-sm text-red-600">{errors.usdAmount}</p>
            )}
          </div>

          <div className="sm:col-span-1">
            <label className="mb-2 block text-[12px] font-semibold text-slate-900">
              接收邮箱
            </label>
            <Input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="h-10 rounded-xl border-slate-200 bg-white text-[16px] text-slate-900 placeholder:text-slate-400 sm:text-[14px]"
            />
            {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email}</p>}
          </div>

          <div className="sm:col-span-1">
            <label className="mb-2 block text-[12px] font-semibold text-slate-900">
              联系方式
            </label>
            <Input
              value={contact}
              onChange={(event) => setContact(event.target.value)}
              placeholder="微信 / Telegram / 手机号"
              className="h-10 rounded-xl border-slate-200 bg-white text-[16px] text-slate-900 placeholder:text-slate-400 sm:text-[14px]"
            />
            {errors.contact && (
              <p className="mt-2 text-sm text-red-600">{errors.contact}</p>
            )}
          </div>

          <div className="sm:col-span-2">
            <label className="mb-2 block text-[12px] font-semibold text-slate-900">
              备注信息
            </label>
            <Textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="可选，填写收卡时间要求或补充说明"
              className="min-h-[88px] rounded-[20px] border-slate-200 bg-white text-[16px] text-slate-900 placeholder:text-slate-400 sm:text-[14px]"
            />
          </div>
        </div>

        <div className="mt-5 rounded-[20px] border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between text-[12px] text-slate-500">
            <span>商品</span>
            <span className="text-right text-slate-900">{product.name}</span>
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[12px] text-slate-500">
            <span>输入面额</span>
            <span className="text-right text-slate-900">
              {isValidAmount ? `${amountNumber.toFixed(2)} USD` : "--"}
            </span>
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[12px] text-slate-500">
            <span>服务费</span>
            <span className="text-right text-slate-900">{SERVICE_FEE_USD.toFixed(2)} USD</span>
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[12px] text-slate-500">
            <span>结算美元</span>
            <span className="text-right text-slate-900">
              {isValidAmount ? `${checkoutUsd.toFixed(2)} USD` : "--"}
            </span>
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[12px] text-slate-500">
            <span>实时汇率</span>
            <span className="text-right text-slate-900">
              1 USD = {exchangeRate.toFixed(4)} CNY
            </span>
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[12px] text-slate-500">
            <span>汇率状态</span>
            <span className="text-right text-slate-900">
              {rateStatus === "loading"
                ? "汇率加载中"
                : rateStatus === "success"
                  ? "已更新"
                  : "使用备用汇率"}
            </span>
          </div>
          {rateUpdatedAt && (
            <div className="mt-2.5 flex items-center justify-between text-[12px] text-slate-500">
              <span>更新时间</span>
              <span className="text-right text-slate-900">{rateUpdatedAt}</span>
            </div>
          )}
          <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4">
            <span className="text-[13px] font-semibold text-slate-950">应付人民币</span>
            <span className="text-[24px] font-semibold tracking-tight text-slate-950">
              {isValidAmount ? `¥${checkoutCny.toFixed(2)}` : "--"}
            </span>
          </div>
        </div>

        <Button
          className="mt-5 h-11 w-full rounded-[18px] border-0 bg-[#1faa45] text-[15px] font-semibold text-white hover:bg-[#18973c]"
          onClick={handleSubmit}
          disabled={isPaying}
        >
          {isPaying ? "跳转支付中..." : "立即付款"}
        </Button>

        <p className="mt-3 text-[11px] leading-5 text-slate-500">
          付款完成后，卡号、礼品卡卡密或二维码会发送到你填写的邮箱。联系方式用于异常情况联系。
        </p>
      </div>
    </div>
  )
}

function parseUsdAmount(value: string) {
  const normalizedValue = value.replace(/[^\d.]/g, "")
  if (!normalizedValue) return Number.NaN
  return parseFloat(normalizedValue)
}
