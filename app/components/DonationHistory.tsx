'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { getDonationsByUser, getMembershipsByUser } from '@/lib/firebase/firestore'
import type { Donation, Membership } from '@/types'

function formatDate(date: Date | any): string {
  if (date instanceof Date) {
    return date.toLocaleDateString()
  }
  // Handle Firestore Timestamp
  if (date && typeof date === 'object' && 'toDate' in date) {
    return (date as any).toDate().toLocaleDateString()
  }
  // Fallback for string or number
  return new Date(date as string | number).toLocaleDateString()
}

export default function DonationHistory() {
  const { user } = useAuth()
  const [historyItems, setHistoryItems] = useState<(Donation & { source?: 'donation' | 'manual_membership'; paymentMethod?: string })[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

  const fetchDonations = async () => {
    if (!user) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError('')
    
    try {
      const [donationsData, membershipsData] = await Promise.all([
        getDonationsByUser(user.uid),
        getMembershipsByUser(user.uid),
      ])

      const manualMembershipRows: Donation[] = membershipsData
        .filter((membership: Membership) =>
          Boolean(membership.paymentMethod && membership.paymentMethod !== 'stripe')
        )
        .map((membership: Membership) => ({
          id: `manual-membership-${membership.id}`,
          userId: membership.userId,
          amount: membership.amount || 0,
          currency: (membership.currency || 'USD').toLowerCase(),
          status: membership.status,
          stripePaymentIntentId: membership.stripePaymentIntentId,
          createdAt: membership.paidAt || membership.createdAt,
          description:
            `Manual membership payment${membership.planLabel ? ` - ${membership.planLabel}` : ''}`,
        }))

      const merged = [
        ...donationsData.map((d) => ({ ...d, source: 'donation' as const })),
        ...manualMembershipRows.map((d) => ({ ...d, source: 'manual_membership' as const })),
      ]

      merged.sort((a, b) => {
        const dateA = a.createdAt instanceof Date ? a.createdAt.getTime() : new Date(a.createdAt as any).getTime()
        const dateB = b.createdAt instanceof Date ? b.createdAt.getTime() : new Date(b.createdAt as any).getTime()
        return dateB - dateA
      })

      console.log('Fetched donation history rows:', merged.length, merged)
      setHistoryItems(merged)
    } catch (err: any) {
      console.error('Error fetching donations:', err)
      setError(err.message || 'Failed to load donations')
      setHistoryItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDonations()
  }, [user])

  // Refresh donations when component becomes visible (e.g., after making a donation)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && user) {
        fetchDonations()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [user])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-slate-900 border-r-transparent"></div>
          <p className="text-slate-600">Loading donations...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center">
        <p className="text-red-600 mb-4">Error loading donations: {error}</p>
        <button
          onClick={fetchDonations}
          className="inline-block rounded-lg bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (historyItems.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-8 text-center">
        <p className="text-slate-600">No donations or manual payments yet.</p>
        <a
          href="/#donate"
          className="mt-4 inline-block rounded-lg bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
        >
          Make a Donation
        </a>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Donation History</h2>
        <p className="mt-1 text-sm text-slate-600">
          View all your past donations
        </p>
      </div>

      <div className="space-y-3">
        {historyItems.map((donation) => (
          <div
            key={donation.id}
            className="rounded-lg border border-slate-200 bg-white p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold">
                  ${donation.amount.toFixed(2)} {donation.currency.toUpperCase()}
                </p>
                <p className="text-sm text-slate-600">
                  {formatDate(donation.createdAt)}
                </p>
                {donation.description && (
                  <p className="mt-1 text-sm text-slate-500">
                    {donation.description}
                  </p>
                )}
                {donation.source === 'manual_membership' && (
                  <p className="mt-1 text-xs font-medium text-slate-500">Manual Entry</p>
                )}
              </div>
              <div
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  donation.status === 'succeeded'
                    ? 'bg-green-100 text-green-700'
                    : donation.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {donation.status}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

