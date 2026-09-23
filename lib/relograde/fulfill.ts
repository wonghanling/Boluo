import "server-only"

import { createRelogradeAdminClient } from "./db"
import {
  cancelOrder,
  createOrder,
  extractVoucher,
  findOrder,
  RelogradeError,
  resolveOrder,
  type RelogradeOrder,
} from "./client"
import type { QuoteResult } from "./catalog"

function paymentCurrency(): string {
  return (process.env.RELOGRADE_PAYMENT_CURRENCY || "EUR").toUpperCase()
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function waitUntilFinished(trx: string, attempts = 8): Promise<RelogradeOrder> {
  for (let i = 0; i < attempts; i += 1) {
    const order = await findOrder(trx)
    if (order.orderStatus === "finished") return order
    if (order.orderStatus === "cancelled" || order.orderStatus === "deleted") {
      throw new RelogradeError("上游订单已取消", 502, "cancelled", order)
    }
    await sleep(2500)
  }
  return findOrder(trx)
}

export async function fulfillRelogradeOrder(input: {
  orderId: string
  quote: QuoteResult
}): Promise<void> {
  const admin = createRelogradeAdminClient()
  if (!admin) {
    console.error("Relograde fulfill skipped: 未配置 SUPABASE_SERVICE_ROLE_KEY")
    return
  }

  const { data: existing } = await admin
    .from("voucher_orders")
    .select("id,status,relograde_trx")
    .eq("order_id", input.orderId)
    .maybeSingle()

  if (existing?.status === "delivered") return
  if (existing?.status === "fulfilling" && existing.relograde_trx) {
    try {
      const order = await waitUntilFinished(existing.relograde_trx)
      await saveVoucher(admin, input.orderId, order)
    } catch (error) {
      await markFailed(admin, input.orderId, error)
    }
    return
  }

  await admin
    .from("voucher_orders")
    .update({
      status: "fulfilling",
      error_message: null,
    })
    .eq("order_id", input.orderId)

  const item: { productSlug: string; amount: number; faceValue?: number } = {
    productSlug: input.quote.productSlug,
    amount: 1,
  }
  if (input.quote.isVariable) item.faceValue = input.quote.faceValue

  let trx: string | null = null
  try {
    const created = await createOrder({
      items: [item],
      paymentCurrency: paymentCurrency(),
      reference: input.orderId,
    })
    trx = created.trx

    await admin
      .from("voucher_orders")
      .update({ relograde_trx: trx })
      .eq("order_id", input.orderId)

    let finished: RelogradeOrder
    try {
      finished = await resolveOrder(trx)
    } catch (error) {
      if (error instanceof RelogradeError && error.status === 402) {
        throw new RelogradeError("上游余额不足，无法出码", 402, "payment_required", error.body)
      }
      throw error
    }

    if (finished.orderStatus !== "finished") {
      finished = await waitUntilFinished(trx)
    }

    if (finished.orderStatus !== "finished") {
      throw new RelogradeError(
        `上游订单状态 ${finished.orderStatus}`,
        502,
        "not_finished",
        finished,
      )
    }

    await saveVoucher(admin, input.orderId, finished)
  } catch (error) {
    if (trx) {
      try {
        await cancelOrder(trx)
      } catch {
        // ignore cancel failures; order may already be delivered or gone
      }
    }
    await markFailed(admin, input.orderId, error)
  }
}

async function saveVoucher(
  admin: NonNullable<ReturnType<typeof createRelogradeAdminClient>>,
  orderId: string,
  order: RelogradeOrder,
) {
  const voucher = extractVoucher(order)
  if (!voucher.voucherCode && !voucher.redemptionLink) {
    throw new RelogradeError("上游订单完成但未返回兑换码", 502, "empty_voucher", order)
  }

  await admin
    .from("voucher_orders")
    .update({
      status: "delivered",
      voucher_code: voucher.voucherCode,
      voucher_serial: voucher.voucherSerial,
      redemption_link: voucher.redemptionLink,
      voucher_expires_at: voucher.voucherExpiresAt,
      delivered_at: new Date().toISOString(),
      error_message: null,
    })
    .eq("order_id", orderId)
}

async function markFailed(
  admin: NonNullable<ReturnType<typeof createRelogradeAdminClient>>,
  orderId: string,
  error: unknown,
) {
  const message = error instanceof Error ? error.message : "未知出码错误"
  console.error("Relograde fulfill failed", orderId, error)
  await admin
    .from("voucher_orders")
    .update({
      status: "failed",
      error_message: message.slice(0, 500),
    })
    .eq("order_id", orderId)
}
