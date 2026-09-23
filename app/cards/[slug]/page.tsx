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

  if (!product) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto w-full max-w-[1360px] px-4 pb-12 pt-6 sm:px-6 lg:px-8 lg:pb-16 lg:pt-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.24em] text-slate-400">
              Card Detail
            </p>
            <h1 className="mt-2 text-[28px] font-semibold tracking-tight text-slate-950">
              {product.name}
            </h1>
          </div>
          <Link
            href="/cards"
            className="inline-flex w-fit items-center rounded-full border border-slate-200 px-4 py-2 text-[13px] font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-950"
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
