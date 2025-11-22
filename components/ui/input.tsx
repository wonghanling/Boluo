import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, onPaste, ...props }, ref) => {
    const handlePaste = React.useCallback((e: React.ClipboardEvent<HTMLInputElement>) => {
      // 清除默认的粘贴行为，手动处理避免重复
      e.preventDefault()

      const paste = e.clipboardData.getData('text')
      const target = e.currentTarget

      // 直接设置值，不触发额外事件
      if (target) {
        target.value = paste
        // 手动触发React的change事件
        target.dispatchEvent(new Event('input', { bubbles: true }))
      }

      // 如果有自定义的onPaste处理器，调用它
      if (onPaste) {
        onPaste(e)
      }
    }, [onPaste])

    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        onPaste={handlePaste}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }