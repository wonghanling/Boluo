export const RELOGRADE_BRANDS = {
  visa: {
    id: "visa",
    brandSlug: "rewarble-visa",
    paymentCurrencyDefault: "USD",
    currencies: ["USD"] as const,
  },
  mastercard: {
    id: "mastercard",
    brandSlug: "rewarble-mastercard",
    paymentCurrencyDefault: "USD",
    currencies: ["USD", "EUR"] as const,
  },
} as const

export type RelogradeBrandId = keyof typeof RELOGRADE_BRANDS

export function isRelogradeBrand(id: string): id is RelogradeBrandId {
  return id in RELOGRADE_BRANDS
}
