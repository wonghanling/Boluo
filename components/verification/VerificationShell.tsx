import Link from "next/link"
import { ShieldCheck } from "lucide-react"

export function VerificationShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#111113] text-white">
      <div className="border-b border-white/10 bg-[#171719]">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-4 px-4 py-4">
          <Link href="/verification" className="flex items-center gap-2 font-semibold">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-yellow-400 text-[#111113]">
              <ShieldCheck className="h-5 w-5" />
            </span>
            codex 验证登录
          </Link>
          <nav className="flex flex-wrap gap-4 text-sm text-white/70">
            <Link href="/verification/us" className="hover:text-yellow-400">美国验证</Link>
            <Link href="/verification/uk" className="hover:text-yellow-400">英国号码</Link>
            <Link href="/verification/orders" className="hover:text-yellow-400">我的验证订单</Link>
            <Link href="/" className="hover:text-yellow-400">返回首页</Link>
          </nav>
        </div>
      </div>
      {children}
    </div>
  )
}
