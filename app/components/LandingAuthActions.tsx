'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function LandingAuthActions() {
  const router = useRouter()
  const { user, userProfile, loading, logout } = useAuth()
  const displayName = userProfile?.name || user?.email?.split('@')[0] || 'Account'
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')

  async function handleSignOut() {
    try {
      await logout()
      router.refresh()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-9 w-20 animate-pulse rounded-lg bg-slate-200" />
        <div className="h-9 w-24 animate-pulse rounded-lg bg-slate-200" />
      </div>
    )
  }

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <span className="inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100 text-xs font-semibold text-slate-700">
          {userProfile?.photoURL ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={userProfile.photoURL} alt={displayName} className="h-full w-full object-cover" />
          ) : (
            initials || 'U'
          )}
        </span>
        <Link
          href="/dashboard"
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 sm:text-sm"
        >
          {displayName.split(' ')[0] || 'Dashboard'}
        </Link>
        <button
          type="button"
          onClick={handleSignOut}
          className="rounded-lg bg-emerald-500 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-emerald-600 sm:text-sm"
        >
          Sign Out
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/login"
        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 sm:text-sm"
      >
        Sign In
      </Link>
      <Link
        href="/signup"
        className="rounded-lg bg-emerald-500 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-emerald-600 sm:text-sm"
      >
        Join DC
      </Link>
    </div>
  )
}
