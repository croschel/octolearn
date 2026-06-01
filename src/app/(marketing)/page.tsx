// Landing page is served from app/page.tsx to avoid route group conflicts.
// This file exists only to satisfy the (marketing) segment; it is never reached.
import { notFound } from 'next/navigation'

export default function MarketingIndex() {
  return notFound()
}
