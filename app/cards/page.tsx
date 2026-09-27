import Link from "next/link"
import Image from "next/image"
import { cardProducts } from "@/content/cards"

function getCatalogImageClass(productId: string) {
  if (productId === "paypal") return "object-left object-center scale-[0.92]"
  if (productId === "steam") return "object-left object-center scale-[0.84]"
  return "object-left"
}

export default function CardsPage() {
  return (
    <main className="min-h-screen bg-[#f4f4f5] text-slate-950">
      <div className="mx-auto w-full max-w-[1360px] px-4 pb-12 pt-6 sm:px-6 lg:px-8 lg:pb-16 lg:pt-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.26em] text-slate-500">
              Card Shop
            </p>
            <h1 className="mt-2 text-[30px] font-semibold tracking-tight">卡片类型</h1>
            <p className="mt-3 max-w-2xl text-[14px] leading-6 text-slate-600">
              目前可购买 Visa、Mastercard、Apple、Google Play。其余卡种正在接入，暂不可进入。
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex w-fit items-center rounded-full border border-slate-300 bg-white px-4 py-2 text-[13px] font-medium text-slate-700 transition hover:border-slate-950"
          >
            返回首页
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:gap-5 xl:grid-cols-3">
          {cardProducts.map((product) => {
            const locked = Boolean(product.comingSoon)
            const body = (
              <>
                <div className="relative overflow-hidden rounded-[16px] bg-slate-950 px-2.5 py-2.5 text-white sm:rounded-[24px] sm:px-5 sm:py-5">
                  <div className="flex items-start justify-between gap-3">
                    <span className="rounded-full bg-white/10 px-2 py-1 text-[8px] font-semibold tracking-[0.06em] sm:px-3 sm:text-[11px]">
                      {locked ? "开发中" : product.badge}
                    </span>
                    <span className="text-[8px] font-medium uppercase tracking-[0.06em] text-white/70 sm:text-[11px]">
                      {product.shortName}
                    </span>
                  </div>
                  <div className={`relative mt-2.5 h-[58px] w-full sm:mt-6 sm:h-[128px] ${locked ? "opacity-40" : ""}`}>
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className={`object-contain ${getCatalogImageClass(product.id)}`}
                      style={{ filter: "brightness(0) invert(1)" }}
                      sizes="420px"
                    />
                  </div>
                  <div className="relative mt-2.5 sm:mt-6">
                    <p className="text-[9px] font-medium leading-4 text-white/60 sm:text-[14px]">
                      {product.subtitle}
                    </p>
                    <h2 className="mt-1 text-[13px] font-semibold tracking-tight sm:text-[27px]">
                      {product.name}
                    </h2>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <p className="line-clamp-2 text-[10px] leading-4 text-slate-600 sm:text-[13px]">
                    {locked ? "正在开发，600 多张卡片陆续开放，敬请期待" : product.deliveryText}
                  </p>
                  <span className="shrink-0 text-[11px] font-semibold sm:text-[13px]">
                    {locked ? "暂不可进入" : "进入页面"}
                  </span>
                </div>
              </>
            )

            if (locked) {
              return (
                <div
                  key={product.id}
                  aria-disabled="true"
                  className="cursor-not-allowed rounded-[20px] border border-slate-200 bg-white p-2.5 opacity-75 sm:rounded-[28px] sm:p-5"
                >
                  {body}
                </div>
              )
            }

            return (
              <Link
                key={product.id}
                href={`/cards/${product.slug}`}
                className="block rounded-[20px] border border-slate-200 bg-white p-2.5 transition hover:-translate-y-1 hover:border-slate-950 sm:rounded-[28px] sm:p-5"
              >
                {body}
              </Link>
            )
          })}
        </div>
      </div>
    </main>
  )
}
