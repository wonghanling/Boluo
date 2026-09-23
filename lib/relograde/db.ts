import "server-only"

import { createClient, type SupabaseClient } from "@supabase/supabase-js"

export type VoucherOrderRow = {
  id: string
  order_id: string
  user_id: string | null
  user_email: string | null
  brand_slug: string
  product_slug: string
  face_value: number
  face_value_currency: string
  is_variable: boolean
  cost_amount: number | null
  cost_currency: string | null
  sell_cny: number
  margin_rate: number | null
  profit_cny: number | null
  relograde_trx: string | null
  status: string
  voucher_code: string | null
  voucher_serial: string | null
  redemption_link: string | null
  voucher_expires_at: string | null
  error_message: string | null
  quote_snapshot: Record<string, unknown> | null
  created_at: string
  paid_at: string | null
  delivered_at: string | null
}

function hasServiceRole(): boolean {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  return Boolean(key) && !key.includes("your_service_role")
}

export function createRelogradeAdminClient(): SupabaseClient | null {
  if (!hasServiceRole()) return null
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  if (!url || !key) return null
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
