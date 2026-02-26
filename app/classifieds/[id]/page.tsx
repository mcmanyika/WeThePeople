'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { getClassifiedListingById } from '@/lib/firebase/firestore'
import type { ClassifiedCategory, ClassifiedListing } from '@/types'

const categoryLabels: Record<ClassifiedCategory, string> = {
  jobs: 'Jobs',
  housing: 'Housing',
  vehicles: 'Vehicles',
  services: 'Services',
  marketplace: 'Marketplace',
  community: 'Community',
  other: 'Other',
}

export default function ClassifiedDetailPage() {
  const params = useParams()
  const id = params.id as string
  const [listing, setListing] = useState<ClassifiedListing | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const data = await getClassifiedListingById(id)
        setListing(data)
      } finally {
        setLoading(false)
      }
    }
    if (id) load()
  }, [id])

  const isExpired = listing?.expiresAt ? new Date(listing.expiresAt as any).getTime() <= Date.now() : false

  if (loading) {
    return <main className="min-h-screen bg-[#f8fbfa] p-8 text-center text-slate-500">Loading classified...</main>
  }

  if (!listing || listing.status !== 'approved' || isExpired) {
    return (
      <main className="min-h-screen bg-[#f8fbfa] px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Listing not found</h1>
        <p className="mt-2 text-slate-600">This listing may be unavailable, unpublished, or expired.</p>
        <Link href="/classifieds" className="mt-6 inline-flex rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600">
          Back to Classifieds
        </Link>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#f8fbfa] text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/classifieds" className="text-sm font-medium text-slate-600 hover:text-slate-900">
            ← Back to Classifieds
          </Link>
          {listing.isFeatured && (
            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-700">
              Featured
            </span>
          )}
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
              {categoryLabels[listing.category]}
            </span>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
              {listing.country}
            </span>
            {listing.city && (
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                {listing.city}
              </span>
            )}
          </div>

          <h1 className="text-3xl font-bold text-slate-900">{listing.title}</h1>
          {listing.price !== undefined && (
            <p className="mt-2 text-lg font-semibold text-slate-900">
              {listing.currency || 'USD'} {listing.price.toLocaleString()}
              {listing.isNegotiable ? ' (Negotiable)' : ''}
            </p>
          )}

          <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">
            {listing.description}
          </div>

          <div className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
            {listing.contactEmail && (
              <p>
                <span className="font-semibold text-slate-900">Email:</span>{' '}
                <a href={`mailto:${listing.contactEmail}`} className="text-emerald-700 hover:underline">{listing.contactEmail}</a>
              </p>
            )}
            {listing.contactPhone && (
              <p>
                <span className="font-semibold text-slate-900">Phone:</span> {listing.contactPhone}
              </p>
            )}
            {listing.whatsapp && (
              <p>
                <span className="font-semibold text-slate-900">WhatsApp:</span> {listing.whatsapp}
              </p>
            )}
            {listing.expiresAt && (
              <p>
                <span className="font-semibold text-slate-900">Expires:</span>{' '}
                {new Date(listing.expiresAt as any).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}
