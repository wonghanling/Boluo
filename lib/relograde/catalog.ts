import { getFxRates, listProducts, type RelogradeProduct } from "./client"
import { estimateNewCardLoad, sellPriceCny } from "./pricing"
import { RELOGRADE_BRANDS, isRelogradeBrand, type RelogradeBrandId } from "./catalog-public"

export { RELOGRADE_BRANDS, isRelogradeBrand }
export type { RelogradeBrandId }

const productCache = new Map<string, { expiresAt: number; products: RelogradeProduct[] }>()
const fxCache: { expiresAt: number; usdTo: Record<string, number> } = {
  expiresAt: 0,
  usdTo: {},
}

const PRODUCT_TTL_MS = 5 * 60 * 1000
const FX_TTL_MS = 8 * 60 * 1000

export async function getUsdRates(): Promise<Record<string, number>> {
  if (Date.now() < fxCache.expiresAt && Object.keys(fxCache.usdTo).length > 0) {
    return fxCache.usdTo
  }
  const rates = await getFxRates()
  const usdTo: Record<string, number> = { USD: 1 }
  for (const row of rates) {
    if (row.currencyFrom?.toUpperCase() !== "USD") continue
    const to = row.currencyTo?.toUpperCase()
    if (!to || !Number.isFinite(row.rate) || row.rate <= 0) continue
    usdTo[to] = row.rate
  }
  fxCache.usdTo = usdTo
  fxCache.expiresAt = Date.now() + FX_TTL_MS
  return usdTo
}

export function convertToUsd(amount: number, currency: string, usdTo: Record<string, number>): number {
  const code = currency.toUpperCase()
  if (code === "USD") return amount
  const rate = usdTo[code]
  if (!rate) throw new Error(`缺少 ${code} 汇率`)
  return amount / rate
}

export function convertToCny(amount: number, currency: string, usdTo: Record<string, number>): number {
  const usd = convertToUsd(amount, currency, usdTo)
  const cny = usdTo.CNY
  if (!cny) throw new Error("缺少 CNY 汇率")
  return usd * cny
}

export async function getBrandProducts(brandId: RelogradeBrandId): Promise<RelogradeProduct[]> {
  const cached = productCache.get(brandId)
  if (cached && Date.now() < cached.expiresAt) return cached.products

  const brand = RELOGRADE_BRANDS[brandId]
  const page = await listProducts({
    brandSlug: brand.brandSlug,
    paymentCurrency: brand.paymentCurrencyDefault,
    limit: 50,
  })
  const products = (page.data ?? []).filter((item) => item.isStocked !== false)
  productCache.set(brandId, { expiresAt: Date.now() + PRODUCT_TTL_MS, products })
  return products
}

export function invalidateRelogradeCache(slugs?: string[]) {
  if (!slugs || slugs.length === 0) {
    productCache.clear()
    fxCache.expiresAt = 0
    return
  }
  const hit = slugs.some((slug) => slug.startsWith("rewarble-visa") || slug.startsWith("rewarble-mastercard"))
  if (hit) productCache.clear()
}

export type CatalogOption = {
  productSlug: string
  label: string
  currency: string
  faceValue: number | null
  isVariable: boolean
  min: number | null
  max: number | null
  inStock: boolean
}

export function toCatalogOptions(products: RelogradeProduct[], currency: string): CatalogOption[] {
  const wanted = currency.toUpperCase()
  const matched = products.filter((product) => {
    const code = (product.faceValueCurrency || "").toUpperCase()
    return code === wanted
  })

  const fixed = matched
    .filter((product) => !product.isVariableProduct && typeof product.faceValueAmount === "number")
    .sort((a, b) => Number(a.faceValueAmount) - Number(b.faceValueAmount))
    .map((product) => ({
      productSlug: product.slug,
      label: `${wanted} ${Number(product.faceValueAmount)}`,
      currency: wanted,
      faceValue: Number(product.faceValueAmount),
      isVariable: false,
      min: Number(product.faceValueAmount),
      max: Number(product.faceValueAmount),
      inStock: product.isStocked !== false,
    }))

  const variable = matched
    .filter((product) => product.isVariableProduct)
    .map((product) => ({
      productSlug: product.slug,
      label: `自定义 ${wanted} ${product.faceValueMin ?? 30}–${product.faceValueMax ?? 1000}`,
      currency: wanted,
      faceValue: null,
      isVariable: true,
      min: product.faceValueMin ?? 30,
      max: product.faceValueMax ?? 1000,
      inStock: product.isStocked !== false,
    }))

  return [...fixed, ...variable]
}

export function findProductForQuote(
  products: RelogradeProduct[],
  currency: string,
  faceValue: number,
  preferVariable: boolean,
): RelogradeProduct | null {
  const wanted = currency.toUpperCase()
  const inCurrency = products.filter(
    (product) => (product.faceValueCurrency || "").toUpperCase() === wanted,
  )

  if (!preferVariable) {
    const exact = inCurrency.find(
      (product) =>
        !product.isVariableProduct && Number(product.faceValueAmount) === Number(faceValue),
    )
    if (exact) return exact
  }

  const variable = inCurrency.find((product) => {
    if (!product.isVariableProduct) return false
    const min = product.faceValueMin ?? 0
    const max = product.faceValueMax ?? Number.POSITIVE_INFINITY
    return faceValue >= min && faceValue <= max
  })
  return variable ?? null
}

export function computeCost(product: RelogradeProduct, faceValue: number): {
  costAmount: number
  costCurrency: string
} {
  if (product.isVariableProduct) {
    const feeVariable = Number(product.feeVariable ?? 1)
    const feeFixed = Number(product.feeFixed ?? 0)
    return {
      costAmount: Number((faceValue * feeVariable + feeFixed).toFixed(4)),
      costCurrency: (product.feeCurrency || product.faceValueCurrency || "usd").toUpperCase(),
    }
  }

  return {
    costAmount: Number(product.priceInclVat ?? product.priceAmount ?? 0),
    costCurrency: (product.priceCurrency || product.faceValueCurrency || "usd").toUpperCase(),
  }
}

export type QuoteResult = {
  brandId: RelogradeBrandId
  productSlug: string
  isVariable: boolean
  faceValue: number
  faceValueCurrency: string
  costAmount: number
  costCurrency: string
  costCny: number
  costCnyBuffered: number
  sellCny: number
  profitCny: number
  marginRate: number
  usdCny: number
  faceUsd: number
  inStock: boolean
  estimatedNewCardRemaining: number
  estimatedNewCardFeeUsd: number
}

export async function quoteBrandProduct(input: {
  brandId: RelogradeBrandId
  currency: string
  faceValue: number
  preferVariable?: boolean
}): Promise<QuoteResult> {
  const faceValue = Number(input.faceValue)
  if (!Number.isFinite(faceValue) || faceValue <= 0) {
    throw new Error("面额无效")
  }

  const [products, usdTo] = await Promise.all([
    getBrandProducts(input.brandId),
    getUsdRates(),
  ])
  const product = findProductForQuote(
    products,
    input.currency,
    faceValue,
    Boolean(input.preferVariable),
  )
  if (!product) {
    throw new Error("没有匹配的在售商品")
  }

  const { costAmount, costCurrency } = computeCost(product, faceValue)
  if (!costAmount || costAmount <= 0) {
    throw new Error("无法读取进价")
  }

  const costCny = convertToCny(costAmount, costCurrency, usdTo)
  const faceUsd = convertToUsd(faceValue, input.currency, usdTo)
  const priced = sellPriceCny(costCny, faceUsd)
  const estimate = estimateNewCardLoad(faceValue, input.currency)

  return {
    brandId: input.brandId,
    productSlug: product.slug,
    isVariable: Boolean(product.isVariableProduct),
    faceValue,
    faceValueCurrency: input.currency.toUpperCase(),
    costAmount,
    costCurrency,
    costCny: Number(costCny.toFixed(4)),
    costCnyBuffered: priced.costCnyBuffered,
    sellCny: priced.sellCny,
    profitCny: priced.profitCny,
    marginRate: priced.marginRate,
    usdCny: usdTo.CNY,
    faceUsd: Number(faceUsd.toFixed(4)),
    inStock: product.isStocked !== false,
    estimatedNewCardRemaining: estimate.remainingFace,
    estimatedNewCardFeeUsd: estimate.feeAmount,
  }
}
