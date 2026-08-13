export interface VerificationProductView {
  code: string
  name: string
  description: string
  product_type: "us_short" | "uk_first" | "uk_long" | "uk_renewal"
  country_code: "187" | "44"
  sale_price: number
  is_active: boolean
  sales_paused: boolean
  config: {
    max_numbers?: number
    change_wait_seconds?: number
    period_days?: number
    manual_fulfillment?: boolean
  }
}

export interface VerificationOrderView {
  id: string
  payment_order_no: string
  product_code: string
  product_type: string
  payment_status: string
  fulfillment_status: string
  country_code: string
  phone_number: string | null
  verification_code: string | null
  numbers_used: number
  numbers_remaining: number
  change_wait_seconds: number
  sale_price: number
  refund_status: string
  expires_at: string | null
  renewed_until: string | null
  created_at: string
  paid_at: string | null
  number_received_at: string | null
  code_received_at: string | null
  completed_at: string | null
  cancelled_at: string | null
  error_message: string | null
}

export const VERIFICATION_STATUS_LABELS: Record<string, string> = {
  awaiting_payment: "等待支付",
  paid: "支付成功",
  ready: "待取号",
  requesting_number: "正在取号",
  waiting_code: "等待验证码",
  code_received: "已收到验证码",
  completed: "已完成",
  change_available: "可继续换号",
  changing_number: "正在换号",
  cancel_pending: "正在取消",
  cancelled: "已取消",
  refund_pending: "退款待审核",
  refunded: "已退款",
  expired: "已过期",
  failed: "处理失败",
  manual_review: "人工处理中",
}
