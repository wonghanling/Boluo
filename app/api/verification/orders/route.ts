import { NextRequest, NextResponse } from "next/server"
import {
  createVerificationAdminClient,
  errorResponse,
  publicVerificationOrder,
  requireVerificationUser,
} from "@/lib/verification/server"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const user = await requireVerificationUser(request)
    const admin = createVerificationAdminClient()
    const { data, error } = await admin
      .from("verification_orders")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(100)
    if (error) throw error
    return NextResponse.json({ orders: (data || []).map(publicVerificationOrder) })
  } catch (error) {
    const result = errorResponse(error)
    return NextResponse.json(result.body, { status: result.status })
  }
}
