'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import ProtectedRoute from '@/app/components/ProtectedRoute'
import AdminRoute from '@/app/components/AdminRoute'
import DashboardNav from '@/app/components/DashboardNav'
import { useAuth } from '@/contexts/AuthContext'
import { getCandidateNominations, reviewCandidateNomination, updateCandidateNomination } from '@/lib/firebase/firestore'
import type { CandidateNomination, CandidateNominationStatus, PublicOffice } from '@/types'

const officeLabels: Record<PublicOffice, string> = {
  president: 'President',
  vice_president: 'Vice President',
  member_of_parliament: 'Member of Parliament',
  councillor: 'Councillor',
  mayor: 'Mayor',
  other: 'Other',
}

export default function AdminNominationsPage() {
  return (
    <ProtectedRoute>
      <AdminRoute>
        <div className="min-h-screen bg-slate-50">
          <div className="border-b bg-white">
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Candidate Nominations</h1>
                <Link href="/dashboard" className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900">
                  ← Back to Dashboard
                </Link>
              </div>
            </div>
          </div>

          <DashboardNav />

          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
            <NominationsManagement />
          </div>
        </div>
      </AdminRoute>
    </ProtectedRoute>
  )
}

function NominationsManagement() {
  const { userProfile } = useAuth()
  const [nominations, setNominations] = useState<CandidateNomination[]>([])
  const [loading, setLoading] = useState(true)
  const [workingId, setWorkingId] = useState<string | null>(null)

  useEffect(() => {
    loadNominations()
  }, [])

  async function loadNominations() {
    try {
      setLoading(true)
      const data = await getCandidateNominations('all')
      setNominations(data)
    } finally {
      setLoading(false)
    }
  }

  async function review(nominationId: string, status: CandidateNominationStatus, rejectionReason?: string) {
    if (!userProfile?.uid) return
    try {
      setWorkingId(nominationId)
      await reviewCandidateNomination(nominationId, status, userProfile.uid, rejectionReason)
      await loadNominations()
    } finally {
      setWorkingId(null)
    }
  }

  async function togglePreferred(nomination: CandidateNomination) {
    try {
      setWorkingId(nomination.id)
      await updateCandidateNomination(nomination.id, { isPreferredCandidate: !nomination.isPreferredCandidate })
      await loadNominations()
    } finally {
      setWorkingId(null)
    }
  }

  if (loading) return <div className="py-16 text-center text-slate-500">Loading nominations...</div>

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">
        Review candidate nominations, approve public voting entries, and mark preferred candidates.
      </p>

      {nominations.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
          No nominations yet.
        </div>
      ) : (
        nominations.map((nomination) => (
          <div key={nomination.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-700">
                {officeLabels[nomination.office]}
              </span>
              <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${
                nomination.status === 'approved'
                  ? 'bg-emerald-100 text-emerald-700'
                  : nomination.status === 'pending_review'
                    ? 'bg-amber-100 text-amber-700'
                    : nomination.status === 'rejected'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-slate-100 text-slate-700'
              }`}>
                {nomination.status.replace('_', ' ')}
              </span>
              {nomination.isPreferredCandidate && (
                <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
                  Preferred
                </span>
              )}
            </div>

            <h3 className="text-lg font-bold text-slate-900">{nomination.fullName}</h3>
            <p className="mt-2 text-sm text-slate-600">{nomination.bio}</p>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <span>Cycle: {nomination.cycleId}</span>
              <span>Votes: {nomination.voteCount || 0}</span>
              <span>Proposed by: {nomination.proposedByName || nomination.proposedByUserId}</span>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => review(nomination.id, 'approved')}
                disabled={workingId === nomination.id}
                className="rounded-md bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                Approve
              </button>
              <button
                onClick={() => review(nomination.id, 'rejected', 'Nomination needs more details before approval.')}
                disabled={workingId === nomination.id}
                className="rounded-md bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-60"
              >
                Reject
              </button>
              <button
                onClick={() => review(nomination.id, 'suspended')}
                disabled={workingId === nomination.id}
                className="rounded-md bg-slate-700 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
              >
                Suspend
              </button>
              <button
                onClick={() => togglePreferred(nomination)}
                disabled={workingId === nomination.id}
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              >
                {nomination.isPreferredCandidate ? 'Remove Preferred' : 'Mark Preferred'}
              </button>
              <Link
                href={`/nominations/${nomination.id}`}
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                View Public
              </Link>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
