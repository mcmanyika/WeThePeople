'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { castNominationVote, getCandidateNominationById } from '@/lib/firebase/firestore'
import { useAuth } from '@/contexts/AuthContext'
import type { CandidateNomination, PublicOffice } from '@/types'

const officeLabels: Record<PublicOffice, string> = {
  president: 'President',
  vice_president: 'Vice President',
  member_of_parliament: 'Member of Parliament',
  councillor: 'Councillor',
  mayor: 'Mayor',
  other: 'Other',
}

export default function NominationDetailPage() {
  const params = useParams()
  const id = params.id as string
  const { user } = useAuth()
  const [nomination, setNomination] = useState<CandidateNomination | null>(null)
  const [loading, setLoading] = useState(true)
  const [voting, setVoting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const data = await getCandidateNominationById(id)
        setNomination(data)
      } finally {
        setLoading(false)
      }
    }
    if (id) load()
  }, [id])

  async function handleVote() {
    if (!user?.uid || !nomination) return
    try {
      setVoting(true)
      setError('')
      setSuccess('')
      await castNominationVote(nomination.id, nomination.cycleId, nomination.office, user.uid)
      const latest = await getCandidateNominationById(nomination.id)
      setNomination(latest)
      setSuccess('Your vote has been recorded.')
    } catch (err: any) {
      setError(err?.message || 'Unable to submit vote')
    } finally {
      setVoting(false)
    }
  }

  if (loading) {
    return <main className="min-h-screen bg-[#f8fbfa] p-8 text-center text-slate-500">Loading nomination...</main>
  }

  if (!nomination || nomination.status !== 'approved') {
    return (
      <main className="min-h-screen bg-[#f8fbfa] px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Nomination not found</h1>
        <p className="mt-2 text-slate-600">This nomination may be unavailable or unpublished.</p>
        <Link href="/nominations" className="mt-6 inline-flex rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600">
          Back to Nominations
        </Link>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#f8fbfa] text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/nominations" className="text-sm font-medium text-slate-600 hover:text-slate-900">
            ← Back to Nominations
          </Link>
          {nomination.isPreferredCandidate && (
            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-700">
              Preferred Candidate
            </span>
          )}
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
              {officeLabels[nomination.office]}
            </span>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
              Cycle: {nomination.cycleId}
            </span>
          </div>

          <h1 className="text-3xl font-bold text-slate-900">{nomination.fullName}</h1>
          <p className="mt-2 text-sm text-slate-500">{nomination.location || 'Location not provided'}</p>
          <p className="mt-4 text-slate-700">{nomination.bio}</p>

          {nomination.manifesto && (
            <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">
              <p className="mb-2 font-semibold text-slate-900">Manifesto</p>
              {nomination.manifesto}
            </div>
          )}

          <div className="mt-6 flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-600">
              Current support: <span className="font-semibold text-slate-900">{nomination.voteCount || 0} votes</span>
            </p>
            {user ? (
              <button
                type="button"
                onClick={handleVote}
                disabled={voting}
                className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-600 disabled:opacity-60"
              >
                {voting ? 'Submitting...' : 'Vote for Candidate'}
              </button>
            ) : (
              <Link
                href="/login"
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Sign in to vote
              </Link>
            )}
          </div>

          {error && <p className="mt-3 text-sm font-medium text-red-600">{error}</p>}
          {success && <p className="mt-3 text-sm font-medium text-emerald-600">{success}</p>}
        </div>
      </section>
    </main>
  )
}
