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
      <DialogContent className="sm:max-w-6xl max-w-[95vw] max-h-[90vh] overflow-y-auto rounded-[28px] border-0 bg-white p-0 shadow-[0_20px_80px_rgba(15,23,42,0.22)]">
        {service && (
          <div className="overflow-hidden rounded-[28px]">
            <div className="px-6 pt-7 pb-5 sm:px-8">
              <DialogHeader className="space-y-3 text-left">
                <DialogTitle className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                  {service.name}
                </DialogTitle>
                <DialogDescription className="max-w-3xl text-base leading-7 text-slate-500 sm:text-xl">
                  {service.description}
                </DialogDescription>
              </DialogHeader>

              <div className="mt-8 space-y-3">
                {service.pricing?.map((plan, index) => (
                  <button
                    key={index}
                    type="button"
                    className={`relative flex w-full flex-col gap-3 rounded-2xl px-5 py-4 text-left transition-all sm:flex-row sm:items-center sm:justify-between ${
                      selectedPlan === index
                        ? "bg-amber-400 ring-2 ring-blue-500"
                        : "bg-amber-300 hover:bg-amber-300/90"
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

                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold text-slate-950">{plan.name}</span>
                      <span className="text-2xl font-bold text-slate-950">
                        {plan.price}
                        {plan.period && <span className="text-xl">/{plan.period}</span>}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center justify-start gap-x-3 gap-y-2 text-sm font-medium text-slate-700 sm:justify-end sm:text-lg">
                      {plan.features?.map((feature, idx) => (
                        <span key={idx} className="inline-flex items-center">
                          <span className="mr-1 text-emerald-600">✓</span>
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
                <div className="mt-8 rounded-[24px] border border-slate-200 bg-slate-50/80 px-5 py-5 sm:px-6">
                  <div className="mb-5">
                    <h3 className="text-xl font-bold text-slate-950">填写收卡信息</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-500 sm:text-base">
                      付款完成后，卡号、礼品卡卡密或二维码会发送到你填写的邮箱。联系方式用于异常情况联系。
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-1">
                      <label className="mb-2 block text-sm font-semibold text-slate-800">
                        接收邮箱
                      </label>
                      <Input
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="you@example.com"
                        className="h-12 rounded-xl border-slate-200 bg-white text-base"
                      />
                      {errors.email && (
                        <p className="mt-2 text-sm text-red-600">{errors.email}</p>
                      )}
                    </div>

                    <div className="sm:col-span-1">
                      <label className="mb-2 block text-sm font-semibold text-slate-800">
                        联系方式
                      </label>
                      <Input
                        value={contact}
                        onChange={(event) => setContact(event.target.value)}
                        placeholder="微信 / Telegram / 手机号"
                        className="h-12 rounded-xl border-slate-200 bg-white text-base"
                      />
                      {errors.contact && (
                        <p className="mt-2 text-sm text-red-600">{errors.contact}</p>
                      )}
                    </div>

                    <div className="sm:col-span-2">
                      <label className="mb-2 block text-sm font-semibold text-slate-800">
                        备注信息
                      </label>
                      <Textarea
                        value={note}
                        onChange={(event) => setNote(event.target.value)}
                        placeholder="可选，填写收卡时间要求或补充说明"
                        className="min-h-[100px] rounded-xl border-slate-200 bg-white text-base"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-8">
                {service.id === "others" || !canDirectPay ? (
                  <Button
                    className="h-14 w-full rounded-2xl border-0 bg-green-600 text-xl font-bold text-white hover:bg-green-700"
                    onClick={() => {
                      window.open(WORK_WECHAT_URL, "_blank")
                      onOpenChange(false)
                    }}
                  >
                    联系微信
                  </Button>
                ) : (
                  <Button
                    className="h-14 w-full rounded-2xl border-0 bg-green-600 text-xl font-bold text-white hover:bg-green-700"
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
  const normalizedPrice = price.replace(/[¥￥]/g, "").replace(/\/.*$/, "")
  return parseFloat(normalizedPrice)
}
