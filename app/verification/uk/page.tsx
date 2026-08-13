import type { Metadata } from "next"
import { VerificationShell } from "@/components/verification/VerificationShell"

export const metadata: Metadata = { title: "英国长期号码" }

export default function UkVerificationPage() {
  return (
    <VerificationShell>
      <main className="container mx-auto max-w-5xl px-4 py-14">
        <p className="text-sm font-medium text-yellow-400">英国 · +44</p>
        <h1 className="mt-3 text-4xl font-bold md:text-5xl">英国独享号码与续租</h1>
        <p className="mt-5 max-w-3xl leading-7 text-white/60">
          英国号码不使用美国的五次额度机制。当前公开上游接口没有明确续租地址，因此续租只建立支付、到期时间和后台人工履约流程，不会猜测接口。
        </p>
        <section className="mt-10 grid gap-5 md:grid-cols-3">
          {[
            ["英国首次验证", "¥7", "获取号码并完成首次接码，不承诺长期保留。"],
            ["英国长期首月", "¥13", "首次取号与接码，加首月长期保留。"],
            ["后续续租", "¥6/月", "只能为原用户的原号码续租，由管理员人工处理。"],
          ].map(([title, price, description]) => (
            <article key={title} className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
              <h2 className="text-xl font-semibold">{title}</h2>
              <p className="mt-4 text-3xl font-bold text-yellow-400">{price}</p>
              <p className="mt-4 text-sm leading-6 text-white/60">{description}</p>
              <span className="mt-6 inline-flex rounded-full bg-white/10 px-4 py-2 text-xs text-white/50">人工履约准备中</span>
            </article>
          ))}
        </section>
        <div className="mt-10 rounded-2xl border border-yellow-400/20 bg-yellow-400/[0.06] p-6 text-sm leading-7 text-white/70">
          英国商品默认暂停销售。管理员确认上游履约细节、实际成本和人工处理流程后，可在独立验证码后台调整价格并开放。续租记录必须绑定原用户、原号码和原订单。
        </div>
      </main>
    </VerificationShell>
  )
}
