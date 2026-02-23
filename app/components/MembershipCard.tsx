'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { getMembershipByUser } from '@/lib/firebase/firestore'
import type { Membership } from '@/types'

function toDate(date: Date | any): Date | null {
  if (!date) return null
  if (date instanceof Date) return date
  // Handle Firestore Timestamp
  if (date && typeof date === 'object' && 'toDate' in date) {
    return (date as any).toDate()
  }
  // Fallback for string or number
  return new Date(date as string | number)
}

export default function MembershipCard() {
  const { user, userProfile } = useAuth()
  const [membership, setMembership] = useState<Membership | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

  const fetchMembership = async () => {
    if (!user) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError('')
    
    try {
      const data = await getMembershipByUser(user.uid)
      console.log('Fetched membership:', data)
      setMembership(data)
    } catch (err: any) {
      console.error('Error fetching membership:', err)
      setError(err.message || 'Failed to load membership')
      setMembership(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMembership()
  }, [user, userProfile?.membershipTier])

  // Refresh membership when component becomes visible (e.g., after returning from payment)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && user) {
        fetchMembership()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [user])

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-5 flex items-center justify-center h-full">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5 flex items-center gap-3 h-full">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-100">
          <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-red-700">Error</p>
          <button onClick={fetchMembership} className="text-xs text-red-600 underline hover:no-underline">Try again</button>
        </div>
      </div>
    )
  }

  if (!membership || membership.status !== 'succeeded') {
    return (
      <a href="/dashboard/membership" className="rounded-xl border border-dashed border-slate-300 bg-white p-5 flex items-center gap-4 h-full hover:border-slate-400 hover:bg-slate-50 transition-all group">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100 group-hover:bg-slate-200 transition-colors">
          <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-slate-900">No Active Membership</p>
          <p className="text-xs text-slate-500">Click to view options</p>
        </div>
      </a>
    )
  }

  const createdAt = toDate(membership.createdAt)
  const nextDue = membership.nextDueDate ? toDate(membership.nextDueDate) : null

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 flex items-center gap-4 h-full">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100">
        <svg className="h-5 w-5 text-slate-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-slate-900 truncate">
          {membership.planLabel || `${membership.tier} Membership`}
        </p>
        <p className="text-xs text-slate-500">
          {nextDue
            ? `Due: ${nextDue.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`
            : createdAt
            ? `Since ${createdAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`
            : 'Active'}
        </p>
      </div>
      <a
        href="/dashboard/membership"
        className="shrink-0 rounded-lg border border-slate-200 px-3 py-1.5 text-[11px] font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
      >
        Manage
      </a>
    </div>
  )
}

