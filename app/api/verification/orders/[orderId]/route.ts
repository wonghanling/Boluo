import { NextRequest, NextResponse } from "next/server"
import {
  createVerificationAdminClient,
  errorResponse,
  publicVerificationOrder,
  requireVerificationUser,
  VerificationRequestError,
} from "@/lib/verification/server"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest, context: { params: { orderId: string } }) {
  try {
    const user = await requireVerificationUser(request)
    const admin = createVerificationAdminClient()
    const { data, error } = await admin
      .from("verification_orders")
      .select("*")
      .eq("id", context.params.orderId)
      .eq("user_id", user.id)
      .maybeSingle()
    if (error) throw error
    if (!data) throw new VerificationRequestError("验证订单不存在", 404, "ORDER_NOT_FOUND")
    return NextResponse.json({ order: publicVerificationOrder(data) })
  } catch (error) {
    const result = errorResponse(error)
    return NextResponse.json(result.body, { status: result.status })
  }
}
