import type { Metadata } from "next"
import Link from "next/link"
import {
  ArrowLeft,
  ArrowRight,
  CircleHelp,
  Laptop,
  MessageCircle,
  Monitor,
  ShieldCheck,
  Smartphone,
  TabletSmartphone,
  Wifi,
} from "lucide-react"

export const metadata: Metadata = {
  title: "客户端安装教程",
  description: "BoLuo 网络服务客户端安装、订阅导入与连接教程。",
}

const platforms = [
  {
    id: "windows",
    name: "Windows",
    note: "台式机 / 笔记本",
    icon: Monitor,
    steps: [
      ["获取安装包", "联系客服获取 Windows 客户端下载地址，并确认下载的是与电脑系统匹配的版本。"],
      ["安装客户端", "打开下载的安装包，按提示完成安装。遇到系统安全提示时，请先核对文件来源。"],
      ["导入订阅", "打开客户端，选择“从链接导入”或“从剪贴板导入”，粘贴客服提供的订阅地址。"],
      ["连接测试", "更新订阅并选择一个可用节点，开启连接或系统代理，然后打开网页测试网络。"],
    ],
  },
  {
    id: "macos",
    name: "macOS",
    note: "MacBook / iMac",
    icon: Laptop,
    steps: [
      ["确认芯片版本", "在“关于本机”中查看芯片类型，再向客服获取适合 Apple 芯片或 Intel 芯片的安装包。"],
      ["完成安装", "打开安装包，将客户端拖入“应用程序”。若系统阻止打开，请在“隐私与安全性”中确认来源后重试。"],
      ["导入订阅", "启动客户端，找到订阅管理入口，粘贴客服提供的订阅地址并更新。"],
      ["开启连接", "选择节点并允许客户端添加网络配置，连接后打开网页确认网络是否正常。"],
    ],
  },
  {
    id: "android",
    name: "Android",
    note: "安卓手机 / 平板",
    icon: Smartphone,
    steps: [
      ["下载安装", "使用客户提供的应用商店链接或安装包。通过安装包安装时，仅临时允许该来源安装应用。"],
      ["打开客户端", "安装完成后打开客户端；如有网络或通知权限提示，请按实际使用需要授权。"],
      ["导入订阅", "点击添加或导入按钮，粘贴订阅地址，等待节点列表更新完成。"],
      ["允许连接", "选择节点并点击连接。首次使用会出现 VPN 连接请求，确认后即可开始测试。"],
    ],
  },
  {
    id: "ios",
    name: "iPhone / iPad",
    note: "iOS / iPadOS",
    icon: TabletSmartphone,
    steps: [
      ["获取下载方式", "不同地区的 App Store 可用情况不同，请先联系客服获取当前可用客户端与下载说明。"],
      ["安装客户端", "按照客服提供的方式完成安装并打开应用，不要从不明网页输入 Apple ID 或验证码。"],
      ["导入订阅", "在客户端中选择添加订阅，粘贴订阅地址并更新节点列表。"],
      ["允许 VPN 配置", "选择节点并连接，系统询问是否添加 VPN 配置时点击允许，然后验证网页是否能正常打开。"],
    ],
  },
] as const

const troubleshooting = [
  ["安装包无法打开", "确认下载已完成，并核对系统、芯片类型与客户端版本是否匹配。"],
  ["订阅导入失败", "重新复制完整订阅地址，检查前后是否多出空格，再刷新一次订阅。"],
  ["显示已连接但无法上网", "更新订阅、切换其他节点，然后关闭并重新开启连接。"],
  ["仍然无法解决", "把设备型号、系统版本、客户端版本和报错截图一起发给客服，处理会更快。"],
] as const

export default function InstallGuidePage() {
  return (
    <div className="min-h-screen bg-[#f4f1e8] text-[#1d1d1f] selection:bg-yellow-300 selection:text-[#1d1d1f] dark:bg-[#111214] dark:text-white">
      <section className="border-b border-black/10 bg-yellow-300 px-4 pb-16 pt-12 dark:border-white/10 dark:bg-yellow-300 dark:text-[#1d1d1f] md:pb-24 md:pt-20">
        <div className="container mx-auto max-w-6xl">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-black/30 px-4 py-2 text-sm font-semibold transition-colors hover:bg-black hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 focus-visible:ring-offset-yellow-300"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            返回首页
          </Link>

          <div className="mt-12 grid items-end gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:gap-16">
            <div>
              <h1 className="max-w-4xl text-5xl font-bold tracking-[-0.035em] md:text-7xl lg:text-[5.5rem] lg:leading-[0.96]">
                客户端
                <br />
                安装教程
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-black/70 md:text-xl">
                从获取安装包到成功连接，按你的设备完成四个动作。整个过程通常只需要几分钟。
              </p>
            </div>

            <div className="border-t-2 border-black pt-6">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm font-semibold">安装路径</span>
                <span className="rounded-full bg-black px-3 py-1 text-xs font-semibold text-white">约 5 分钟</span>
              </div>
              <ol className="mt-7 space-y-4" aria-label="安装流程概览">
                {["获取资料", "安装客户端", "导入订阅", "连接测试"].map((item, index) => (
                  <li key={item} className="flex items-center gap-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-black text-sm font-bold tabular-nums">
                      {index + 1}
                    </span>
                    <span className="font-semibold">{item}</span>
                    {index < 3 && <ArrowRight className="ml-auto hidden h-4 w-4 sm:block" aria-hidden="true" />}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-12 md:py-16">
        <div className="container mx-auto max-w-6xl">
          <div className="grid gap-8 border-b border-black/15 pb-12 dark:border-white/15 md:grid-cols-[0.72fr_1.28fr] md:gap-16">
            <div>
              <ShieldCheck className="h-8 w-8 text-[#1d1d1f] dark:text-yellow-300" aria-hidden="true" />
              <h2 className="mt-5 text-3xl font-bold tracking-[-0.025em]">开始前准备</h2>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              {[
                ["下载方式", "向客服获取与你的设备对应的客户端下载地址。"],
                ["订阅信息", "准备好客服发送的订阅地址，注意不要公开分享。"],
                ["稳定网络", "安装和首次更新节点时，请保持网络连接稳定。"],
                ["设备信息", "提前确认系统版本；Mac 用户还需要确认芯片类型。"],
              ].map(([title, description]) => (
                <div key={title} className="border-t border-black/20 pt-4 dark:border-white/20">
                  <h3 className="font-bold">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-black/65 dark:text-white/65">{description}</p>
                </div>
              ))}
            </div>
          </div>

          <nav className="py-10" aria-label="选择设备">
            <p className="mb-4 text-sm font-semibold text-black/60 dark:text-white/60">选择你的设备</p>
            <div className="flex flex-wrap gap-3">
              {platforms.map((platform) => {
                const Icon = platform.icon
                return (
                  <a
                    key={platform.id}
                    href={`#${platform.id}`}
                    className="inline-flex items-center gap-2 rounded-full border border-black/20 bg-white px-5 py-3 text-sm font-semibold transition-colors hover:border-black hover:bg-black hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 dark:border-white/20 dark:bg-white/5 dark:hover:bg-yellow-300 dark:hover:text-[#1d1d1f]"
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    {platform.name}
                  </a>
                )
              })}
            </div>
          </nav>
        </div>
      </section>

      <section className="px-4 pb-16 md:pb-24">
        <div className="container mx-auto max-w-6xl space-y-16 md:space-y-24">
          {platforms.map((platform) => {
            const Icon = platform.icon
            return (
              <article
                key={platform.id}
                id={platform.id}
                className="scroll-mt-24 border-t-2 border-[#1d1d1f] pt-7 dark:border-white"
              >
                <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">
                  <div className="lg:sticky lg:top-24 lg:self-start">
                    <Icon className="h-10 w-10 text-[#1d1d1f] dark:text-yellow-300" strokeWidth={1.7} aria-hidden="true" />
                    <h2 className="mt-5 text-4xl font-bold tracking-[-0.03em]">{platform.name}</h2>
                    <p className="mt-2 text-black/55 dark:text-white/55">{platform.note}</p>
                  </div>

                  <ol className="divide-y divide-black/15 border-b border-black/15 dark:divide-white/15 dark:border-white/15">
                    {platform.steps.map(([title, description], index) => (
                      <li key={title} className="grid gap-4 py-7 sm:grid-cols-[3rem_1fr] sm:gap-6">
                        <span className="text-2xl font-bold tabular-nums text-black/35 dark:text-white/35">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <div>
                          <h3 className="text-xl font-bold">{title}</h3>
                          <p className="mt-2 max-w-2xl leading-7 text-black/65 dark:text-white/65">{description}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      <section className="bg-[#1d1d1f] px-4 py-16 text-white md:py-24">
        <div className="container mx-auto max-w-6xl">
          <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16">
            <div>
              <CircleHelp className="h-9 w-9 text-yellow-300" aria-hidden="true" />
              <h2 className="mt-6 text-4xl font-bold tracking-[-0.03em]">常见问题</h2>
              <p className="mt-4 max-w-sm leading-7 text-white/60">先按对应方法排查；问题仍然存在时，把关键信息一次发给客服。</p>
            </div>
            <div className="divide-y divide-white/15 border-y border-white/15">
              {troubleshooting.map(([title, answer]) => (
                <div key={title} className="grid gap-2 py-6 sm:grid-cols-[0.65fr_1.35fr] sm:gap-8">
                  <h3 className="font-bold text-yellow-300">{title}</h3>
                  <p className="leading-7 text-white/70">{answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-yellow-300 px-4 py-16 text-[#1d1d1f] md:py-20">
        <div className="container mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 md:flex-row md:items-end">
          <div>
            <Wifi className="h-9 w-9" aria-hidden="true" />
            <h2 className="mt-6 max-w-3xl text-4xl font-bold tracking-[-0.03em] md:text-5xl">安装过程中遇到问题？</h2>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-black/70">联系客服获取适合你设备的安装包、订阅信息和一对一协助。</p>
          </div>
          <a
            href="https://work.weixin.qq.com/ca/cawcdeac58029da582"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-3 rounded-full bg-[#1d1d1f] px-7 py-4 font-semibold text-white transition-colors hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 focus-visible:ring-offset-yellow-300"
          >
            <MessageCircle className="h-5 w-5" aria-hidden="true" />
            联系客服
          </a>
        </div>
      </section>
    </div>
  )
}
