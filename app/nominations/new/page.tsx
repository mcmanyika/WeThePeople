'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import ProtectedRoute from '@/app/components/ProtectedRoute'
import { useAuth } from '@/contexts/AuthContext'
import { createCandidateNomination } from '@/lib/firebase/firestore'
import type { PublicOffice } from '@/types'

const officeOptions: { value: PublicOffice; label: string }[] = [
  { value: 'president', label: 'President' },
  { value: 'vice_president', label: 'Vice President' },
  { value: 'member_of_parliament', label: 'Member of Parliament' },
  { value: 'councillor', label: 'Councillor' },
  { value: 'mayor', label: 'Mayor' },
  { value: 'other', label: 'Other' },
]

export default function NewNominationPage() {
  return (
    <ProtectedRoute>
      <NominationForm />
    </ProtectedRoute>
  )
}

function NominationForm() {
  const router = useRouter()
  const { user, userProfile } = useAuth()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [fullName, setFullName] = useState('')
  const [office, setOffice] = useState<PublicOffice>('member_of_parliament')
  const [bio, setBio] = useState('')
  const [manifesto, setManifesto] = useState('')
  const [location, setLocation] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!user?.uid) {
      setError('You must be signed in to nominate a candidate.')
      return
    }
    if (!fullName.trim() || !bio.trim()) {
      setError('Candidate full name and bio are required.')
      return
    }

    try {
      setSaving(true)
      await createCandidateNomination({
        cycleId: '2026-general',
        office,
        fullName: fullName.trim(),
        bio: bio.trim(),
        manifesto: manifesto.trim() || undefined,
        location: location.trim() || undefined,
        proposedByUserId: user.uid,
        proposedByName: userProfile?.name || user.email || 'Citizen',
        status: 'pending_review',
      })
      router.push('/nominations?submitted=1')
    } catch (err: any) {
      setError(err?.message || 'Failed to submit nomination')
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#f8fbfa] px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <Link href="/nominations" className="text-sm font-medium text-slate-600 hover:text-slate-900">
          ← Back to Nominations
        </Link>
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-2xl font-bold text-slate-900">Nominate Candidate</h1>
          <p className="mt-2 text-sm text-slate-600">
            Submit a nominee for public office. Nominations are reviewed before public voting.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Candidate Full Name *</label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Office *</label>
              <select
                value={office}
                onChange={(e) => setOffice(e.target.value as PublicOffice)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {officeOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Candidate Bio *</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Manifesto</label>
              <textarea
                value={manifesto}
                onChange={(e) => setManifesto(e.target.value)}
                rows={5}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Location</label>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {error && <p className="text-sm font-medium text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={saving}
              className="inline-flex rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? 'Submitting...' : 'Submit Nomination'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
