import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowLeft,
  ArrowUpRight,
  BadgeCheck,
  CircleDollarSign,
  KeyRound,
  Laptop,
  MessageCircle,
  Smartphone,
  Wifi,
  X,
  ZoomIn,
} from "lucide-react"

export const metadata: Metadata = {
  title: "GPT、Codex 与 Claude 教程",
  description: "手机端 ChatGPT、电脑端 Codex 安装使用与 Claude 套餐咨询教程。",
}

const networkSteps = [
  ["/jiaocheng/1.png", 1436, 1096, "注册并购买套餐", "点击“商店”，选择 ¥49 / 季度套餐。"],
  ["/jiaocheng/2.png", 1435, 1096, "进入仪表盘", "购买完成后，点击顶部“仪表盘”。"],
  ["/jiaocheng/3.png", 1450, 1085, "下载对应客户端", "按设备选择 iOS、Android、macOS 或 Windows，可同时给电脑和手机安装。"],
  ["/jiaocheng/4.png", 1254, 1254, "打开客户端", "安装后打开应用，进入节点选择。"],
  ["/jiaocheng/5.png", 1232, 1277, "选择节点并打开全局", "选择可用节点，再开启全局模式。"],
  ["/jiaocheng/6.jpg", 1080, 1540, "确认 VPN 已连接", "手机顶部出现 VPN 标志，即表示连接成功。"],
] as const

const googleSteps = [
  ["/jiaocheng/15.jpg", 1080, 1520, "安装 GO 安装器"],
  ["/jiaocheng/16.jpg", 1080, 1476, "打开 Google Play 商店"],
  ["/jiaocheng/17.jpg", 1080, 2520, "搜索并下载 ChatGPT"],
] as const

const claudePosters = [
  ["/jiaocheng/7.png", "Claude 套餐总览 01"],
  ["/jiaocheng/8.png", "Claude 套餐总览 02"],
  ["/jiaocheng/9.png", "Claude 套餐总览 03"],
  ["/jiaocheng/10.png", "Claude 套餐总览 04"],
  ["/jiaocheng/11.png", "Claude 体验与基础套餐"],
  ["/jiaocheng/12.png", "Claude 进阶与高额度套餐"],
  ["/jiaocheng/13.png", "Claude 企业与院校合作"],
] as const

function SectionTitle({ number, eyebrow, title, icon: Icon }: { number: string; eyebrow: string; title: string; icon: typeof Smartphone }) {
  return (
    <div className="grid gap-7 border-b-2 border-current pb-9 md:grid-cols-[0.55fr_1.45fr] md:items-end md:gap-14">
      <div className="flex items-center gap-4">
        <span className="font-mono text-sm font-black">{number}</span>
        <Icon className="h-8 w-8" strokeWidth={1.8} aria-hidden="true" />
      </div>
      <div>
        <p className="text-sm font-bold opacity-50">{eyebrow}</p>
        <h2 className="mt-2 text-4xl font-black tracking-[-0.04em] sm:text-5xl md:text-6xl">{title}</h2>
      </div>
    </div>
  )
}

function CustomerQr() {
  return (
    <div className="grid overflow-hidden border-2 border-black bg-white text-black md:grid-cols-[1fr_auto]">
      <div className="flex flex-col justify-center p-7 md:p-10">
        <div className="flex items-center gap-3"><MessageCircle className="h-6 w-6" aria-hidden="true" /><p className="text-sm font-black">微信客服</p></div>
        <h3 className="mt-5 text-2xl font-black tracking-tight md:text-3xl">扫码联系，说明你的办理需求</h3>
        <p className="mt-3 leading-7 text-black/60">获取手机安装包、账号验证、Claude 套餐、企业采购或开票均可咨询。</p>
      </div>
      <div className="border-t-2 border-black bg-[#f7d744] p-5 md:border-l-2 md:border-t-0">
        <Image src="/jiaocheng/14.jpg" alt="微信客服二维码" width={612} height={684} sizes="200px" className="mx-auto h-auto w-48 bg-white" />
      </div>
    </div>
  )
}

export default function CodexGptClaudePage() {
  return (
    <main className="min-h-screen bg-[#f4f0e7] text-[#171717] selection:bg-[#f7d744] selection:text-black">
      <section className="overflow-hidden bg-[#151515] px-4 pb-14 pt-10 text-white md:pb-20 md:pt-16">
        <div className="container mx-auto max-w-6xl">
          <Link href="/" className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm font-bold text-white/75 transition hover:border-[#f7d744] hover:text-[#f7d744]">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />返回首页
          </Link>
          <div className="mt-12 grid gap-12 lg:grid-cols-[1.3fr_0.7fr] lg:items-end lg:gap-20">
            <div>
              <p className="mb-5 flex items-center gap-3 text-sm font-black tracking-[0.2em] text-[#f7d744]"><span className="h-px w-10 bg-[#f7d744]" />安装与使用指南</p>
              <h1 className="text-5xl font-black leading-[0.98] tracking-[-0.05em] sm:text-6xl md:text-8xl">GPT · Codex<br /><span className="text-[#f7d744]">Claude 教程</span></h1>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-white/60">按页面顺序完成手机端 GPT 安装、电脑端 Codex 使用，以及 Claude 套餐咨询。</p>
            </div>
            <nav className="border-t border-white/20" aria-label="教程目录">
              {[["#gpt-mobile", "01", "GPT 手机端"], ["#codex-desktop", "02", "Codex 电脑端"], ["#claude-plans", "03", "Claude 套餐"]].map(([href, number, label]) => (
                <a key={href} href={href} className="flex items-center gap-4 border-b border-white/15 py-5 font-black transition hover:text-[#f7d744]"><span className="font-mono text-xs text-white/35">{number}</span>{label}<ArrowUpRight className="ml-auto h-4 w-4" aria-hidden="true" /></a>
              ))}
            </nav>
          </div>
        </div>
      </section>

      <section id="gpt-mobile" className="scroll-mt-24 px-4 py-16 md:py-24">
        <div className="container mx-auto max-w-6xl">
          <SectionTitle number="01" eyebrow="手机端安装" title="ChatGPT" icon={Smartphone} />
          <div className="grid border-b border-black/15 sm:grid-cols-3">
            {[["1", "准备 Gmail 账号"], ["2", "连接网络工具"], ["3", "安装 ChatGPT"]].map(([number, label]) => (
              <div key={number} className="flex items-center gap-4 border-t border-black/15 py-5 sm:border-l sm:px-5 first:sm:border-l-0"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f7d744] font-mono text-sm font-black">{number}</span><span className="font-black">{label}</span></div>
            ))}
          </div>

          <div className="grid gap-10 py-14 lg:grid-cols-[0.55fr_1.45fr] lg:gap-16">
            <div><span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#f7d744] font-mono font-black">1</span><h3 className="mt-5 text-3xl font-black tracking-tight">准备 Gmail 账号</h3><p className="mt-4 max-w-sm leading-7 text-black/60">先把账号准备好，这一步不需要下载任何应用。</p></div>
            <div className="border-l-4 border-[#f7d744] bg-white p-6 shadow-[0_16px_50px_rgba(0,0,0,0.05)] sm:p-8">
              <div className="flex items-start gap-4"><KeyRound className="mt-1 h-6 w-6 shrink-0" aria-hidden="true" /><div><h4 className="text-xl font-black">你现在要做什么？</h4><p className="mt-2 leading-7 text-black/65">准备一个 Google 账号，邮箱地址应以 <strong className="font-black text-black">@gmail.com</strong> 结尾，后续用于登录 Google Play 并下载 ChatGPT。</p><p className="mt-5 border-t border-black/10 pt-4 text-sm font-black">完成标志：你已经知道自己的 Gmail 邮箱和密码。</p></div></div>
            </div>
          </div>

          <div className="mb-8 border-t-2 border-black pt-12">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#f7d744] font-mono font-black">2</span>
            <h3 className="mt-5 text-3xl font-black tracking-tight">连接网络工具</h3>
            <p className="mt-4 max-w-2xl leading-7 text-black/60">先按顺序查看下面 6 张图，点图片可以放大。全部看完后，再点击图片下方的“注册并登录”按钮。</p>
          </div>
          <div id="network-gallery" className="scroll-mt-24 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {networkSteps.map(([src, width, height, title, description], index) => (
              <div key={src} className="contents">
                <figure className="group overflow-hidden border border-black/10 bg-white">
                  <a href={`#network-step-${index + 1}`} aria-label={`放大查看：${title}`} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-black">
                    <div className="relative overflow-hidden bg-[#e8e4dc]"><Image src={src} alt={`${index + 1}. ${title}`} width={width} height={height} sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="h-auto w-full transition duration-500 group-hover:scale-[1.015]" /><span className="absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-[#f7d744] font-mono text-sm font-black shadow">{index + 1}</span><span className="absolute bottom-3 right-3 inline-flex items-center gap-2 rounded-full bg-black/80 px-3 py-2 text-xs font-black text-white"><ZoomIn className="h-4 w-4" aria-hidden="true" />点击放大</span></div>
                  </a>
                  <figcaption className="p-5"><h4 className="font-black">{title}</h4><p className="mt-2 text-sm leading-6 text-black/60">{description}</p></figcaption>
                </figure>
                <div id={`network-step-${index + 1}`} className="fixed inset-0 z-[100] hidden items-center justify-center bg-black/90 p-4 target:flex">
                  <a href="#network-gallery" className="absolute inset-0" aria-label="关闭大图" />
                  <div className="relative z-10">
                    <Image src={src} alt={`${title}大图`} width={width} height={height} sizes="94vw" className="max-h-[90vh] w-auto max-w-[94vw] object-contain shadow-2xl" />
                    <a href="#network-gallery" className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full bg-black/80 text-white transition hover:bg-[#f7d744] hover:text-black" aria-label="关闭大图"><X className="h-5 w-5" aria-hidden="true" /></a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 bg-[#151515] p-6 text-white sm:p-8">
            <div className="flex flex-col justify-between gap-7 sm:flex-row sm:items-center">
              <div><div className="flex items-center gap-3 text-[#f7d744]"><Wifi className="h-6 w-6" aria-hidden="true" /><span className="text-sm font-black">六张图看完后，从这里开始注册</span></div><p className="mt-5 text-3xl font-black">¥49 / 季度</p><p className="mt-2 text-sm text-white/50">折合每月约 ¥16.33</p></div>
              <a href="https://www.xiguajiasu8.com/?path=register&code=U6gvvcEg" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#f7d744] px-6 py-3 font-black text-black transition hover:bg-white">注册并登录<ArrowUpRight className="h-4 w-4" aria-hidden="true" /></a>
            </div>
            <p className="mt-6 border-t border-white/15 pt-5 text-sm font-black text-white/80">完成标志：客户端已连接，手机顶部出现 VPN 标志。</p>
          </div>

          <div className="mt-20 grid gap-10 border-t-2 border-black pt-12 lg:grid-cols-[0.55fr_1.45fr] lg:gap-16">
            <div><span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#f7d744] font-mono font-black">3</span><h3 className="mt-5 text-3xl font-black tracking-tight">安装 ChatGPT</h3><p className="mt-4 leading-7 text-black/60">确认手机顶部已有 VPN 标志，再联系客服获取 GO 安装器和 Google Play 商店。</p></div>
            <div>
              <div className="bg-[#f7d744] p-6 sm:p-8">
                <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
                  <div><div className="flex items-center gap-3"><MessageCircle className="h-6 w-6" aria-hidden="true" /><h4 className="text-xl font-black">联系客服获取安装包</h4></div><p className="mt-3 max-w-xl leading-7 text-black/65">GO 安装器和 Google Play 商店不在网站提供下载，请扫描本页客服二维码，由客服微信发送。</p></div>
                  <a href="#customer-service" className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-black px-6 py-3 font-black text-white transition hover:bg-white hover:text-black">查看客服二维码<ArrowUpRight className="h-4 w-4" aria-hidden="true" /></a>
                </div>
              </div>
              <ol className="mt-8 divide-y divide-black/15 border-y border-black/15">
                {["先打开网络工具，选择节点并开启全局模式。", "联系客服获取谷歌安装包和 GO 安装器，先安装并打开 GO 安装器。", "完成安装后打开 Google Play 商店，登录 Google 账号。", "在 Google Play 搜索 ChatGPT，下载并安装即可。"].map((text, index) => <li key={text} className="flex gap-5 py-5"><span className="font-mono text-sm font-black text-black/35">{String(index + 1).padStart(2, "0")}</span><span className="font-semibold leading-6">{text}</span></li>)}
              </ol>
            </div>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {googleSteps.map(([src, width, height, title], index) => (
              <figure key={src} className="overflow-hidden border border-black/10 bg-white">
                <div className="relative overflow-hidden bg-[#e8e4dc]"><Image src={src} alt={title} width={width} height={height} sizes="(max-width: 768px) 100vw, 33vw" className="h-auto w-full" /><span className="absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-[#f7d744] font-mono text-sm font-black shadow">{index + 1}</span></div>
                <figcaption className="p-5 font-black">{title}</figcaption>
              </figure>
            ))}
          </div>
          <div className="mt-8 border-l-4 border-[#f7d744] bg-white p-6 text-sm font-black shadow-[0_16px_50px_rgba(0,0,0,0.05)]">完成标志：ChatGPT 已安装，并且可以打开登录页面。</div>
        </div>
      </section>

      <section id="codex-desktop" className="scroll-mt-24 bg-[#151515] px-4 py-16 text-white md:py-24">
        <div className="container mx-auto max-w-6xl">
          <SectionTitle number="02" eyebrow="电脑端安装" title="Codex / ChatGPT" icon={Laptop} />
          <div className="grid gap-12 py-14 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
            <div>
              <p className="text-lg leading-8 text-white/65">先在电脑上打开已经安装好的网络工具，然后下载 ChatGPT Windows 桌面应用。Codex 已包含在 ChatGPT 桌面应用中。</p>
              <a href="https://get.microsoft.com/installer/download/9PLM9XGG6VKS?cid=website_cta_psi" target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex min-h-14 items-center gap-3 rounded-full bg-[#f7d744] px-7 py-4 font-black text-black transition hover:bg-white"><ArrowUpRight className="h-5 w-5" aria-hidden="true" />官方下载 Windows 版</a>
              <div className="mt-4 flex items-center gap-2 text-xs text-white/40"><BadgeCheck className="h-4 w-4" aria-hidden="true" />Microsoft 官方安装程序</div>
            </div>
            <ol className="border-t border-white/20">
              {[["打开网络工具", "在电脑上选择节点并开启全局模式。"], ["下载并安装", "点击左侧按钮，按照提示安装 ChatGPT Windows 桌面应用。"], ["登录同一账号", "可使用 Google 账号登录；也可以使用 QQ 邮箱注册 ChatGPT，再用该邮箱登录电脑端 Codex / ChatGPT。"], ["需要验证时联系客服", "如登录过程中需要账号验证，请扫描页面客服二维码联系处理。"]].map(([title, description], index) => (
                <li key={title} className="grid gap-3 border-b border-white/20 py-6 sm:grid-cols-[3rem_1fr]"><span className="font-mono text-xl font-black text-[#f7d744]">{String(index + 1).padStart(2, "0")}</span><div><h3 className="text-lg font-black">{title}</h3><p className="mt-2 leading-7 text-white/55">{description}</p></div></li>
              ))}
            </ol>
          </div>
          <CustomerQr />
        </div>
      </section>
      <section id="claude-plans" className="scroll-mt-24 px-4 py-16 md:py-24">
        <div className="container mx-auto max-w-6xl">
          <SectionTitle number="03" eyebrow="套餐与采购" title="Claude" icon={CircleDollarSign} />
          <div className="grid gap-10 py-12 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">
            <div><p className="text-2xl font-black leading-tight">以下套餐图片全部为企业采购价</p><p className="mt-4 text-lg font-bold text-black/55">拒绝封号焦虑 · 稳定使用</p></div>
            <div className="bg-[#f7d744] p-7 sm:p-9">
              <CircleDollarSign className="h-8 w-8" aria-hidden="true" />
              <h3 className="mt-7 text-2xl font-black">100–500 起批</h3>
              <p className="mt-3 max-w-2xl leading-7 text-black/65">下方 7–13 图展示的套餐均为企业采购方案。企业采购与开票需求，请联系客服确认具体数量、价格和开票信息。</p>
            </div>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {claudePosters.map(([src, title], index) => (
              <figure key={src} className={`overflow-hidden bg-white ${index === 6 ? "sm:col-span-2 sm:mx-auto sm:w-[calc(50%-0.75rem)]" : ""}`}>
                <Image src={src} alt={title} width={1254} height={1254} sizes="(max-width: 640px) 100vw, 50vw" className="h-auto w-full" />
                <figcaption className="flex items-center justify-between border-t border-black/10 px-5 py-4"><span className="font-bold">{title}</span><span className="font-mono text-xs text-black/35">{String(index + 1).padStart(2, "0")}</span></figcaption>
              </figure>
            ))}
          </div>
          <div id="customer-service" className="mt-12 scroll-mt-24"><CustomerQr /></div>
        </div>
      </section>
    </main>
  )
}
