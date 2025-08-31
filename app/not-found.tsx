import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-brand">404</h1>
          <h2 className="text-2xl font-semibold mb-4">页面未找到</h2>
          <p className="text-muted-foreground mb-8">
            抱歉，您访问的页面不存在或已被移动。
          </p>
        </div>
        <div className="space-x-4">
          <Button asChild>
            <Link href="/">返回首页</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/contact">联系我们</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}