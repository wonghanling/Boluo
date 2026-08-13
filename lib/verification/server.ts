import "server-only"

import { createHash, randomBytes } from "crypto"
import { createClient, User } from "@supabase/supabase-js"
import { NextRequest } from "next/server"
import type { VerificationProduct } from "./products"

function requireEnvironment(name: string): string {
  const value = process.env[name]?.trim()
  if (!value) {
    throw new Error(`缺少服务端环境变量：${name}`)
  }
  return value
}

export function createVerificationAdminClient() {
  return createClient(
    requireEnvironment("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnvironment("SUPABASE_SERVICE_ROLE_KEY"),
    {
      auth: { autoRefreshToken: false, persistSession: false },
    },
  )
}

export class VerificationRequestError extends Error {
  constructor(
    message: string,
    public status = 400,
    public code = "BAD_REQUEST",
  ) {
    super(message)
  }
}

export async function requireVerificationUser(request: NextRequest): Promise<User> {
  const authorization = request.headers.get("authorization")
  const token = authorization?.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length).trim()
    : ""

  if (!token) {
    throw new VerificationRequestError("请先登录后再使用号码验证服务", 401, "UNAUTHORIZED")
  }

  const admin = createVerificationAdminClient()
  const { data, error } = await admin.auth.getUser(token)
  if (error || !data.user) {
    throw new VerificationRequestError("登录状态已失效，请重新登录", 401, "UNAUTHORIZED")
  }
  return data.user
}

export async function requireVerificationAdmin(request: NextRequest): Promise<User> {
  const user = await requireVerificationUser(request)
  const allowedEmails = (process.env.VERIFICATION_ADMIN_EMAILS || process.env.NEXT_PUBLIC_ADMIN_EMAIL || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)

  if (!user.email || !allowedEmails.includes(user.email.toLowerCase())) {
    throw new VerificationRequestError("无权访问验证码管理功能", 403, "FORBIDDEN")
  }
  return user
}

export async function getVerificationProduct(code: string): Promise<VerificationProduct> {
  const admin = createVerificationAdminClient()
  const { data, error } = await admin
    .from("verification_products")
    .select("code,name,description,product_type,country_code,sale_price,upstream_cost_estimate,is_active,sales_paused,config")
    .eq("code", code)
    .maybeSingle()

  if (error) {
    throw new VerificationRequestError("商品配置暂时不可用，请稍后重试", 503, "PRODUCTS_UNAVAILABLE")
  }
  if (!data) {
    throw new VerificationRequestError("验证商品不存在", 404, "PRODUCT_NOT_FOUND")
  }
  return {
    ...data,
    sale_price: Number(data.sale_price),
    upstream_cost_estimate: Number(data.upstream_cost_estimate),
    config: (data.config || {}) as Record<string, unknown>,
  } as VerificationProduct
}

export async function enforceVerificationRateLimit(
  request: NextRequest,
  userId: string,
  scope: string,
  limit: number,
  windowSeconds: number,
) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
  const ip = forwarded || request.headers.get("x-real-ip") || "unknown"
  const keyHash = createHash("sha256")
    .update(`${scope}:${userId}:${ip}`)
    .digest("hex")
  const admin = createVerificationAdminClient()
  const { data, error } = await admin.rpc("consume_verification_rate_limit", {
    p_key_hash: keyHash,
    p_window_seconds: windowSeconds,
    p_limit: limit,
  })

  if (error) {
    throw new VerificationRequestError("安全校验暂时不可用，请稍后重试", 503, "RATE_LIMIT_UNAVAILABLE")
  }
  if (!data) {
    throw new VerificationRequestError("操作过于频繁，请稍后再试", 429, "RATE_LIMITED")
  }
}

export function generateVerificationPaymentOrderNo(): string {
  const stamp = new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 14)
  return `VERIFY${stamp}${randomBytes(6).toString("hex").toUpperCase()}`
}

export function generatePrivateCardCode(): string {
  return `BOLUO-${randomBytes(18).toString("base64url")}`
}

export function publicVerificationOrder(order: Record<string, any>) {
  return {
    id: order.id,
    payment_order_no: order.payment_order_no,
    product_code: order.product_code,
    product_type: order.product_type,
    payment_status: order.payment_status,
    fulfillment_status: order.fulfillment_status,
    country_code: order.country_code,
    phone_number: order.phone_number,
    verification_code: order.verification_code,
    numbers_used: order.numbers_used,
    numbers_remaining: order.numbers_remaining,
    change_wait_seconds: Number(order.metadata?.change_wait_seconds || 120),
    sale_price: Number(order.sale_price),
    refund_status: order.refund_status,
    expires_at: order.expires_at,
    renewed_until: order.renewed_until,
    created_at: order.created_at,
    paid_at: order.paid_at,
    number_received_at: order.number_received_at,
    code_received_at: order.code_received_at,
    completed_at: order.completed_at,
    cancelled_at: order.cancelled_at,
    error_message: order.error_message || null,
  }
}

export function errorResponse(error: unknown) {
  if (error instanceof VerificationRequestError) {
    return { status: error.status, body: { error: error.message, code: error.code } }
  }
  return { status: 500, body: { error: "服务暂时不可用，请稍后重试", code: "INTERNAL_ERROR" } }
}

export async function appendVerificationAudit(params: {
  orderId: string
  actorUserId?: string | null
  actorType: "user" | "admin" | "system" | "upstream"
  action: string
  fromStatus?: string | null
  toStatus?: string | null
  details?: Record<string, unknown>
}) {
  const admin = createVerificationAdminClient()
  await admin.from("verification_audit_logs").insert({
    verification_order_id: params.orderId,
    actor_user_id: params.actorUserId || null,
    actor_type: params.actorType,
    action: params.action,
    from_status: params.fromStatus || null,
    to_status: params.toStatus || null,
    details: params.details || {},
  })
}
