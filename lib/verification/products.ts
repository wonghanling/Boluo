import "server-only"

export const VERIFICATION_PRODUCT_CODES = {
  US_SHORT: "US_SHORT",
  UK_FIRST: "UK_FIRST",
  UK_LONG_MONTH: "UK_LONG_MONTH",
  UK_RENEWAL: "UK_RENEWAL",
} as const

export type VerificationProductCode =
  (typeof VERIFICATION_PRODUCT_CODES)[keyof typeof VERIFICATION_PRODUCT_CODES]

export interface VerificationProduct {
  code: VerificationProductCode
  name: string
  description: string
  product_type: "us_short" | "uk_first" | "uk_long" | "uk_renewal"
  country_code: "187" | "44"
  sale_price: number
  upstream_cost_estimate: number
  is_active: boolean
  sales_paused: boolean
  config: Record<string, unknown>
}

export function isVerificationProductCode(value: string): value is VerificationProductCode {
  return Object.values(VERIFICATION_PRODUCT_CODES).includes(value as VerificationProductCode)
}
