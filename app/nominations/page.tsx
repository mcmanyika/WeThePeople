'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { getCandidateNominations } from '@/lib/firebase/firestore'
import type { CandidateNomination, PublicOffice } from '@/types'

const officeLabels: Record<PublicOffice, string> = {
  president: 'President',
  vice_president: 'Vice President',
  member_of_parliament: 'Member of Parliament',
  councillor: 'Councillor',
  mayor: 'Mayor',
  other: 'Other',
}

export default function NominationsPage() {
  const [nominations, setNominations] = useState<CandidateNomination[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [office, setOffice] = useState<'all' | PublicOffice>('all')

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const data = await getCandidateNominations('approved')
        setNominations(data)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = useMemo(() => {
    return nominations.filter((n) => {
      const q = search.trim().toLowerCase()
      const matchesSearch =
        !q ||
        n.fullName.toLowerCase().includes(q) ||
        n.bio.toLowerCase().includes(q) ||
        (n.location || '').toLowerCase().includes(q)
      const matchesOffice = office === 'all' || n.office === office
      return matchesSearch && matchesOffice
    })
  }, [nominations, search, office])

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
            <Link href="/nominations" className="font-medium text-slate-900">Nominations</Link>
          </nav>
          <Link
            href="/nominations/new"
            className="rounded-lg bg-emerald-500 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-emerald-600 sm:text-sm"
          >
            Nominate Candidate
          </Link>
        </div>
      </header>

      <section className="border-b border-slate-200 bg-gradient-to-br from-emerald-50 via-white to-emerald-50/70 py-14 sm:py-16">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">Voting & Civic Participation</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900 sm:text-5xl">Candidate Nominations</h1>
          <p className="mx-auto mt-3 max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base">
            Nominate civic leaders and vote for preferred candidates for public office.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-6 grid gap-3 md:grid-cols-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search candidate name, profile, or location..."
            className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <select
            value={office}
            onChange={(e) => setOffice(e.target.value as 'all' | PublicOffice)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All offices</option>
            {Object.entries(officeLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-500">Loading nominations...</div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-600">
            No approved nominations found.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((n) => (
              <Link
                key={n.id}
                href={`/nominations/${n.id}`}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-300 hover:shadow-md"
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                    {officeLabels[n.office]}
                  </span>
                  {n.isPreferredCandidate && (
                    <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
                      Preferred
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-slate-900">{n.fullName}</h3>
                <p className="mt-2 line-clamp-3 text-sm text-slate-600">{n.bio}</p>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                  <span>{n.location || 'Location not provided'}</span>
                  <span>{n.voteCount || 0} votes</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
