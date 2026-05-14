"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { Service } from "@/types"

type PurchaseDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  service: Service | null
  isPaying: boolean
  onSubmit: (payload: {
    service: Service
    planIndex: number
    email: string
    contact: string
    note: string
  }) => Promise<void> | void
}

type FormErrors = {
  email?: string
  contact?: string
  plan?: string
}

const WORK_WECHAT_URL = "https://work.weixin.qq.com/ca/cawcdeac58029da582"

export function PurchaseDialog({
  open,
  onOpenChange,
  service,
  isPaying,
  onSubmit,
}: PurchaseDialogProps) {
  const [selectedPlan, setSelectedPlan] = React.useState<number | null>(null)
  const [email, setEmail] = React.useState("")
  const [contact, setContact] = React.useState("")
  const [note, setNote] = React.useState("")
  const [errors, setErrors] = React.useState<FormErrors>({})

  React.useEffect(() => {
    if (!open) return

    setSelectedPlan(null)
    setEmail("")
    setContact("")
    setNote("")
    setErrors({})
  }, [open, service?.id])

  const selectedPlanData = selectedPlan !== null ? service?.pricing?.[selectedPlan] : null
  const canDirectPay = !!selectedPlanData && !Number.isNaN(parsePrice(selectedPlanData.price))
  const requiresPaymentLinkNote =
    service?.id === "chatgpt" && selectedPlanData?.price.includes("169")

  const handleSubmit = async () => {
    if (!service) return

    const nextErrors: FormErrors = {}

    if (selectedPlan === null) {
      nextErrors.plan = "请先选择套餐"
    }

    if (!email.trim()) {
      nextErrors.email = "请输入接收邮箱"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = "请输入有效的邮箱地址"
    }

    if (!contact.trim()) {
      nextErrors.contact = "请输入微信、Telegram 或手机号"
    }

    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0 || selectedPlan === null) {
      return
    }

    await onSubmit({
      service,
      planIndex: selectedPlan,
      email: email.trim(),
      contact: contact.trim(),
      note: note.trim(),
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="top-[max(10px,env(safe-area-inset-top))] translate-y-0 max-w-[96vw] max-h-[78vh] overflow-y-auto rounded-[16px] border border-slate-200 bg-white p-0 shadow-[0_18px_50px_rgba(15,23,42,0.18)] sm:top-[50%] sm:max-w-4xl sm:max-h-[82vh] sm:translate-y-[-50%] sm:rounded-[18px]">
        {service && (
          <div className="overflow-hidden rounded-[16px] sm:rounded-[18px]">
            <div className="px-3.5 pt-3.5 pb-4 sm:px-5 sm:pt-5 sm:pb-5">
              <DialogHeader className="space-y-1.5 text-left">
                <DialogTitle className="pr-8 text-[19px] font-bold tracking-tight text-slate-950 sm:text-[24px]">
                  {service.name}
                </DialogTitle>
                <DialogDescription className="max-w-3xl text-[13px] leading-5 text-slate-500 sm:text-[15px] sm:leading-6">
                  {service.description}
                </DialogDescription>
              </DialogHeader>

              <div className="mt-4 space-y-2 sm:mt-5 sm:space-y-2.5">
                {service.pricing?.map((plan, index) => (
                  <button
                    key={index}
                    type="button"
                    className={`relative flex w-full flex-col gap-1.5 rounded-[14px] border px-3.5 py-2.5 text-left transition-all sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:rounded-[18px] sm:px-4 sm:py-3 ${
                      selectedPlan === index
                        ? "border-blue-500 bg-[#ffca15] ring-2 ring-blue-500"
                        : "border-[#f3c318] bg-[#ffca15] hover:bg-[#ffc400]"
                    }`}
                    onClick={() => {
                      setSelectedPlan(index)
                      setErrors((prev) => ({ ...prev, plan: undefined }))
                    }}
                  >
                    {plan.popular && (
                      <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500 px-3 py-1 text-xs font-bold text-white">
                        热门
                      </span>
                    )}

                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2.5">
                      <span className="text-[14px] font-bold text-slate-950 sm:text-[18px]">
                        {plan.name}
                      </span>
                      <span className="text-[14px] font-bold text-slate-950 sm:text-[18px]">
                        {plan.price}
                        {plan.period && (
                          <span className="text-[12px] sm:text-[14px]">/{plan.period}</span>
                        )}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center justify-start gap-x-2 gap-y-1 text-[11px] font-medium leading-4 text-[#556b2f] sm:justify-end sm:gap-x-2.5 sm:gap-y-1.5 sm:text-[13px]">
                      {plan.features?.map((feature, idx) => (
                        <span key={idx} className="inline-flex items-center">
                          <span className="mr-1 text-[#14a44d]">•</span>
                          {feature}
                        </span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>

              {errors.plan && (
                <p className="mt-3 text-sm font-medium text-red-600">{errors.plan}</p>
              )}

              {service.id !== "others" && canDirectPay && (
                <div className="mt-4 rounded-[14px] border border-slate-200 bg-white px-3.5 py-3.5 sm:mt-5 sm:rounded-[18px] sm:px-5 sm:py-4">
                  <div className="mb-3">
                    <h3 className="text-[14px] font-bold text-slate-950 sm:text-[16px]">
                      填写收卡信息
                    </h3>
                    <p className="mt-1 text-[11px] leading-4 text-slate-600 sm:text-[13px] sm:leading-5">
                      付款完成后，卡号、礼品卡卡密或二维码会发送到你填写的邮箱。联系方式用于异常情况联系。
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 sm:gap-3">
                    <div className="sm:col-span-1">
                      <label className="mb-1.5 block text-[11px] font-semibold text-slate-800 sm:mb-1.5 sm:text-[13px]">
                        接收邮箱
                      </label>
                      <Input
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="you@example.com"
                        className="h-10 rounded-xl border-slate-200 bg-white text-[16px] text-slate-900 placeholder:text-slate-400 sm:h-10 sm:text-[14px]"
                      />
                      {errors.email && (
                        <p className="mt-2 text-sm text-red-600">{errors.email}</p>
                      )}
                    </div>

                    <div className="sm:col-span-1">
                      <label className="mb-1.5 block text-[11px] font-semibold text-slate-800 sm:mb-1.5 sm:text-[13px]">
                        联系方式
                      </label>
                      <Input
                        value={contact}
                        onChange={(event) => setContact(event.target.value)}
                        placeholder="微信 / Telegram / 手机号"
                        className="h-10 rounded-xl border-slate-200 bg-white text-[16px] text-slate-900 placeholder:text-slate-400 sm:h-10 sm:text-[14px]"
                      />
                      {errors.contact && (
                        <p className="mt-2 text-sm text-red-600">{errors.contact}</p>
                      )}
                    </div>

                    <div className="sm:col-span-2">
                      <label className="mb-1.5 block text-[11px] font-semibold text-slate-800 sm:mb-1.5 sm:text-[13px]">
                        备注信息
                      </label>
                      {requiresPaymentLinkNote && (
                        <div className="mb-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] leading-5 text-amber-900 sm:text-[12px]">
                          <p>请粘贴您的付款链接。</p>
                          <p className="mt-1 break-all text-amber-800/90">
                            例如：
                            https://chatgpt.com/checkout/openai_llc/cs_live_a1P7rr6aUH3328mm40l7GfbXlxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
                          </p>
                        </div>
                      )}
                      <Textarea
                        value={note}
                        onChange={(event) => setNote(event.target.value)}
                        placeholder={
                          requiresPaymentLinkNote
                            ? "请粘贴您的 ChatGPT 付款链接"
                            : "可选，填写收卡时间要求或补充说明"
                        }
                        className="min-h-[72px] rounded-xl border-slate-200 bg-white text-[16px] text-slate-900 placeholder:text-slate-400 sm:min-h-[78px] sm:text-[14px]"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-4 sm:mt-5">
                {service.id === "others" || !canDirectPay ? (
                  <Button
                    className="h-11 w-full rounded-[14px] border-0 bg-[#1faa45] text-[15px] font-bold text-white hover:bg-[#18973c] sm:h-12 sm:rounded-[18px] sm:text-[16px]"
                    onClick={() => {
                      window.open(WORK_WECHAT_URL, "_blank")
                      onOpenChange(false)
                    }}
                  >
                    联系微信
                  </Button>
                ) : (
                  <Button
                    className="h-11 w-full rounded-[14px] border-0 bg-[#1faa45] text-[15px] font-bold text-white hover:bg-[#18973c] sm:h-12 sm:rounded-[18px] sm:text-[16px]"
                    onClick={handleSubmit}
                    disabled={isPaying}
                  >
                    {isPaying ? "跳转支付中..." : "立即支付"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

function parsePrice(price: string) {
  const normalizedPrice = price.replace(/[^\d.]/g, "").replace(/\/.*$/, "")
  return parseFloat(normalizedPrice)
}
