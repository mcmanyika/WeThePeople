'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, Suspense } from 'react'
import DonationModal from '@/app/components/DonationModal'

function WelcomeContent() {
  const { user, userProfile, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const nextUrl = searchParams.get('next')
  const [donationModalOpen, setDonationModalOpen] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  // Auto-show donation modal on first visit
  useEffect(() => {
    if (!loading && user) {
      const hasSeenDonateModal = sessionStorage.getItem('welcome_donate_shown')
      if (!hasSeenDonateModal) {
        const timer = setTimeout(() => {
          setDonationModalOpen(true)
          sessionStorage.setItem('welcome_donate_shown', '1')
        }, 1500) // slight delay so user reads the welcome message first
        return () => clearTimeout(timer)
      }
    }
  }, [loading, user])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-slate-900 border-r-transparent" />
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    )
  }

  const displayName = userProfile?.name || user?.displayName || 'Member'

  return (
    <div className="min-h-screen bg-[#f8fbfa]">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="inline-flex h-8 w-10 items-center justify-center rounded-md bg-emerald-500 text-[10px] font-bold text-white">
              WTP
            </span>
            <span className="text-sm font-semibold tracking-tight text-slate-900 sm:text-base">
              We The People
            </span>
          </Link>
          <Link
            href="/dashboard"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 sm:text-sm"
          >
            Dashboard
          </Link>
        </div>
      </header>

      <section className="border-b border-slate-200 bg-gradient-to-br from-emerald-50 via-white to-emerald-50/70 py-14 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
            Welcome
          </p>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-4xl">Welcome to We The People</h1>
          <p className="mt-3 text-sm text-slate-600 sm:text-base">
            Thank you for joining a platform dedicated to civic participation, political awareness, youth
            priorities, and social issues that shape our society.
          </p>
        </div>
      </section>

      {/* Message Body */}
      <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-10 shadow-sm">
          <p className="text-base sm:text-lg text-slate-700 leading-relaxed mb-6">
            Dear <strong className="text-slate-900">{displayName}</strong>,
          </p>

          <p className="text-base text-slate-700 leading-relaxed mb-6">
            Thank you for joining <strong>We The People (WTP)</strong>.
          </p>

          <p className="text-base text-slate-700 leading-relaxed mb-6">
            You are now part of a growing community committed to informed, peaceful, and constructive civic
            participation.
          </p>

          <p className="text-base text-slate-700 leading-relaxed mb-6">
            WTP is non-partisan and citizen-centered. We create space for conversations and participation
            around governance, politics, youth concerns, and social challenges affecting everyday life.
          </p>

          <p className="text-base text-slate-700 leading-relaxed mb-4">
            Your membership strengthens a collective effort to:
          </p>

          <ul className="mb-6 space-y-3">
            {[
              'Promote civic participation and informed public dialogue',
              'Increase political awareness through accessible insights',
              'Elevate youth voices and leadership on national issues',
              'Address social concerns affecting communities at home and abroad',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
                <span className="text-base text-slate-700">{item}</span>
              </li>
            ))}
          </ul>

          <p className="text-base text-slate-700 leading-relaxed mb-6">
            We encourage you to stay engaged, take part in surveys and issue-based discussions, and help
            build a culture of accountability and responsible participation.
          </p>

          {/* Highlight Quote */}
          <div className="mb-6 rounded-lg border-l-4 border-emerald-500 bg-emerald-50 py-4 px-5">
            <p className="text-base sm:text-lg font-semibold italic text-slate-900">
              Informed citizens build stronger societies.
            </p>
          </div>

          <p className="text-base text-slate-700 leading-relaxed mb-8">
            Your support helps us sustain research, outreach, and participation tools that enable more people
            to engage in issues that matter.
          </p>

          {/* Signature */}
          <div className="mb-8 border-t border-slate-100 pt-6">
            <p className="text-base text-slate-700 mb-1">Warm regards,</p>
            <p className="text-base font-bold text-slate-900">The WTP Team</p>
            <p className="text-sm text-slate-500">We The People (WTP)</p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href={nextUrl || '/membership-application'}
              className="inline-flex items-center justify-center rounded-lg bg-emerald-500 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-600 transition-colors"
            >
              {nextUrl ? 'Continue →' : 'Apply for Membership →'}
            </Link>
            <button
              onClick={() => setDonationModalOpen(true)}
              className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
            >
              Donate
            </button>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Go to Dashboard
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-lg px-6 py-3 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>

      {/* Donation Modal */}
      <DonationModal isOpen={donationModalOpen} onClose={() => setDonationModalOpen(false)} />

      {/* Footer */}
      <div className="border-t bg-slate-100 py-6 text-center">
        <p className="text-xs text-slate-500">
          &copy; {new Date().getFullYear()} We The People (WTP). All rights reserved.
        </p>
      </div>
    </div>
  )
}

export default function WelcomePage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-slate-900 border-r-transparent" />
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    }>
      <WelcomeContent />
    </Suspense>
  )
}
