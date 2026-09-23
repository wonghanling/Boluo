import "server-only"

const DEFAULT_BASE = "https://connect.relograde.com"
const DEFAULT_VERSION = "1.03"

export class RelogradeError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public body?: unknown,
  ) {
    super(message)
  }
}

function requireEnv(name: string): string {
  const raw = process.env[name]
  const value = raw ? raw.trim() : ""
  if (!value) throw new RelogradeError(`缺少环境变量 ${name}`, 500, "config")
  return value
}

function apiRoot(): string {
  const base = (process.env.RELOGRADE_BASE_URL || DEFAULT_BASE).replace(/\/$/, "")
  const version = process.env.RELOGRADE_API_VERSION || DEFAULT_VERSION
  return `${base}/api/${version}`
}

async function relogradeFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const key = requireEnv("RELOGRADE_API_KEY")
  const url = `${apiRoot()}${path}`
  const response = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${key}`,
      Accept: "application/json",
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...(init.headers || {}),
    },
    cache: "no-store",
  })

  if (response.status === 204) return undefined as T

  const text = await response.text()
  let json: unknown = null
  if (text) {
    try {
      json = JSON.parse(text)
    } catch {
      json = { raw: text }
    }
  }

  if (!response.ok) {
    const code =
      json && typeof json === "object" && "code" in json
        ? String((json as { code: string }).code)
        : undefined
    throw new RelogradeError(
      `Relograde ${response.status} ${path}`,
      response.status,
      code,
      json,
    )
  }

  return json as T
}

export type RelogradeProduct = {
  slug: string
  name: string
  faceValueAmount?: number | null
  faceValueCurrency?: string | null
  faceValueMin?: number | null
  faceValueMax?: number | null
  isStocked?: boolean
  priceAmount?: number | null
  priceCurrency?: string | null
  priceInclVat?: number | null
  vatAmount?: number | null
  feeVariable?: number | null
  feeFixed?: number | null
  feeCurrency?: string | null
  brandSlug?: string
  brandName?: string
  category?: string
  redeemType?: string
  isVariableProduct?: boolean
  paymentCurrency?: string
}

type Paged<T> = {
  data?: T[]
  metadata?: {
    page?: number
    pageSize?: number
    totalItems?: number
    totalPages?: number
  }
}

export type RelogradeFxRate = {
  currencyFrom: string
  currencyTo: string
  rate: number
}

export type RelogradeOrder = {
  trx: string
  priceCurrency?: string
  priceAmount?: number
  priceVat?: number
  priceInclVat?: number
  orderStatus?: string
  paymentStatus?: string
  reference?: string
  items?: Array<{
    productSlug?: string
    faceValueAmount?: number
    faceValueCurrency?: string
    totalPriceInclVat?: number
    priceCurrency?: string
    totalPriceInclVatInPaymentCurrency?: number
    paymentCurrency?: string
    orderLines?: RelogradeOrderLine[]
  }>
}

export type RelogradeOrderLine = {
  tag?: string
  status?: string
  voucherCode?: string | null
  voucherSerial?: string | null
  voucherUrl?: string | null
  voucherDateExpired?: string | null
  token?: string | null
  redemptionLink?: string | null
  productSlug?: string
  productFacevalueAmount?: number
  productFacevalueCurrency?: string
}

export async function listProducts(params: {
  brandSlug?: string
  slug?: string
  paymentCurrency?: string
  limit?: number
  page?: number
}): Promise<Paged<RelogradeProduct>> {
  const search = new URLSearchParams()
  if (params.brandSlug) search.set("brandSlug", params.brandSlug)
  if (params.slug) search.set("slug", params.slug)
  if (params.paymentCurrency) search.set("paymentCurrency", params.paymentCurrency)
  search.set("limit", String(params.limit ?? 50))
  if (params.page) search.set("page", String(params.page))
  return relogradeFetch(`/product?${search.toString()}`)
}

export async function getFxRates(): Promise<RelogradeFxRate[]> {
  const result = await relogradeFetch<{ fxRates?: RelogradeFxRate[] }>("/fx-rate")
  return result.fxRates ?? []
}

export async function createOrder(input: {
  items: Array<{ productSlug: string; amount: number; faceValue?: number }>
  paymentCurrency: string
  reference?: string
}): Promise<RelogradeOrder> {
  return relogradeFetch("/order", {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export async function confirmOrder(trx: string): Promise<RelogradeOrder> {
  return relogradeFetch(`/order/confirm/${encodeURIComponent(trx)}`, {
    method: "PATCH",
  })
}

export async function resolveOrder(trx: string): Promise<RelogradeOrder> {
  return relogradeFetch(`/order/resolve/${encodeURIComponent(trx)}`, {
    method: "PATCH",
  })
}

export async function findOrder(trx: string): Promise<RelogradeOrder> {
  return relogradeFetch(`/order/${encodeURIComponent(trx)}`)
}

export async function cancelOrder(trx: string): Promise<void> {
  await relogradeFetch(`/order/cancel/${encodeURIComponent(trx)}`, {
    method: "PATCH",
  })
}

export function extractVoucher(order: RelogradeOrder): {
  voucherCode: string | null
  voucherSerial: string | null
  redemptionLink: string | null
  voucherExpiresAt: string | null
} {
  const lines = order.items?.flatMap((item) => item.orderLines ?? []) ?? []
  const line = lines.find((entry) => entry.status === "finished") ?? lines[0]
  return {
    voucherCode: line?.voucherCode || line?.token || null,
    voucherSerial: line?.voucherSerial || null,
    redemptionLink: line?.redemptionLink || line?.voucherUrl || null,
    voucherExpiresAt: line?.voucherDateExpired || null,
  }
}
