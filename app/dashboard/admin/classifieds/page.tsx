'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import ProtectedRoute from '@/app/components/ProtectedRoute'
import AdminRoute from '@/app/components/AdminRoute'
import DashboardNav from '@/app/components/DashboardNav'
import { useAuth } from '@/contexts/AuthContext'
import { getClassifiedListings, reviewClassifiedListing, updateClassifiedListing } from '@/lib/firebase/firestore'
import type { ClassifiedCategory, ClassifiedListing, ClassifiedStatus } from '@/types'

const categoryLabels: Record<ClassifiedCategory, string> = {
  jobs: 'Jobs',
  housing: 'Housing',
  vehicles: 'Vehicles',
  services: 'Services',
  marketplace: 'Marketplace',
  community: 'Community',
  other: 'Other',
}

export default function AdminClassifiedsPage() {
  return (
    <ProtectedRoute>
      <AdminRoute>
        <div className="min-h-screen bg-slate-50">
          <div className="border-b bg-white">
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Classifieds</h1>
                <Link href="/dashboard" className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900">
                  ← Back to Dashboard
                </Link>
              </div>
            </div>
          </div>

          <DashboardNav />

          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
            <ClassifiedsManagement />
          </div>
        </div>
      </AdminRoute>
    </ProtectedRoute>
  )
}

function ClassifiedsManagement() {
  const { userProfile } = useAuth()
  const [listings, setListings] = useState<ClassifiedListing[]>([])
  const [loading, setLoading] = useState(true)
  const [workingId, setWorkingId] = useState<string | null>(null)

  useEffect(() => {
    loadListings()
  }, [])

  async function loadListings() {
    try {
      setLoading(true)
      const data = await getClassifiedListings('all')
      setListings(data)
    } finally {
      setLoading(false)
    }
  }

  async function review(listingId: string, status: ClassifiedStatus, rejectionReason?: string) {
    if (!userProfile?.uid) return
    try {
      setWorkingId(listingId)
      await reviewClassifiedListing(listingId, status, userProfile.uid, rejectionReason)
      await loadListings()
    } finally {
      setWorkingId(null)
    }
  }

  async function toggleFeatured(listing: ClassifiedListing) {
    try {
      setWorkingId(listing.id)
      await updateClassifiedListing(listing.id, { isFeatured: !listing.isFeatured })
      await loadListings()
    } finally {
      setWorkingId(null)
    }
  }

  if (loading) return <div className="py-16 text-center text-slate-500">Loading classifieds...</div>

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">
        Review classifieds submissions, approve quality listings, and manage visibility.
      </p>

      {listings.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
          No classifieds found yet.
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
              {listing.isFeatured && (
                <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
                  Featured
                </span>
              )}
            </div>

            <h3 className="text-lg font-bold text-slate-900">{listing.title}</h3>
            <p className="mt-2 text-sm text-slate-600">{listing.description}</p>
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
                onClick={() => review(listing.id, 'rejected', 'Needs clearer details before approval.')}
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
                onClick={() => review(listing.id, 'sold')}
                disabled={workingId === listing.id}
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              >
                Mark Sold
              </button>
              <button
                onClick={() => toggleFeatured(listing)}
                disabled={workingId === listing.id}
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              >
                {listing.isFeatured ? 'Remove Featured' : 'Mark Featured'}
              </button>
              <Link
                href={`/classifieds/${listing.id}`}
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
