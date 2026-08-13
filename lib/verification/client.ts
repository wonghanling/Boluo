"use client"

import { supabase } from "@/lib/supabase"

export async function verificationFetch(input: string, init: RequestInit = {}) {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  if (!token) throw new Error("请先登录后再使用号码验证服务")

  const response = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init.headers,
      Authorization: `Bearer ${token}`,
    },
  })
  const contentType = response.headers.get("content-type") || ""
  const result = contentType.includes("application/json")
    ? await response.json()
    : { error: await response.text() }

  if (!response.ok) throw new Error(result.error || "请求失败，请稍后重试")
  return result
}

export function submitAlipayForm(payUrl: string) {
  const container = document.createElement("div")
  container.style.display = "none"
  container.innerHTML = payUrl
  document.body.appendChild(container)
  const form = container.querySelector("form")
  if (!form) throw new Error("支付页面生成失败")
  form.submit()
}
