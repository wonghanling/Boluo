export const REGION_LABELS: Record<string, string> = {
  ae: "阿联酋",
  at: "奥地利",
  be: "比利时",
  br: "巴西",
  ca: "加拿大",
  ch: "瑞士",
  de: "德国",
  es: "西班牙",
  fi: "芬兰",
  fr: "法国",
  gb: "英国",
  gr: "希腊",
  ie: "爱尔兰",
  in: "印度",
  it: "意大利",
  jp: "日本",
  nl: "荷兰",
  pl: "波兰",
  pt: "葡萄牙",
  sa: "沙特",
  se: "瑞典",
  tr: "土耳其",
  us: "美国",
}

export const RELOGRADE_BRANDS = {
  visa: {
    id: "visa",
    brandSlug: "rewarble-visa",
    paymentCurrencyDefault: "USD",
    currencies: ["USD"] as const,
    groupedByRegion: false,
    showRewarbleFees: true,
    pricingKind: "paymentcard",
  },
  mastercard: {
    id: "mastercard",
    brandSlug: "rewarble-mastercard",
    paymentCurrencyDefault: "USD",
    currencies: ["USD", "EUR"] as const,
    groupedByRegion: false,
    showRewarbleFees: true,
    pricingKind: "paymentcard",
  },
  "apple-gift-card": {
    id: "apple-gift-card",
    brandSlug: "apple",
    paymentCurrencyDefault: "EUR",
    currencies: [] as const,
    groupedByRegion: true,
    showRewarbleFees: false,
    pricingKind: "giftcard",
  },
  "google-play": {
    id: "google-play",
    brandSlug: "google",
    paymentCurrencyDefault: "EUR",
    currencies: [] as const,
    groupedByRegion: true,
    showRewarbleFees: false,
    pricingKind: "giftcard",
  },
} as const

export type RelogradeBrandId = keyof typeof RELOGRADE_BRANDS

export function isRelogradeBrand(id: string): id is RelogradeBrandId {
  return id in RELOGRADE_BRANDS
}

export function formatRegionLabel(code: string) {
  const region = (code || "").toLowerCase()
  const zh = REGION_LABELS[region]
  return zh ? `${zh} / ${region.toUpperCase()}` : region.toUpperCase()
}
