"use client"

import * as React from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { CardProduct, CountryPurchaseRule, FixedPurchaseOption } from "@/content/cards"
import { getCardTheme } from "@/lib/card-theme"

type CardPurchaseDetailProps = {
  product: CardProduct
}

type FormErrors = {
  country?: string
  amount?: string
  option?: string
  email?: string
  contact?: string
}

const SERVICE_FEE_USD = 2
const FALLBACK_USD_CNY_RATE = 6.79
const FALLBACK_BASE_RATES: Record<string, number> = {
  USD: 1,
  EUR: 1.09,
  CAD: 0.73,
  TRY: 0.031,
  BRL: 0.19,
  GBP: 1.27,
  PLN: 0.25,
  SEK: 0.094,
  AUD: 0.66,
  DKK: 0.145,
  HKD: 0.128,
  IDR: 0.000061,
  INR: 0.012,
  PHP: 0.018,
  SGD: 0.74,
  TWD: 0.031,
  VND: 0.000039,
}

const COUNTRY_NAME_ZH: Record<string, string> = {
  AT: "奥地利",
  AU: "澳大利亚",
  BR: "巴西",
  CA: "加拿大",
  DE: "德国",
  DK: "丹麦",
  ES: "西班牙",
  FI: "芬兰",
  FR: "法国",
  GB: "英国",
  GR: "希腊",
  HK: "中国香港",
  ID: "印度尼西亚",
  IE: "爱尔兰",
  IN: "印度",
  IT: "意大利",
  NL: "荷兰",
  PH: "菲律宾",
  PL: "波兰",
  PT: "葡萄牙",
  SE: "瑞典",
  SG: "新加坡",
  TR: "土耳其",
  TW: "中国台湾",
  US: "美国",
  VN: "越南",
}

function getDetailImageClass(productId: string) {
  if (productId === "paypal") {
    return "object-left object-center scale-[0.94]"
  }

  if (productId === "steam") {
    return "object-left object-center scale-[0.84]"
  }

  return "object-left"
}

function formatMoney(value: number, currency: string) {
  if (!Number.isFinite(value)) return "--"
  return `${value.toFixed(2)} ${currency}`
}

function formatCountryLabel(country?: CountryPurchaseRule) {
  if (!country) return "--"
  const zhName = COUNTRY_NAME_ZH[country.code]
  return zhName ? `${zhName} / ${country.name}` : country.name
}

function parseAmount(value: string) {
  const normalizedValue = value.replace(/[^\d.]/g, "")
  if (!normalizedValue) return Number.NaN
  return parseFloat(normalizedValue)
}

function getOptionAmount(option: FixedPurchaseOption | null, customAmount: string) {
  if (!option) return Number.NaN
  if (option.requiresCustomAmount) {
    return parseAmount(customAmount)
  }
  return typeof option.amount === "number" ? option.amount : Number.NaN
}

function isValidForCountry(
  value: number,
  country?: CountryPurchaseRule,
  option?: FixedPurchaseOption | null
) {
  if (!country || !Number.isFinite(value)) return false

  if (country.mode === "input") {
    if (typeof country.min === "number" && value < country.min) return false
    if (typeof country.max === "number" && value > country.max) return false
    return value > 0
  }

  if (country.mode === "fixed") {
    return true
  }

  if (!option) return false

  if (option.requiresCustomAmount) {
    if (typeof option.min === "number" && value < option.min) return false
    if (typeof option.max === "number" && value > option.max) return false
    return value > 0
  }

  return true
}

function getSelectedLabel(option: FixedPurchaseOption | null, amount: number, currency: string) {
  if (option?.requiresCustomAmount && Number.isFinite(amount)) {
    return `${option.label}: ${formatMoney(amount, currency)}`
  }

  if (option?.label) {
    return option.label
  }

  if (Number.isFinite(amount)) {
    return formatMoney(amount, currency)
  }

  return "--"
}

export function CardPurchaseDetail({ product }: CardPurchaseDetailProps) {
  const [selectedCountryCode, setSelectedCountryCode] = React.useState(
    product.purchaseRule.countries[0]?.code ?? ""
  )
  const [customAmount, setCustomAmount] = React.useState("")
  const [selectedOptionLabel, setSelectedOptionLabel] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [contact, setContact] = React.useState("")
  const [note, setNote] = React.useState("")
  const [errors, setErrors] = React.useState<FormErrors>({})
  const [isPaying, setIsPaying] = React.useState(false)
  const [exchangeRate, setExchangeRate] = React.useState(FALLBACK_USD_CNY_RATE)
  const [currencyToUsdRates, setCurrencyToUsdRates] = React.useState<Record<string, number>>(
    FALLBACK_BASE_RATES
  )
  const [rateUpdatedAt, setRateUpdatedAt] = React.useState<string | null>(null)
  const [rateStatus, setRateStatus] = React.useState<"loading" | "success" | "fallback">(
    "loading"
  )

  const theme = getCardTheme(product.id)
  const selectedCountry =
    product.purchaseRule.countries.find((country) => country.code === selectedCountryCode) ??
    product.purchaseRule.countries[0]
  const selectedOption =
    selectedCountry?.options?.find((option) => option.label === selectedOptionLabel) ?? null
  const isOptionCustom = Boolean(selectedOption?.requiresCustomAmount)

  React.useEffect(() => {
    const nextCountry =
      product.purchaseRule.countries.find((country) => country.code === selectedCountryCode) ??
      product.purchaseRule.countries[0]

    setSelectedOptionLabel(nextCountry?.options?.[0]?.label ?? "")
    setCustomAmount("")
    setErrors((prev) => ({ ...prev, country: undefined, amount: undefined, option: undefined }))
  }, [product.purchaseRule.countries, selectedCountryCode])

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
        const nextCnyRate = Number(result?.rates?.CNY)

        if (!Number.isFinite(nextCnyRate) || nextCnyRate <= 0) {
          throw new Error("Invalid CNY exchange rate")
        }

        const nextRates = { ...FALLBACK_BASE_RATES }
        Object.keys(nextRates).forEach((currency) => {
          if (currency === "USD") return
          const rateValue = Number(result?.rates?.[currency])
          if (Number.isFinite(rateValue) && rateValue > 0) {
            nextRates[currency] = 1 / rateValue
          }
        })

        if (!isMounted) return

        setExchangeRate(nextCnyRate)
        setCurrencyToUsdRates(nextRates)
        setRateUpdatedAt(
          typeof result?.time_last_update_utc === "string" ? result.time_last_update_utc : null
        )
        setRateStatus("success")
      } catch (error) {
        console.error("Exchange rate load failed:", error)
        if (!isMounted) return

        setExchangeRate(FALLBACK_USD_CNY_RATE)
        setCurrencyToUsdRates(FALLBACK_BASE_RATES)
        setRateUpdatedAt(null)
        setRateStatus("fallback")
      }
    }

    loadRate()

    return () => {
      isMounted = false
    }
  }, [])

  const inputAmount =
    selectedCountry?.mode === "input"
      ? parseAmount(customAmount)
      : getOptionAmount(selectedOption, customAmount)
  const isAmountValid = isValidForCountry(inputAmount, selectedCountry, selectedOption)
  const baseCurrency = selectedCountry?.currency ?? "USD"
  const currencyToUsdRate =
    currencyToUsdRates[baseCurrency] ?? FALLBACK_BASE_RATES[baseCurrency] ?? 1
  const baseAmountUsd = isAmountValid ? inputAmount * currencyToUsdRate : 0
  const checkoutUsd = isAmountValid ? baseAmountUsd + SERVICE_FEE_USD : 0
  const checkoutCny = checkoutUsd * exchangeRate
  const selectedDisplayLabel = getSelectedLabel(selectedOption, inputAmount, baseCurrency)

  const handleSubmit = async () => {
    const nextErrors: FormErrors = {}

    if (product.purchaseRule.requiresCountrySelection && !selectedCountry) {
      nextErrors.country = "请选择国家或地区"
    }

    if (!selectedCountry) {
      nextErrors.country = "缺少国家配置"
    } else if (
      (selectedCountry.mode === "fixed" || selectedCountry.mode === "hybrid") &&
      !selectedOption
    ) {
      nextErrors.option = "请选择面额或商品"
    } else if (!isAmountValid) {
      if (selectedCountry.mode === "input") {
        nextErrors.amount = `请输入 ${selectedCountry.currency} ${selectedCountry.min} - ${selectedCountry.max} 范围内的金额`
      } else if (selectedOption?.requiresCustomAmount) {
        nextErrors.amount = `请输入 ${selectedCountry.currency} ${selectedOption.min} - ${selectedOption.max} 范围内的金额`
      }
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

    if (Object.keys(nextErrors).length > 0 || isPaying || !selectedCountry || !isAmountValid) {
      return
    }

    setIsPaying(true)

    try {
      const summaryNote = [
        `卡种: ${product.name}`,
        `国家: ${formatCountryLabel(selectedCountry)}`,
        `币种: ${selectedCountry.currency}`,
        `面额或商品: ${selectedDisplayLabel}`,
        `用户金额: ${inputAmount.toFixed(2)} ${selectedCountry.currency}`,
        `折算美元: ${baseAmountUsd.toFixed(2)} USD`,
        `服务费: ${SERVICE_FEE_USD.toFixed(2)} USD`,
        `结算美元: ${checkoutUsd.toFixed(2)} USD`,
        `汇率 USD/CNY: ${exchangeRate.toFixed(4)}`,
        `结算人民币: ${checkoutCny.toFixed(2)} CNY`,
        note.trim() ? `备注: ${note.trim()}` : "",
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
          title: `${product.name} - ${formatCountryLabel(selectedCountry)}`,
          serviceType: product.id,
          contactEmail: email.trim(),
          contactMethod: contact.trim(),
          customerNote: summaryNote,
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
      if (script) {
        eval(script.innerHTML)
      }
    } catch (error) {
      console.error("支付错误:", error)
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
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                theme.overlayHighlight === "none"
                  ? "linear-gradient(145deg,rgba(255,255,255,0.08),rgba(15,23,42,0.18))"
                  : `${theme.overlayHighlight},linear-gradient(145deg,rgba(255,255,255,0.08),rgba(15,23,42,0.18))`,
            }}
          />
          <div
            className="absolute -left-14 top-0 h-40 w-40 rounded-full blur-3xl"
            style={{ backgroundColor: theme.glowA }}
          />
          <div
            className="absolute right-[-30px] top-10 h-36 w-36 rounded-full blur-3xl"
            style={{ backgroundColor: theme.glowB }}
          />
          <div className="absolute -bottom-16 left-1/3 h-40 w-40 rounded-full bg-slate-950/24 blur-3xl" />

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

            <span className="rounded-full border border-white/20 bg-white/8 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-white/84 backdrop-blur-sm">
              准备发货
            </span>
          </div>

          <div className="relative z-10 mt-4 h-[90px] w-full sm:h-[112px]">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className={`object-contain ${getDetailImageClass(product.id)} drop-shadow-[0_16px_30px_rgba(15,23,42,0.28)]`}
              style={{ filter: theme.logoFilter }}
              sizes="720px"
            />
          </div>

          <div className="relative z-10 mt-5 grid gap-3 text-white/90 sm:grid-cols-3">
            <div
              className="rounded-[18px] px-3.5 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-sm"
              style={{ backgroundColor: theme.statsBackground }}
            >
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/62">已选内容</p>
              <p className="mt-1.5 text-[18px] font-semibold">{selectedDisplayLabel}</p>
            </div>

            <div
              className="rounded-[18px] px-3.5 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-sm"
              style={{ backgroundColor: theme.statsBackground }}
            >
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/62">服务费</p>
              <p className="mt-1.5 text-[18px] font-semibold">{SERVICE_FEE_USD.toFixed(2)} USD</p>
            </div>

            <div
              className="rounded-[18px] px-3.5 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-sm"
              style={{ backgroundColor: theme.statsBackground }}
            >
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/62">结算美元</p>
              <p className="mt-1.5 text-[18px] font-semibold">
                {isAmountValid ? `${checkoutUsd.toFixed(2)} USD` : "--"}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-[20px] border border-slate-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(241,245,249,0.98))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
            卡片说明
          </p>
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

      <div className="rounded-[28px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-4 shadow-[0_20px_50px_rgba(15,23,42,0.06)] sm:p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
              购买信息
            </p>
            <h2 className="mt-2 text-[24px] font-semibold tracking-tight text-slate-950">
              填写购买信息
            </h2>
          </div>
          <div className="rounded-full border border-slate-200 bg-white/90 px-3 py-1.5 text-[11px] font-medium text-slate-500">
            {product.supportsSubscription ? "支持订阅" : "不支持订阅"}
          </div>
        </div>

        <div className="mt-3 rounded-[18px] border border-slate-200 bg-white/80 px-4 py-3 text-[12px] leading-5 text-slate-600">
          当前商品为 <span className="font-semibold text-slate-950">{product.name}</span>。
          {product.purchaseRule.requiresCountrySelection
            ? " 请先选择国家或地区，再根据规则选择商品、固定面值或输入金额。"
            : " 当前商品无需选择国家，直接输入金额并填写联系方式即可。"}
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {product.purchaseRule.requiresCountrySelection && selectedCountry && (
            <div className="sm:col-span-2">
              <label className="mb-2 block text-[12px] font-semibold text-slate-900">
                选择国家 / 地区
              </label>
              <select
                value={selectedCountryCode}
                onChange={(event) => setSelectedCountryCode(event.target.value)}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-[14px] text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300"
              >
                {product.purchaseRule.countries.map((country) => (
                  <option key={country.code} value={country.code}>
                    {formatCountryLabel(country)} ({country.currency})
                  </option>
                ))}
              </select>
              {errors.country && <p className="mt-2 text-sm text-red-600">{errors.country}</p>}
            </div>
          )}

          {(selectedCountry?.mode === "fixed" || selectedCountry?.mode === "hybrid") && (
            <div className="sm:col-span-2">
              <label className="mb-2 block text-[12px] font-semibold text-slate-900">
                选择面额 / 商品
              </label>
              <select
                value={selectedOptionLabel}
                onChange={(event) => {
                  setSelectedOptionLabel(event.target.value)
                  setCustomAmount("")
                  setErrors((prev) => ({ ...prev, option: undefined, amount: undefined }))
                }}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-[14px] text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300"
              >
                {(selectedCountry?.options ?? []).map((option) => (
                  <option key={option.label} value={option.label}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-[11px] leading-5 text-slate-500">
                {selectedCountry.mode === "hybrid"
                  ? "当前国家同时支持固定商品和部分自定义金额商品。请先选择商品，再按规则输入金额。"
                  : "当前国家使用固定面额或固定商品，不显示自定义金额输入框。"}
              </p>
              {errors.option && <p className="mt-2 text-sm text-red-600">{errors.option}</p>}
            </div>
          )}

          {(selectedCountry?.mode === "input" || isOptionCustom) && (
            <div className="sm:col-span-2">
              <label className="mb-2 block text-[12px] font-semibold text-slate-900">
                输入金额（{selectedCountry?.currency}）
              </label>
              <Input
                inputMode="decimal"
                value={customAmount}
                onChange={(event) => {
                  setCustomAmount(event.target.value)
                  setErrors((prev) => ({ ...prev, amount: undefined }))
                }}
                placeholder={
                  selectedCountry?.mode === "input"
                    ? `范围 ${selectedCountry.min} - ${selectedCountry.max}`
                    : `范围 ${selectedOption?.min} - ${selectedOption?.max}`
                }
                className="h-10 rounded-xl border-slate-200 bg-white text-[16px] text-slate-900 placeholder:text-slate-400 sm:text-[14px]"
              />
              <p className="mt-2 text-[11px] leading-5 text-slate-500">
                当前金额会先折算成 USD，再加固定 {SERVICE_FEE_USD.toFixed(2)} USD 服务费，最后换算成人民币结算。
              </p>
              {errors.amount && <p className="mt-2 text-sm text-red-600">{errors.amount}</p>}
            </div>
          )}

          <div className="sm:col-span-1">
            <label className="mb-2 block text-[12px] font-semibold text-slate-900">
              接收邮箱
            </label>
            <Input
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value)
                setErrors((prev) => ({ ...prev, email: undefined }))
              }}
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
              onChange={(event) => {
                setContact(event.target.value)
                setErrors((prev) => ({ ...prev, contact: undefined }))
              }}
              placeholder="微信 / Telegram / 手机号"
              className="h-10 rounded-xl border-slate-200 bg-white text-[16px] text-slate-900 placeholder:text-slate-400 sm:text-[14px]"
            />
            {errors.contact && <p className="mt-2 text-sm text-red-600">{errors.contact}</p>}
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

        <div className="mt-5 rounded-[20px] border border-slate-200 bg-[linear-gradient(180deg,rgba(255,255,255,1),rgba(248,250,252,1))] p-4">
          <div className="flex items-center justify-between text-[12px] text-slate-500">
            <span>商品</span>
            <span className="text-right text-slate-900">{product.name}</span>
          </div>
          {selectedCountry && (
            <div className="mt-2.5 flex items-center justify-between text-[12px] text-slate-500">
              <span>国家 / 地区</span>
              <span className="text-right text-slate-900">
                {formatCountryLabel(selectedCountry)} ({selectedCountry.currency})
              </span>
            </div>
          )}
          <div className="mt-2.5 flex items-center justify-between text-[12px] text-slate-500">
            <span>{selectedCountry?.mode === "input" ? "输入金额" : "面额 / 商品"}</span>
            <span className="text-right text-slate-900">{selectedDisplayLabel}</span>
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[12px] text-slate-500">
            <span>折算美元</span>
            <span className="text-right text-slate-900">
              {isAmountValid ? `${baseAmountUsd.toFixed(2)} USD` : "--"}
            </span>
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[12px] text-slate-500">
            <span>服务费</span>
            <span className="text-right text-slate-900">{SERVICE_FEE_USD.toFixed(2)} USD</span>
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[12px] text-slate-500">
            <span>结算美元</span>
            <span className="text-right text-slate-900">
              {isAmountValid ? `${checkoutUsd.toFixed(2)} USD` : "--"}
            </span>
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[12px] text-slate-500">
            <span>实时汇率</span>
            <span className="text-right text-slate-900">1 USD = {exchangeRate.toFixed(4)} CNY</span>
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
              {isAmountValid ? `¥${checkoutCny.toFixed(2)}` : "--"}
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
