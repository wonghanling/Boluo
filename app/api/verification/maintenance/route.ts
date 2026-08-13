import { NextRequest, NextResponse } from "next/server"
import { createVerificationAdminClient } from "@/lib/verification/server"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET?.trim()
  const authorization = request.headers.get("authorization")
  if (!secret || authorization !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const retentionHours = Math.max(1, Number(process.env.VERIFICATION_DATA_RETENTION_HOURS || 72))
  const admin = createVerificationAdminClient()
  const { data, error } = await admin.rpc("redact_verification_sensitive_data", {
    p_retention_hours: retentionHours,
  })
  if (error) return NextResponse.json({ error: "Maintenance failed" }, { status: 500 })
  return NextResponse.json({ success: true, redacted: Number(data || 0) })
}
