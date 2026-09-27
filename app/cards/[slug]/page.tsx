import Link from "next/link"
import { notFound } from "next/navigation"
import { CardPurchaseDetail } from "@/components/CardPurchaseDetail"
import { RelogradePurchasePanel } from "@/components/RelogradePurchasePanel"
import { cardProducts, getCardProductBySlug } from "@/content/cards"
import { isRelogradeBrand } from "@/lib/relograde/catalog-public"

export function generateStaticParams() {
  return cardProducts.map((product) => ({
    slug: product.slug,
  }))
}

export default function CardDetailPage({
  params,
}: {
  params: { slug: string }
}) {
  const product = getCardProductBySlug(params.slug)

  if (!product || product.comingSoon) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-[#0b1020] text-white">
      <div className="mx-auto w-full max-w-[1360px] px-4 pb-12 pt-6 sm:px-6 lg:px-8 lg:pb-16 lg:pt-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.24em] text-white/50">
              Card Detail
            </p>
            <h1 className="mt-2 text-[28px] font-semibold tracking-tight text-white">
              {product.name}
            </h1>
          </div>
          <Link
            href="/cards"
            className="inline-flex w-fit items-center rounded-full border border-white/20 px-4 py-2 text-[13px] font-medium text-white/80 transition hover:border-white/50 hover:text-white"
          >
            返回卡片列表
          </Link>
        </div>

        {isRelogradeBrand(product.id) ? (
          <RelogradePurchasePanel product={product} brandId={product.id} />
        ) : (
          <CardPurchaseDetail product={product} />
        )}
      </div>
    </main>
  )
}
