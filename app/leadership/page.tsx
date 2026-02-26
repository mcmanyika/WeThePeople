'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { getLeaders } from '@/lib/firebase/firestore'
import type { Leader } from '@/types'

export default function LeadershipPage() {
  const [leaders, setLeaders] = useState<Leader[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function loadLeaders() {
      try {
        setLoading(true)
        const data = await getLeaders(true)
        setLeaders(data)
      } catch (error) {
        console.error('Error fetching leaders:', error)
      } finally {
        setLoading(false)
      }
    }
    loadLeaders()
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return leaders
    return leaders.filter((leader) =>
      leader.name.toLowerCase().includes(q) ||
      leader.title.toLowerCase().includes(q) ||
      leader.bio.toLowerCase().includes(q) ||
      (leader.xHandle || '').toLowerCase().includes(q)
    )
  }, [leaders, search])

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
            <Link href="/leadership" className="font-medium text-slate-900">Leaders</Link>
          </nav>
          <Link
            href="/signup"
            className="rounded-lg bg-emerald-500 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-emerald-600 sm:text-sm"
          >
            Join DC
          </Link>
        </div>
      </header>

      <section className="border-b border-slate-200 bg-gradient-to-br from-emerald-50 via-white to-emerald-50/70 py-14 sm:py-16">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">Leadership Directory</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900 sm:text-5xl">Meet Civic Leaders</h1>
          <p className="mx-auto mt-3 max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base">
            Browse leader profiles, read bios, and connect through verified public X handles.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, title, bio, or X handle..."
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-500">Loading leaders...</div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-600">
            No leaders found for your search.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((leader) => (
              <Link
                key={leader.id}
                href={`/leadership/${leader.id}`}
                className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-emerald-300 hover:shadow-md"
              >
                <div className="mb-4 h-16 w-16 overflow-hidden rounded-full bg-slate-100">
                  {leader.imageUrl ? (
                    <img src={leader.imageUrl} alt={leader.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-lg font-bold text-slate-400">
                      {leader.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <h3 className="text-lg font-bold text-slate-900">{leader.name}</h3>
                <p className="mt-1 text-sm font-medium text-slate-600">{leader.title}</p>
                <p className="mt-3 line-clamp-3 text-sm text-slate-600">{leader.bio}</p>
                {leader.xHandle && (
                  <p className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-slate-500 group-hover:text-slate-700">
                    <span className="inline-flex h-4 w-4 items-center justify-center rounded bg-slate-100 text-[10px]">X</span>
                    @{leader.xHandle}
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
