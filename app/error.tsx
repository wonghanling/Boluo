"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-bold mb-4">出现了一些问题</h2>
        <p className="text-muted-foreground mb-6">
          抱歉，页面加载时遇到了错误。请尝试刷新页面或返回首页。
        </p>
        <div className="space-x-4">
          <Button onClick={reset} variant="outline">
            重试
          </Button>
          <Button asChild>
            <Link href="/">返回首页</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}