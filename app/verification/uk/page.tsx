import type { Metadata } from "next"
import { AlertTriangle, CheckCircle2 } from "lucide-react"
import { ProductDetail } from "@/components/verification/ProductDetail"
import { VerificationShell } from "@/components/verification/VerificationShell"

export const metadata: Metadata = { title: "英国首次验证" }

export default function UkVerificationPage() {
  return (
    <VerificationShell>
      <main className="container mx-auto max-w-5xl px-4 py-14">
        <p className="text-sm font-medium text-yellow-400">英国 · +44</p>
        <h1 className="mt-3 text-4xl font-bold md:text-5xl">英国首次验证</h1>
        <p className="mt-5 max-w-3xl leading-7 text-white/60">
          获取一个英国 +44 号码并自动查询首次验证码，不使用美国套餐的换号额度机制。该商品只用于完成首次验证，不承诺长期保留号码。
        </p>

        <div className="mt-10">
          <ProductDetail productCode="UK_FIRST">
            <div className="grid gap-4 text-sm md:grid-cols-3">
              {["支付后由您手动开始取号", "英国号码按 +44 国际格式展示", "订单页每 5 秒自动查询验证码"].map((item) => (
                <p key={item} className="flex gap-2 text-white/70"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-yellow-400" />{item}</p>
              ))}
            </div>
          </ProductDetail>
        </div>

        <section className="mt-10 grid gap-5 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 p-6">
            <h2 className="text-xl font-semibold">使用流程</h2>
            <ol className="mt-4 space-y-3 text-sm leading-6 text-white/60">
              <li>1. 登录并支付英国首次验证。</li>
              <li>2. 返回验证订单详情，点击“我已准备好，开始取号”。</li>
              <li>3. 复制 +44 号码到目标网站，订单页会自动刷新验证码。</li>
              <li>4. 收到验证码后及时复制并完成订单。</li>
            </ol>
          </div>
          <div className="rounded-2xl border border-yellow-400/20 bg-yellow-400/[0.04] p-6">
            <h2 className="flex items-center gap-2 text-xl font-semibold text-yellow-300"><AlertTriangle className="h-5 w-5" />服务范围</h2>
            <p className="mt-4 text-sm leading-6 text-white/60">英国首次验证不支持换号，也不包含长期保留或续租。英国长期首月和英国续租等待上游正式接口文档，目前不能购买。</p>
          </div>
        </section>
      </main>
    </VerificationShell>
  )
}
