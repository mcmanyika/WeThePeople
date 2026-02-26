'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import ProtectedRoute from '@/app/components/ProtectedRoute'
import AdminRoute from '@/app/components/AdminRoute'
import DashboardNav from '@/app/components/DashboardNav'
import { useAuth } from '@/contexts/AuthContext'
import { getDirectoryListings, reviewDirectoryListing, updateDirectoryListing } from '@/lib/firebase/firestore'
import type { DirectoryListing, DirectoryCategory, DirectoryStatus } from '@/types'

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

export default function AdminDirectoryPage() {
  return (
    <ProtectedRoute>
      <AdminRoute>
        <div className="min-h-screen bg-slate-50">
          <div className="border-b bg-white">
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Directory Listings</h1>
                <Link href="/dashboard" className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900">
                  ← Back to Dashboard
                </Link>
              </div>
            </div>
          </div>

          <DashboardNav />

          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
            <DirectoryManagement />
          </div>
        </div>
      </AdminRoute>
    </ProtectedRoute>
  )
}

function DirectoryManagement() {
  const { userProfile } = useAuth()
  const [listings, setListings] = useState<DirectoryListing[]>([])
  const [loading, setLoading] = useState(true)
  const [workingId, setWorkingId] = useState<string | null>(null)

  useEffect(() => {
    loadListings()
  }, [])

  async function loadListings() {
    try {
      setLoading(true)
      const data = await getDirectoryListings('all')
      setListings(data)
    } finally {
      setLoading(false)
    }
  }

  async function review(listingId: string, status: DirectoryStatus, rejectionReason?: string) {
    if (!userProfile?.uid) return
    try {
      setWorkingId(listingId)
      await reviewDirectoryListing(listingId, status, userProfile.uid, rejectionReason)
      await loadListings()
    } finally {
      setWorkingId(null)
    }
  }

  async function toggleVerification(listing: DirectoryListing) {
    try {
      setWorkingId(listing.id)
      await updateDirectoryListing(listing.id, { isVerified: !listing.isVerified })
      await loadListings()
    } finally {
      setWorkingId(null)
    }
  }

  if (loading) return <div className="py-16 text-center text-slate-500">Loading listings...</div>

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">
        Review new listings, approve trusted providers, and manage visibility.
      </p>

      {listings.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
          No directory listings yet.
        </div>
      ) : (
        listings.map((listing) => (
          <div key={listing.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-700">
                {categoryLabels[listing.category]}
              </span>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-700">
                {listing.country}
              </span>
              <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${
                listing.status === 'approved'
                  ? 'bg-emerald-100 text-emerald-700'
                  : listing.status === 'pending_review'
                    ? 'bg-amber-100 text-amber-700'
                    : listing.status === 'rejected'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-slate-100 text-slate-700'
              }`}>
                {listing.status.replace('_', ' ')}
              </span>
              {listing.isVerified && (
                <span className="rounded-full bg-blue-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-blue-700">
                  Verified
                </span>
              )}
            </div>

            <h3 className="text-lg font-bold text-slate-900">{listing.businessName}</h3>
            <p className="mt-2 text-sm text-slate-600">{listing.shortDescription}</p>
            <p className="mt-2 text-xs text-slate-500">Owner: {listing.ownerUserId}</p>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => review(listing.id, 'approved')}
                disabled={workingId === listing.id}
                className="rounded-md bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                Approve
              </button>
              <button
                onClick={() => review(listing.id, 'rejected', 'Needs more complete information.')}
                disabled={workingId === listing.id}
                className="rounded-md bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-60"
              >
                Reject
              </button>
              <button
                onClick={() => review(listing.id, 'suspended')}
                disabled={workingId === listing.id}
                className="rounded-md bg-slate-700 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
              >
                Suspend
              </button>
              <button
                onClick={() => toggleVerification(listing)}
                disabled={workingId === listing.id}
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              >
                {listing.isVerified ? 'Remove Verified' : 'Mark Verified'}
              </button>
              <Link
                href={`/directory/${listing.id}`}
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
