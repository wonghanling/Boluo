export const FX_BUFFER = 1.02

/** 虚拟卡（Visa/Mastercard）保底毛利，礼品卡另有更低保底。 */
export const PROFIT_FLOOR_CNY = 25
/** 礼品卡保底毛利：比上游进价高这个数就够了。 */
export const GIFTCARD_PROFIT_FLOOR_CNY = 10

export type PricingKind = "paymentcard" | "giftcard"

export type MarginTier = {
  minUsd: number
  maxUsd: number | null
  rate: number
}

/** 虚拟卡：面额折美元后的毛利率分档（不含保底）。 */
export const MARGIN_TIERS: MarginTier[] = [
  { minUsd: 0, maxUsd: 80, rate: 0.08 },
  { minUsd: 80, maxUsd: 200, rate: 0.05 },
  { minUsd: 200, maxUsd: null, rate: 0.03 },
]

/** 礼品卡：国内比价激烈，进价本身贴着面额，毛利率压低。 */
export const GIFTCARD_MARGIN_TIERS: MarginTier[] = [
  { minUsd: 0, maxUsd: 80, rate: 0.04 },
  { minUsd: 80, maxUsd: 200, rate: 0.03 },
  { minUsd: 200, maxUsd: null, rate: 0.025 },
]

function tiersFor(kind: PricingKind): MarginTier[] {
  return kind === "giftcard" ? GIFTCARD_MARGIN_TIERS : MARGIN_TIERS
}

function floorFor(kind: PricingKind): number {
  return kind === "giftcard" ? GIFTCARD_PROFIT_FLOOR_CNY : PROFIT_FLOOR_CNY
}

export function marginRateForFaceUsd(faceUsd: number, kind: PricingKind = "paymentcard"): number {
  const tiers = tiersFor(kind)
  if (!Number.isFinite(faceUsd) || faceUsd <= 0) return tiers[0].rate
  for (const tier of tiers) {
    const underMax = tier.maxUsd === null || faceUsd <= tier.maxUsd
    if (faceUsd >= tier.minUsd && underMax) return tier.rate
  }
  return tiers[tiers.length - 1].rate
}

export function roundUpCny(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 0
  return Math.ceil(value - 1e-9)
}

export function sellPriceCny(
  costCny: number,
  faceUsd: number,
  kind: PricingKind = "paymentcard",
): {
  sellCny: number
  profitCny: number
  marginRate: number
  costCnyBuffered: number
} {
  const costCnyBuffered = costCny * FX_BUFFER
  const marginRate = marginRateForFaceUsd(faceUsd, kind)
  const byPercent = costCnyBuffered * (1 + marginRate)
  const byFloor = costCnyBuffered + floorFor(kind)
  const sellCny = roundUpCny(Math.max(byPercent, byFloor))
  return {
    sellCny,
    profitCny: Number((sellCny - costCnyBuffered).toFixed(2)),
    marginRate,
    costCnyBuffered: Number(costCnyBuffered.toFixed(4)),
  }
}

/** Rewarble 开新卡估算：从面额扣 $3.49 + 5.5%。EUR 面额按同百分比估算，固定费按美元。 */
export function estimateNewCardLoad(faceValue: number, currency: string): {
  feeAmount: number
  feeCurrency: "USD"
  remainingFace: number
  remainingCurrency: string
} {
  const percent = faceValue * 0.055
  const fixed = 3.49
  const feeAmount = Number((fixed + percent).toFixed(2))
  const remainingFace = Number((faceValue - feeAmount).toFixed(2))
  return {
    feeAmount,
    feeCurrency: "USD",
    remainingFace,
    remainingCurrency: currency.toUpperCase(),
  }
}
