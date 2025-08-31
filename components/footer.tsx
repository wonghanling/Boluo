import Link from "next/link"
import { services } from "@/content/services"

export function Footer() {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    company: {
      title: "公司",
      links: [
        { name: "关于我们", href: "#hero" },
        { name: "联系我们", href: "#contact" }
      ]
    }
  }

  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* 品牌信息 */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <span className="font-bold text-xl">BoLuo</span>
            </div>
            <p className="text-muted-foreground mb-4 max-w-md">
              专业的海外 AI 工具代充服务，让您轻松享受全球最先进的人工智能技术。
            </p>
          </div>

          {/* 公司链接 */}
          <div>
            <h3 className="font-semibold mb-4">{footerLinks.company.title}</h3>
            <ul className="space-y-2">
              {footerLinks.company.links.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            © {currentYear} BoLuo. 保留所有权利。
          </p>
          <p className="text-sm text-muted-foreground mt-2 md:mt-0">
            独立销售，不捆绑套餐 • 支持微信/支付宝付款
          </p>
        </div>
      </div>
    </footer>
  )
}