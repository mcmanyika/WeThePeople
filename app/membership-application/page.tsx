'use client'

import MembershipApplicationForm from '@/app/components/MembershipApplicationForm'
import Link from 'next/link'

export default function MembershipApplicationPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Membership Application</h1>
              <p className="mt-1 text-sm text-slate-500">&ldquo;Defending the Constitution is Defending Our Future&rdquo;</p>
            </div>
            <Link
              href="/"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        {/* Info Banner */}
        <div className="mb-8 rounded-xl border border-amber-200 bg-amber-50 p-4 sm:p-6">
          <div className="flex items-start gap-3">
            <svg className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <div>
              <h3 className="text-sm font-bold text-amber-900">Defend the Constitution Platform (DCP)</h3>
              <p className="mt-1 text-sm text-amber-700">
                The DCP is a non-partisan, non-electoral platform dedicated to the defence, protection, and full implementation 
                of the 2013 Constitution of Zimbabwe. Membership is open to individuals and organisations who share this commitment.
              </p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
          <MembershipApplicationForm />
        </div>
      </div>
    </div>
  )
}
