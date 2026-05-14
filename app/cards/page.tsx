import Link from "next/link"
import Image from "next/image"
import { cardProducts } from "@/content/cards"
import { getCardTheme } from "@/lib/card-theme"

function getCatalogImageClass(productId: string) {
  if (productId === "paypal") {
    return "object-left object-center scale-[0.92]"
  }

  if (productId === "steam") {
    return "object-left object-center scale-[0.84]"
  }

  return "object-left"
}

export default function CardsPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto w-full max-w-[1360px] px-4 pb-12 pt-6 sm:px-6 lg:px-8 lg:pb-16 lg:pt-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.26em] text-slate-400">
              Card Shop
            </p>
            <h1 className="mt-2 text-[30px] font-semibold tracking-tight text-slate-950">
              卡片类型
            </h1>
            <p className="mt-3 max-w-2xl text-[14px] leading-6 text-slate-600">
              选择要购买的卡片类型，进入独立详情页后填写购买信息并付款。后续新增卡种也会继续放在这里。
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex w-fit items-center rounded-full border border-slate-200 px-4 py-2 text-[13px] font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-950"
          >
            返回首页
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:gap-5 xl:grid-cols-3">
          {cardProducts.map((product) => {
            const theme = getCardTheme(product.id)
            const isAmazon = product.id === "amazon"

            return (
              <Link
                key={product.id}
                href={`/cards/${product.slug}`}
                className="group block rounded-[20px] border border-slate-200 bg-white p-2.5 shadow-[0_14px_32px_rgba(15,23,42,0.05)] transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-[0_18px_40px_rgba(15,23,42,0.09)] sm:rounded-[28px] sm:p-5"
              >
                <div
                  className="relative overflow-hidden rounded-[16px] px-2.5 py-2.5 text-slate-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.22)] sm:rounded-[24px] sm:px-5 sm:py-5"
                  style={{
                    backgroundImage: isAmazon
                      ? "linear-gradient(135deg, #d4d4d8 0%, #9ca3af 56%, #6b7280 100%)"
                      : theme.gradient,
                  }}
                >
                  {!isAmazon && (
                    <div
                      className="absolute inset-0"
                      style={{ backgroundImage: theme.overlayHighlight }}
                    />
                  )}
                  {!isAmazon && (
                    <div
                      className="absolute -left-10 -top-10 h-28 w-28 rounded-full blur-2xl"
                      style={{ backgroundColor: theme.glowA }}
                    />
                  )}
                  {!isAmazon && (
                    <div className="absolute -bottom-12 right-5 h-24 w-24 rounded-full bg-black/10 blur-2xl" />
                  )}

                  <div className="flex items-start justify-between gap-3">
                    <span className="relative rounded-full bg-white/55 px-2 py-1 text-[8px] font-semibold tracking-[0.06em] text-slate-900 backdrop-blur-md sm:px-3 sm:text-[11px] sm:tracking-[0.18em]">
                      {product.badge}
                    </span>
                    {product.id !== "amazon" ? (
                      <span className="relative text-[8px] font-medium uppercase tracking-[0.06em] text-slate-900/75 sm:text-[11px] sm:tracking-[0.22em]">
                        {product.shortName}
                      </span>
                    ) : (
                      <span />
                    )}
                  </div>

                  <div className="relative mt-2.5 h-[58px] w-full sm:mt-6 sm:h-[128px]">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className={`object-contain ${getCatalogImageClass(product.id)} drop-shadow-[0_10px_24px_rgba(15,23,42,0.18)]`}
                      style={{
                        filter: isAmazon
                          ? "drop-shadow(0 8px 18px rgba(15,23,42,0.10))"
                          : theme.logoFilter,
                      }}
                      sizes="420px"
                    />
                  </div>

                  <div className="relative mt-2.5 sm:mt-6">
                    <p className="text-[9px] font-medium leading-4 text-slate-900/72 sm:text-[14px]">
                      {product.subtitle}
                    </p>
                    <h2 className="mt-1 text-[13px] font-semibold tracking-tight text-slate-950 sm:mt-1.5 sm:text-[27px]">
                      {product.name}
                    </h2>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between gap-3">
                  <p className="line-clamp-2 text-[10px] leading-4 text-slate-600 sm:text-[13px]">
                    {product.deliveryText}
                  </p>
                  <span className="shrink-0 text-[11px] font-semibold text-slate-950 transition group-hover:text-blue-600 sm:text-[13px]">
                    进入页面
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </main>
  )
}
