import type { Metadata } from "next"
import { VerificationOrdersList } from "@/components/verification/VerificationOrdersList"
import { VerificationShell } from "@/components/verification/VerificationShell"

export const metadata: Metadata = { title: "我的验证订单" }

export default function VerificationOrdersPage() {
  return (
    <VerificationShell>
      <main className="container mx-auto max-w-5xl px-4 py-14">
        <h1 className="text-4xl font-bold">我的验证订单</h1>
        <p className="mt-3 text-white/50">仅显示当前登录用户的号码、验证码和订单状态。</p>
        <div className="mt-9"><VerificationOrdersList /></div>
      </main>
    </VerificationShell>
  )
}
