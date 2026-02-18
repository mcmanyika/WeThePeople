'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import DashboardNav from '@/app/components/DashboardNav'
import { getAllDownloadStats, type DownloadStat } from '@/lib/firebase/firestore'

export default function DownloadStatsPage() {
  const { user, userProfile } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<DownloadStat[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || userProfile?.role !== 'admin') {
      router.push('/dashboard')
      return
    }
    loadStats()
  }, [user, userProfile])

  const loadStats = async () => {
    try {
      setLoading(true)
      const data = await getAllDownloadStats()
      setStats(data)
    } catch (err) {
      console.error('Error loading download stats:', err)
    } finally {
      setLoading(false)
    }
  }

  const totalDownloads = stats.reduce((sum, s) => sum + s.count, 0)
  const topDocument = stats.length > 0 ? stats[0] : null

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-ZW', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="border-b bg-white">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
            <h1 className="text-3xl font-bold">Download Stats</h1>
          </div>
        </div>
        <DashboardNav />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="mb-3 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-slate-900 border-r-transparent" />
            <p className="text-sm text-slate-500">Loading stats...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Download Stats</h1>
              <p className="mt-1 text-sm text-slate-500">Track document downloads across the platform</p>
            </div>
            <Link
              href="/dashboard"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              ← Back
            </Link>
          </div>
        </div>
      </div>

      <DashboardNav />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Summary Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          {/* Total Downloads */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{totalDownloads.toLocaleString()}</p>
                <p className="text-xs text-slate-500">Total Downloads</p>
              </div>
            </div>
          </div>

          {/* Tracked Documents */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
                <svg className="h-5 w-5 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats.length}</p>
                <p className="text-xs text-slate-500">Tracked Documents</p>
              </div>
            </div>
          </div>

          {/* Most Downloaded */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
                <svg className="h-5 w-5 text-amber-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.023 6.023 0 01-7.54 0" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{topDocument ? topDocument.count.toLocaleString() : '—'}</p>
                <p className="text-xs text-slate-500 truncate max-w-[180px]" title={topDocument?.label}>
                  {topDocument ? `Top: ${topDocument.label}` : 'No downloads yet'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Downloads Table */}
        {stats.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <svg className="mx-auto h-12 w-12 text-slate-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            <h3 className="mt-3 text-lg font-bold text-slate-900">No Downloads Tracked Yet</h3>
            <p className="mt-1 text-sm text-slate-500">Download counts will appear here once users start downloading documents.</p>
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-slate-100 px-6 py-4">
              <h2 className="text-base font-bold text-slate-900">All Downloads</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">#</th>
                    <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">Document</th>
                    <th className="px-6 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-500">Downloads</th>
                    <th className="px-6 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-500">First Download</th>
                    <th className="px-6 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-500">Last Download</th>
                    <th className="px-6 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-500">% of Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stats.map((stat, index) => {
                    const percentage = totalDownloads > 0 ? ((stat.count / totalDownloads) * 100) : 0
                    return (
                      <tr key={stat.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 text-sm text-slate-400 font-mono">{index + 1}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-50">
                              <svg className="h-4 w-4 text-red-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                              </svg>
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-slate-900 truncate max-w-xs" title={stat.label}>
                                {stat.label}
                              </p>
                              <p className="text-[11px] text-slate-400 font-mono">{stat.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-sm font-bold text-blue-700">
                            {stat.count.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right text-xs text-slate-500">{formatDate(stat.createdAt)}</td>
                        <td className="px-6 py-4 text-right text-xs text-slate-500">{formatDate(stat.lastDownloadedAt)}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100">
                              <div
                                className="h-full rounded-full bg-blue-500 transition-all"
                                style={{ width: `${Math.min(percentage, 100)}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium text-slate-600 tabular-nums w-10 text-right">
                              {percentage.toFixed(1)}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Footer summary */}
            <div className="border-t border-slate-100 bg-slate-50/50 px-6 py-3">
              <p className="text-xs text-slate-500">
                Showing {stats.length} tracked {stats.length === 1 ? 'document' : 'documents'} · {totalDownloads.toLocaleString()} total downloads
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
