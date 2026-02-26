'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { getDirectoryListings } from '@/lib/firebase/firestore'
import type { DirectoryListing, DirectoryCategory } from '@/types'

const categoryLabels: Record<DirectoryCategory, string> = {
  legal: 'Legal',
  property: 'Property',
  banking: 'Banking',
  remittance: 'Remittance',
  pensions: 'Pensions',
  business: 'Business',
  citizenship: 'Citizenship',
  other: 'Other',
}

export default function DirectoryPage() {
  const [listings, setListings] = useState<DirectoryListing[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<'all' | DirectoryCategory>('all')
  const [country, setCountry] = useState('all')

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const data = await getDirectoryListings('approved')
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
    return listings.filter((l) => {
      const q = search.trim().toLowerCase()
      const matchesSearch =
        !q ||
        l.businessName.toLowerCase().includes(q) ||
        l.shortDescription.toLowerCase().includes(q) ||
        (l.city || '').toLowerCase().includes(q)
      const matchesCategory = category === 'all' || l.category === category
      const matchesCountry = country === 'all' || l.country === country
      return matchesSearch && matchesCategory && matchesCountry
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
            <Link href="/directory" className="font-medium text-slate-900">Directory</Link>
          </nav>
          <Link
            href="/directory/new"
            className="rounded-lg bg-emerald-500 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-emerald-600 sm:text-sm"
          >
            Add Listing
          </Link>
        </div>
      </header>

      <section className="border-b border-slate-200 bg-gradient-to-br from-emerald-50 via-white to-emerald-50/70 py-14 sm:py-16">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">Trusted Directory</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900 sm:text-5xl">Verified Service Providers</h1>
          <p className="mx-auto mt-3 max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base">
            Find trusted professionals and service providers for legal, property, banking, remittance, and
            other key diaspora needs.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-6 grid gap-3 md:grid-cols-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search business, service, or city..."
            className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as 'all' | DirectoryCategory)}
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
          <div className="py-16 text-center text-slate-500">Loading directory...</div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-600">
            No listings found for your current filters.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((listing) => (
              <Link
                key={listing.id}
                href={`/directory/${listing.id}`}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-300 hover:shadow-md"
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                    {categoryLabels[listing.category]}
                  </span>
                  {listing.isVerified && (
                    <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-blue-700">
                      Verified
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-slate-900">{listing.businessName}</h3>
                <p className="mt-2 line-clamp-3 text-sm text-slate-600">{listing.shortDescription}</p>
                <p className="mt-3 text-xs text-slate-500">
                  {listing.city ? `${listing.city}, ` : ''}
                  {listing.country}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
