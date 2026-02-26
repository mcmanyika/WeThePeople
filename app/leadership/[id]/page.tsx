'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { getLeaderById } from '@/lib/firebase/firestore'
import type { Leader } from '@/types'

export default function LeaderDetailPage() {
  const params = useParams()
  const id = params.id as string
  const [leader, setLeader] = useState<Leader | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadLeader() {
      try {
        setLoading(true)
        const data = await getLeaderById(id)
        setLeader(data)
      } finally {
        setLoading(false)
      }
    }
    if (id) loadLeader()
  }, [id])

  if (loading) {
    return <main className="min-h-screen bg-[#f8fbfa] p-8 text-center text-slate-500">Loading leader profile...</main>
  }

  if (!leader || !leader.isActive) {
    return (
      <main className="min-h-screen bg-[#f8fbfa] px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Leader not found</h1>
        <p className="mt-2 text-slate-600">This profile may be unavailable.</p>
        <Link href="/leadership" className="mt-6 inline-flex rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600">
          Back to Leaders Directory
        </Link>
      </main>
    )
  }

  const xUrl = leader.xHandle
    ? `https://x.com/${leader.xHandle.replace(/^@/, '')}`
    : null

  return (
    <main className="min-h-screen bg-[#f8fbfa] text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/leadership" className="text-sm font-medium text-slate-600 hover:text-slate-900">
            ← Back to Leaders Directory
          </Link>
          {xUrl && (
            <a
              href={xUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 sm:text-sm"
            >
              <span className="inline-flex h-4 w-4 items-center justify-center rounded bg-slate-100 text-[10px]">X</span>
              @{leader.xHandle?.replace(/^@/, '')}
            </a>
          )}
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <div className="h-28 w-28 shrink-0 overflow-hidden rounded-full bg-slate-100">
              {leader.imageUrl ? (
                <img src={leader.imageUrl} alt={leader.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-slate-400">
                  {leader.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <h1 className="text-3xl font-bold text-slate-900">{leader.name}</h1>
              <p className="mt-2 text-sm font-semibold uppercase tracking-wide text-emerald-700">{leader.title}</p>
              {xUrl && (
                <a
                  href={xUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
                >
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-slate-100 text-[11px]">X</span>
                  @{leader.xHandle?.replace(/^@/, '')}
                </a>
              )}
            </div>
          </div>

          <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">
            {leader.bio}
          </div>
        </div>
      </section>
    </main>
  )
}
