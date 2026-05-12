import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const orderId = request.nextUrl.searchParams.get('orderId')
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://boluoing.com'

  const target = new URL('/', baseUrl)
  target.searchParams.set('payment', 'success')

  if (orderId) {
    target.searchParams.set('orderId', orderId)
  }

  return NextResponse.redirect(target)
}
