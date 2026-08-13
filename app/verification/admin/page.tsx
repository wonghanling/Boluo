import type { Metadata } from "next"
import { VerificationAdminDashboard } from "@/components/verification/VerificationAdminDashboard"
import { VerificationShell } from "@/components/verification/VerificationShell"

export const metadata: Metadata = { title: "验证码服务管理" }

export default function VerificationAdminPage() {
  return (
    <VerificationShell>
      <main className="container mx-auto max-w-7xl px-4 py-12">
        <h1 className="text-3xl font-bold">验证码服务管理</h1>
        <p className="mt-3 text-white/50">独立管理验证码商品、上游余额、订单成本与人工续租，不影响原管理后台。</p>
        <div className="mt-8"><VerificationAdminDashboard /></div>
      </main>
    </VerificationShell>
  )
}
