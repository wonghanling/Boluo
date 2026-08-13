import "server-only"

const FRIENDLY_ERRORS: Record<string, string> = {
  BAD_KEY: "号码服务鉴权失败，请联系客服",
  MISSING_CARD_CODE: "订单初始化失败，请联系客服",
  NO_BALANCE: "号码服务余额不足，当前无法取号",
  NO_NUMBERS: "当前暂无可用号码，请稍后重试",
  MAX_ACTIVE_ORDERS: "进行中的号码过多，请先处理当前号码",
  EARLY_RATE_LIMIT: "查询过于频繁，系统稍后会自动重试",
  ERROR_SERVICE_UNAVAILABLE: "上游号码服务暂时不可用，请稍后重试",
  ACCOUNT_PENDING: "号码服务账户正在审核，请联系客服",
}

export class UpstreamVerificationError extends Error {
  constructor(
    public code: string,
    message = FRIENDLY_ERRORS[code] || "号码服务暂时不可用，请稍后重试",
  ) {
    super(message)
  }
}

function upstreamConfiguration() {
  const baseUrl = process.env.GYBN_API_BASE_URL?.trim()
  const apiKey = process.env.GYBN_API_KEY?.trim()
  if (!baseUrl || !apiKey) {
    throw new UpstreamVerificationError("NOT_CONFIGURED", "号码服务尚未完成配置，请联系客服")
  }
  return { baseUrl, apiKey }
}

async function upstreamRequest(params: Record<string, string>): Promise<string> {
  const { baseUrl, apiKey } = upstreamConfiguration()
  const url = new URL(baseUrl)
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value))
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 12_000)

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "X-API-Key": apiKey,
        Authorization: `Bearer ${apiKey}`,
        Accept: "text/plain, application/json",
      },
      cache: "no-store",
      signal: controller.signal,
    })
    if (!response.ok) {
      throw new UpstreamVerificationError("HTTP_ERROR")
    }
    const text = (await response.text()).trim()
    if (FRIENDLY_ERRORS[text]) {
      throw new UpstreamVerificationError(text)
    }
    return text
  } catch (error) {
    if (error instanceof UpstreamVerificationError) throw error
    if (error instanceof Error && error.name === "AbortError") {
      throw new UpstreamVerificationError("TIMEOUT", "号码服务响应超时，请稍后重试")
    }
    throw new UpstreamVerificationError("NETWORK_ERROR")
  } finally {
    clearTimeout(timeout)
  }
}

export async function getUpstreamBalance(): Promise<number> {
  const result = await upstreamRequest({ action: "getBalance" })
  const balance = Number(result)
  if (!Number.isFinite(balance) || balance < 0) {
    throw new UpstreamVerificationError("INVALID_RESPONSE")
  }
  return balance
}

export async function getUsNumber(cardCode: string) {
  const result = await upstreamRequest({
    action: "getNumber",
    service: "dr",
    country: "187",
    card_code: cardCode,
  })
  const match = /^ACCESS_NUMBER:([^:]+):(\d+)$/.exec(result)
  if (!match) throw new UpstreamVerificationError("INVALID_RESPONSE")
  return { upstreamOrderId: match[1], phoneNumber: match[2] }
}

export async function getUkNumber() {
  const result = await upstreamRequest({ action: "getNumber", service: "dr", country: "44" })
  const match = /^ACCESS_NUMBER:([^:]+):(\+?\d+)$/.exec(result)
  if (!match) throw new UpstreamVerificationError("INVALID_RESPONSE")
  return { upstreamOrderId: match[1], phoneNumber: match[2] }
}

export async function getCardUsage(cardCode: string) {
  const result = await upstreamRequest({ action: "getCardUsage", card_code: cardCode })
  try {
    const parsed = JSON.parse(result) as { totalUsed?: unknown; remaining?: unknown }
    const totalUsed = Number(parsed.totalUsed)
    const remaining = Number(parsed.remaining)
    if (!Number.isInteger(totalUsed) || totalUsed < 0 || !Number.isInteger(remaining) || remaining < 0) throw new Error()
    return { totalUsed, remaining }
  } catch {
    throw new UpstreamVerificationError("INVALID_RESPONSE")
  }
}

export async function getVerificationStatus(upstreamOrderId: string) {
  const result = await upstreamRequest({ action: "getStatus", id: upstreamOrderId })
  if (result === "STATUS_WAIT_CODE") return { state: "waiting" as const }
  const match = /^STATUS_OK:(.+)$/.exec(result)
  if (match) return { state: "received" as const, code: match[1].trim() }
  throw new UpstreamVerificationError("INVALID_RESPONSE")
}

export async function setUpstreamStatus(upstreamOrderId: string, status: 6 | 8) {
  const result = await upstreamRequest({
    action: "setStatus",
    id: upstreamOrderId,
    status: String(status),
  })
  return result
}
