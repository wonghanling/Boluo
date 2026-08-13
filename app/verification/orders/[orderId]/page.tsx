import type { Metadata } from "next"
import { VerificationOrderDetail } from "@/components/verification/VerificationOrderDetail"
import { VerificationShell } from "@/components/verification/VerificationShell"

export const metadata: Metadata = { title: "验证订单详情" }

export default function VerificationOrderPage({ params }: { params: { orderId: string } }) {
  return (
    <VerificationShell>
      <main className="container mx-auto max-w-4xl px-4 py-14">
        <h1 className="text-3xl font-bold">验证订单详情</h1>
        <p className="mt-3 text-white/50">号码与验证码仅当前订单所有者可见。</p>
        <div className="mt-8"><VerificationOrderDetail orderId={params.orderId} /></div>
      </main>
    </VerificationShell>
  )
}
