"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, LockKeyhole } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/AuthProvider"
import { submitAlipayForm, verificationFetch } from "@/lib/verification/client"

export function BuyVerificationProduct({
  productCode,
  disabled,
}: {
  productCode: string
  disabled?: boolean
}) {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [paying, setPaying] = useState(false)
  const idempotencyKey = useMemo(() => crypto.randomUUID(), [])

  const buy = async () => {
    if (!user) {
      router.push(`/auth/login?returnUrl=${encodeURIComponent(`${window.location.origin}${window.location.pathname}`)}`)
      return
    }
    if (paying) return
    setPaying(true)
    try {
      const result = await verificationFetch("/api/verification/payment", {
        method: "POST",
        body: JSON.stringify({ productCode, idempotencyKey }),
      })
      submitAlipayForm(result.payUrl)
    } catch (error) {
      alert(error instanceof Error ? error.message : "支付创建失败")
      setPaying(false)
    }
  }

  return (
    <Button
      size="lg"
      disabled={disabled || loading || paying}
      onClick={buy}
      className="rounded-full bg-yellow-400 px-8 text-[#111113] hover:bg-yellow-300 disabled:bg-white/10 disabled:text-white/40"
    >
      {paying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LockKeyhole className="mr-2 h-4 w-4" />}
      {disabled ? "暂未开放" : user ? "支付宝购买" : "登录后购买"}
    </Button>
  )
}
