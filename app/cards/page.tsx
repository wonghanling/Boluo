import Link from "next/link"
import Image from "next/image"
import { allCardProducts, type CardProduct } from "@/content/cards"
import { BRAND_GROUPS } from "@/lib/relograde/brand-groups"
import { getCardTheme } from "@/lib/card-theme"

function getCatalogImageClass(productId: string) {
  if (productId === "paypal") return "object-left object-center scale-[0.92]"
  if (productId === "steam") return "object-left object-center scale-[0.84]"
  return "object-left"
}

function CardTile({ product }: { product: CardProduct }) {
  const theme = getCardTheme(product.id)
  const locked = Boolean(product.comingSoon)
  const hasImage = Boolean(product.image)
  const isCardFace = product.image.startsWith("/card/")

  const body = (
    <>
      <div
        className="relative overflow-hidden rounded-[16px] px-2.5 py-2.5 text-white shadow-[0_18px_40px_rgba(2,6,23,0.45)] sm:rounded-[24px] sm:px-5 sm:py-5"
        style={{ backgroundImage: theme.gradient }}
      >
        <div className="absolute inset-0" style={{ backgroundImage: theme.overlayHighlight }} />
        <div className="relative flex items-start justify-between gap-3">
          <span className="rounded-full border border-white/16 bg-white/16 px-2 py-1 text-[8px] font-semibold tracking-[0.06em] backdrop-blur-md sm:px-3 sm:text-[11px] sm:tracking-[0.18em]">
            {locked ? "开发中" : product.badge}
          </span>
          <span className="text-[8px] font-medium uppercase tracking-[0.06em] text-white/70 sm:text-[11px] sm:tracking-[0.22em]">
            {product.shortName}
          </span>
        </div>

        <div className={`relative mt-2.5 flex h-[58px] w-full items-center sm:mt-6 sm:h-[128px] ${locked ? "opacity-45" : ""}`}>
          {hasImage ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              className={
                isCardFace
                  ? "object-contain object-center"
                  : `object-contain ${getCatalogImageClass(product.id)}`
              }
              // /card/ 下是完整卡面图，不能套滤镜，否则会被洗成纯白
              style={isCardFace ? undefined : { filter: theme.logoFilter }}
              sizes="420px"
            />
          ) : (
            <span className="text-[18px] font-semibold tracking-tight text-white/90 sm:text-[30px]">
              {product.shortName}
            </span>
          )}
        </div>

        <div className="relative mt-2.5 sm:mt-6">
          <p className="text-[9px] font-medium leading-4 text-white/72 sm:text-[14px]">
            {product.subtitle}
          </p>
          <h3 className="mt-1 line-clamp-2 text-[13px] font-semibold tracking-tight sm:mt-1.5 sm:text-[22px]">
            {product.name}
          </h3>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="line-clamp-2 text-[10px] leading-4 text-white/60 sm:text-[13px]">
          {locked ? "正在开发，敬请期待" : product.deliveryText}
        </p>
        <span className="shrink-0 text-[11px] font-semibold text-white sm:text-[13px]">
          {locked ? "暂不可进入" : "进入页面"}
        </span>
      </div>
    </>
  )

  if (locked) {
    return (
      <div
        aria-disabled="true"
        className="cursor-not-allowed rounded-[20px] border border-white/10 bg-white/[0.04] p-2.5 opacity-70 sm:rounded-[28px] sm:p-5"
      >
        {body}
      </div>
    )
  }

  return (
    <Link
      href={`/cards/${product.slug}`}
      className="block rounded-[20px] border border-white/10 bg-white/[0.04] p-2.5 transition hover:-translate-y-1 hover:border-white/30 sm:rounded-[28px] sm:p-5"
    >
      {body}
    </Link>
  )
}

export default function CardsPage() {
  const byId = new Map(allCardProducts.map((item) => [item.id, item]))
  const grouped = BRAND_GROUPS.map((group) => ({
    ...group,
    items: group.brands
      .map((id) => byId.get(id))
      .filter((item): item is CardProduct => Boolean(item)),
  })).filter((group) => group.items.length > 0)

  const groupedIds = new Set(grouped.flatMap((g) => g.items.map((i) => i.id)))
  const rest = allCardProducts.filter((item) => !groupedIds.has(item.id))

  return (
    <main className="min-h-screen bg-[#0b1020] text-white">
      <div className="mx-auto w-full max-w-[1360px] px-4 pb-12 pt-6 sm:px-6 lg:px-8 lg:pb-16 lg:pt-8">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.26em] text-white/50">
              Card Shop
            </p>
            <h1 className="mt-2 text-[30px] font-semibold tracking-tight">卡片类型</h1>
            <p className="mt-3 max-w-2xl text-[14px] leading-6 text-white/70">
              付款后在订单页点兑换入口复制兑换码，不发邮件。价格按上游实时进价换算人民币。
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex w-fit items-center rounded-full border border-white/20 px-4 py-2 text-[13px] font-medium text-white/80 transition hover:border-white/50 hover:text-white"
          >
            返回首页
          </Link>
        </div>

        <div className="flex flex-col gap-12">
          {grouped.map((group) => (
            <section key={group.id}>
              <div className="mb-5 border-b border-white/10 pb-3">
                <h2 className="text-[20px] font-semibold tracking-tight sm:text-[24px]">
                  {group.title}
                </h2>
                <p className="mt-1.5 text-[13px] leading-5 text-white/60">{group.subtitle}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
                {group.items.map((product) => (
                  <CardTile key={`${group.id}-${product.id}`} product={product} />
                ))}
              </div>
            </section>
          ))}

          {rest.length > 0 && (
            <section>
              <div className="mb-5 border-b border-white/10 pb-3">
                <h2 className="text-[20px] font-semibold tracking-tight sm:text-[24px]">其他</h2>
                <p className="mt-1.5 text-[13px] leading-5 text-white/60">尚未归类或正在接入的卡种</p>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
                {rest.map((product) => (
                  <CardTile key={`rest-${product.id}`} product={product} />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </main>
  )
}
