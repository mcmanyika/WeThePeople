'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { getClassifiedListings } from '@/lib/firebase/firestore'
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

export default function ClassifiedsPage() {
  const [listings, setListings] = useState<ClassifiedListing[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<'all' | ClassifiedCategory>('all')
  const [country, setCountry] = useState('all')

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const data = await getClassifiedListings('approved')
        setListings(data)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const countries = useMemo(() => {
    return ['all', ...Array.from(new Set(listings.map((l) => l.country).filter(Boolean))).sort()]
  }, [listings])

  const filtered = useMemo(() => {
    const now = new Date().getTime()
    return listings.filter((l) => {
      const expiresAtMs = l.expiresAt ? new Date(l.expiresAt as any).getTime() : null
      const isNotExpired = !expiresAtMs || expiresAtMs > now
      const q = search.trim().toLowerCase()
      const matchesSearch =
        !q ||
        l.title.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q) ||
        (l.city || '').toLowerCase().includes(q)
      const matchesCategory = category === 'all' || l.category === category
      const matchesCountry = country === 'all' || l.country === country
      return isNotExpired && matchesSearch && matchesCategory && matchesCountry
    })
  }, [listings, search, category, country])

  return (
    <main className="min-h-screen bg-[#f8fbfa] text-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="inline-flex h-8 w-10 items-center justify-center rounded-md bg-emerald-500 text-[10px] font-bold text-white">
              DC
            </span>
            <span className="text-sm font-semibold tracking-tight text-slate-900 sm:text-base">Diaspora Connect</span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-slate-500 md:flex">
            <Link href="/about" className="transition-colors hover:text-slate-900">About</Link>
            <Link href="/news" className="transition-colors hover:text-slate-900">Articles</Link>
            <Link href="/directory" className="transition-colors hover:text-slate-900">Directory</Link>
            <Link href="/classifieds" className="font-medium text-slate-900">Classifieds</Link>
          </nav>
          <Link
            href="/classifieds/new"
            className="rounded-lg bg-emerald-500 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-emerald-600 sm:text-sm"
          >
            Post Ad
          </Link>
        </div>
      </header>

      <section className="border-b border-slate-200 bg-gradient-to-br from-emerald-50 via-white to-emerald-50/70 py-14 sm:py-16">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">Classifieds</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900 sm:text-5xl">Diaspora Marketplace</h1>
          <p className="mx-auto mt-3 max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base">
            Explore jobs, services, rentals, vehicles, and community opportunities shared by trusted members.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-6 grid gap-3 md:grid-cols-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title, description, or city..."
            className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as 'all' | ClassifiedCategory)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All categories</option>
            {Object.entries(categoryLabels).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {countries.map((c) => (
              <option key={c} value={c}>
                {c === 'all' ? 'All countries' : c}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-500">Loading classifieds...</div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-600">
            No classifieds found for your current filters.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((listing) => (
              <Link
                key={listing.id}
                href={`/classifieds/${listing.id}`}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-300 hover:shadow-md"
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                    {categoryLabels[listing.category]}
                  </span>
                  {listing.isFeatured && (
                    <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
                      Featured
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-slate-900">{listing.title}</h3>
                <p className="mt-2 line-clamp-3 text-sm text-slate-600">{listing.description}</p>
                <div className="mt-3 flex items-center justify-between">
                  <p className="text-xs text-slate-500">
                    {listing.city ? `${listing.city}, ` : ''}
                    {listing.country}
                  </p>
                  {listing.price !== undefined && (
                    <p className="text-sm font-semibold text-slate-900">
                      {listing.currency || 'USD'} {listing.price.toLocaleString()}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
