import Link from "next/link"
import Image from "next/image"
import { cardProducts } from "@/content/cards"

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

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {cardProducts.map((product) => (
            <Link
              key={product.id}
              href={`/cards/${product.slug}`}
              className="group block rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_14px_32px_rgba(15,23,42,0.05)] transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-[0_18px_40px_rgba(15,23,42,0.09)]"
            >
              <div
                className={`relative overflow-hidden rounded-[24px] bg-gradient-to-br ${product.accent} px-5 py-5 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.22)]`}
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.34),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.12),transparent_28%)]" />
                <div className="absolute -left-10 -top-10 h-28 w-28 rounded-full bg-white/10 blur-2xl" />
                <div className="absolute -bottom-12 right-5 h-24 w-24 rounded-full bg-black/10 blur-2xl" />

                <div className="flex items-start justify-between gap-3">
                  <span className="relative rounded-full bg-white/18 px-3 py-1 text-[11px] font-semibold tracking-[0.18em] text-white backdrop-blur-md">
                    {product.badge}
                  </span>
                  <span className="relative text-[11px] font-medium uppercase tracking-[0.22em] text-white/82">
                    {product.shortName}
                  </span>
                </div>

                <div className="relative mt-6 rounded-[20px] border border-white/16 bg-white/10 px-5 py-5 backdrop-blur-[10px]">
                  <div className="relative h-[128px] w-full">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className={`object-contain ${
                        product.id === "paypal"
                          ? "object-left object-center scale-[0.92]"
                          : product.id === "steam"
                            ? "object-left object-center scale-[0.84]"
                            : "object-left"
                      } drop-shadow-[0_10px_24px_rgba(15,23,42,0.18)]`}
                      sizes="420px"
                    />
                  </div>
                </div>

                <div className="relative mt-6">
                  <p className="text-[14px] font-medium text-white/76">{product.subtitle}</p>
                  <h2 className="mt-1.5 text-[27px] font-semibold tracking-tight">
                    {product.name}
                  </h2>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <p className="text-[13px] text-slate-600">{product.deliveryText}</p>
                <span className="text-[13px] font-semibold text-slate-950 transition group-hover:text-blue-600">
                  进入页面
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
