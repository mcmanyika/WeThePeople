'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { getMembershipApplicationByUser } from '@/lib/firebase/firestore'
import MembershipApplicationForm from '@/app/components/MembershipApplicationForm'
import ProtectedRoute from '@/app/components/ProtectedRoute'

function MembershipApplicationContent() {
  const { user } = useAuth()
  const router = useRouter()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    async function checkExistingApplication() {
      if (!user) return
      try {
        const existing = await getMembershipApplicationByUser(user.uid)
        if (existing) {
          router.replace('/dashboard')
          return
        }
      } catch (err) {
        console.error('Error checking existing application:', err)
      }
      setChecking(false)
    }
    checkExistingApplication()
  }, [user, router])

  if (checking) {
    return (
      <main className="min-h-screen bg-[#f8fbfa] text-slate-900">
        <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
            <Link href="/" className="flex items-center gap-2">
              <span className="inline-flex h-8 w-10 items-center justify-center rounded-md bg-emerald-500 text-[10px] font-bold text-white">
                DC
              </span>
              <span className="text-sm font-semibold tracking-tight text-slate-900 sm:text-base">
                Diaspora Connect
              </span>
            </Link>
            <nav className="hidden items-center gap-6 text-sm text-slate-500 md:flex">
              <Link href="/about" className="transition-colors hover:text-slate-900">
                About
              </Link>
              <Link href="/dashboard" className="transition-colors hover:text-slate-900">
                Dashboard
              </Link>
              <Link href="/membership-application" className="font-medium text-slate-900">
                Membership
              </Link>
            </nav>
          </div>
        </header>
        <section className="border-b border-slate-200 bg-gradient-to-br from-emerald-50 via-white to-emerald-50/70 py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="text-center">
              <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">Join DC</p>
              <h1 className="mb-2 text-2xl font-bold text-slate-900 sm:text-3xl md:text-4xl">Membership Application</h1>
            </div>
          </div>
        </section>
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-slate-900 border-r-transparent"></div>
            <p className="text-slate-600">Checking application status...</p>
          </div>
        </div>
        <footer className="border-t border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-8 text-center text-sm text-slate-600 sm:px-6">
            <p>© 2026 Diaspora Connect (DC). All rights reserved.</p>
          </div>
        </footer>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#f8fbfa] text-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="inline-flex h-8 w-10 items-center justify-center rounded-md bg-emerald-500 text-[10px] font-bold text-white">
              DC
            </span>
            <span className="text-sm font-semibold tracking-tight text-slate-900 sm:text-base">
              Diaspora Connect
            </span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-slate-500 md:flex">
            <Link href="/about" className="transition-colors hover:text-slate-900">
              About
            </Link>
            <Link href="/dashboard" className="transition-colors hover:text-slate-900">
              Dashboard
            </Link>
            <Link href="/membership-application" className="font-medium text-slate-900">
              Membership
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-slate-200 bg-gradient-to-br from-emerald-50 via-white to-emerald-50/70 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center">
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">Join DC</p>
            <h1 className="mb-2 text-2xl font-bold text-slate-900 sm:text-3xl md:text-4xl">Membership Application</h1>
            <p className="text-sm text-slate-600 sm:text-base">Join a community focused on civic participation, youth voice, and social impact.</p>
          </div>
        </div>
      </section>

      <section className="bg-[#f8fbfa] py-10 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          {/* Info Banner */}
          <div className="mb-8 rounded-xl border border-amber-200 bg-amber-50 p-4 sm:p-6">
            <div className="flex items-start gap-3">
              <svg className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              <div>
                <h3 className="text-sm font-bold text-amber-900">Diaspora Connect (DC)</h3>
                <p className="mt-1 text-sm text-amber-700">
                  DC is a non-partisan civic platform dedicated to informed participation on political, youth,
                  and social issues that concern society. Membership is open to individuals and organisations
                  who share this commitment.
                </p>
              </div>
            </div>
          </div>

          {/* Form Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
            <MembershipApplicationForm />
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 text-center text-sm text-slate-600 sm:px-6">
          <p>© 2026 Diaspora Connect (DC). All rights reserved.</p>
        </div>
      </footer>
    </main>
  )
}

export default function MembershipApplicationPage() {
  return (
    <ProtectedRoute>
      <MembershipApplicationContent />
    </ProtectedRoute>
  )
}
