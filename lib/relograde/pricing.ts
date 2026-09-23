export const FX_BUFFER = 1.02
export const PROFIT_FLOOR_CNY = 25

export type MarginTier = {
  minUsd: number
  maxUsd: number | null
  rate: number
}

/** 面额折美元后的毛利率分档（不含保底）。 */
export const MARGIN_TIERS: MarginTier[] = [
  { minUsd: 0, maxUsd: 80, rate: 0.08 },
  { minUsd: 80, maxUsd: 200, rate: 0.05 },
  { minUsd: 200, maxUsd: null, rate: 0.03 },
]

export function marginRateForFaceUsd(faceUsd: number): number {
  if (!Number.isFinite(faceUsd) || faceUsd <= 0) return MARGIN_TIERS[0].rate
  for (const tier of MARGIN_TIERS) {
    const underMax = tier.maxUsd === null || faceUsd <= tier.maxUsd
    if (faceUsd >= tier.minUsd && underMax) return tier.rate
  }
  return MARGIN_TIERS[MARGIN_TIERS.length - 1].rate
}

export function roundUpCny(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 0
  return Math.ceil(value - 1e-9)
}

export function sellPriceCny(costCny: number, faceUsd: number): {
  sellCny: number
  profitCny: number
  marginRate: number
  costCnyBuffered: number
} {
  const costCnyBuffered = costCny * FX_BUFFER
  const marginRate = marginRateForFaceUsd(faceUsd)
  const byPercent = costCnyBuffered * (1 + marginRate)
  const byFloor = costCnyBuffered + PROFIT_FLOOR_CNY
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
