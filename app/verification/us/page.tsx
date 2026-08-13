import type { Metadata } from "next"
import { AlertTriangle, CheckCircle2 } from "lucide-react"
import { ProductDetail } from "@/components/verification/ProductDetail"
import { VerificationShell } from "@/components/verification/VerificationShell"

export const metadata: Metadata = { title: "美国短期验证" }

export default function UsVerificationPage() {
  return (
    <VerificationShell>
      <main className="container mx-auto max-w-5xl px-4 py-14">
        <p className="text-sm font-medium text-yellow-400">美国 · +1</p>
        <h1 className="mt-3 text-4xl font-bold md:text-5xl">美国短期验证套餐</h1>
        <p className="mt-5 max-w-3xl leading-7 text-white/60">
          本套餐包含一个当前美国号码。未收到验证码且达到换号条件后可更换号码，累计最多使用 5 个号码，即首次号码加最多 4 次更换。
        </p>

        <div className="mt-10"><ProductDetail productCode="US_SHORT">
          <div className="grid gap-4 text-sm md:grid-cols-3">
            {[
              "每个客户订单生成独立额度标识",
              "同一时间只保留一个有效号码",
              "页面显示已使用与剩余换号次数",
            ].map((item) => <p key={item} className="flex gap-2 text-white/70"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-yellow-400" />{item}</p>)}
          </div>
        </ProductDetail></div>

        <section className="mt-10 grid gap-5 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 p-6">
            <h2 className="text-xl font-semibold">使用流程</h2>
            <ol className="mt-4 space-y-3 text-sm leading-6 text-white/60">
              <li>1. 登录并支付套餐。</li>
              <li>2. 返回订单页，准备好后点击“开始取号”。</li>
              <li>3. 美国号码默认不含 +1，填写时请按目标网站要求添加。</li>
              <li>4. 页面自动刷新验证码，收到后请及时复制并完成订单。</li>
            </ol>
          </div>
          <div className="rounded-2xl border border-yellow-400/20 bg-yellow-400/[0.04] p-6">
            <h2 className="flex items-center gap-2 text-xl font-semibold text-yellow-300"><AlertTriangle className="h-5 w-5" />额度说明</h2>
            <p className="mt-4 text-sm leading-6 text-white/60">
              套餐不代表购买 5 个独立号码。首次号码计入 5 个总额度，只有在等待超时、号码无效或符合规则时才开放换号；换号后旧号码失效。
            </p>
          </div>
        </section>
      </main>
    </VerificationShell>
  )
}
