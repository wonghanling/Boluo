import type { Metadata } from "next"
import { LockKeyhole, RefreshCw, ShieldCheck, Smartphone } from "lucide-react"
import { ProductCards } from "@/components/verification/ProductCards"
import { VerificationShell } from "@/components/verification/VerificationShell"

export const metadata: Metadata = {
  title: "codex 验证登录",
  description: "美国短期验证与英国独享号码服务",
}

export default function VerificationPage() {
  return (
    <VerificationShell theme="light">
      <main className="container mx-auto px-4 py-14 md:py-20">
        <section className="mx-auto max-w-4xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-yellow-500/30 bg-yellow-400/15 px-4 py-2 text-sm text-yellow-700">
            <LockKeyhole className="h-4 w-4" /> 安全的号码验证服务
          </span>
          <h1 className="mt-6 text-4xl font-bold tracking-tight md:text-6xl">准备好后再取号，验证码自动刷新</h1>
          <p className="mx-auto mt-5 max-w-2xl leading-7 text-[#1d1d1f]/60">
            浏览器不会接触上游密钥。付款成功后由您主动开始取号，号码、验证码和订单状态仅本人可见。
          </p>
        </section>

        <section className="mx-auto mt-14 max-w-5xl"><ProductCards theme="light" /></section>

        <section className="mx-auto mt-16 grid max-w-5xl gap-4 md:grid-cols-3">
          {[
            [ShieldCheck, "订单隔离", "美国每个订单使用独立额度标识，不与其他用户共享。"],
            [RefreshCw, "安全换号", "达到等待条件后才能换号，并限制并发与操作频率。"],
            [Smartphone, "自动查码", "页面查询本站状态，由服务端控制真实上游查询频率。"],
          ].map(([Icon, title, description]) => {
            const FeatureIcon = Icon as typeof ShieldCheck
            return (
              <div key={String(title)} className="rounded-2xl border border-black/10 bg-[#f5f5f7] p-5">
                <FeatureIcon className="h-6 w-6 text-yellow-600" />
                <h2 className="mt-4 font-semibold">{String(title)}</h2>
                <p className="mt-2 text-sm leading-6 text-[#1d1d1f]/50">{String(description)}</p>
              </div>
            )
          })}
        </section>
      </main>
    </VerificationShell>
  )
}
