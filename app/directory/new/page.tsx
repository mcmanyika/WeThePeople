'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import ProtectedRoute from '@/app/components/ProtectedRoute'
import { useAuth } from '@/contexts/AuthContext'
import { createDirectoryListing } from '@/lib/firebase/firestore'
import type { DirectoryCategory } from '@/types'

const categories: { value: DirectoryCategory; label: string }[] = [
  { value: 'legal', label: 'Legal' },
  { value: 'property', label: 'Property' },
  { value: 'banking', label: 'Banking' },
  { value: 'remittance', label: 'Remittance' },
  { value: 'pensions', label: 'Pensions' },
  { value: 'business', label: 'Business' },
  { value: 'citizenship', label: 'Citizenship' },
  { value: 'other', label: 'Other' },
]

export default function NewDirectoryListingPage() {
  return (
    <ProtectedRoute>
      <NewDirectoryListingForm />
    </ProtectedRoute>
  )
}

function NewDirectoryListingForm() {
  const router = useRouter()
  const { userProfile } = useAuth()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [category, setCategory] = useState<DirectoryCategory>('legal')
  const [shortDescription, setShortDescription] = useState('')
  const [longDescription, setLongDescription] = useState('')
  const [country, setCountry] = useState('')
  const [city, setCity] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [website, setWebsite] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!userProfile?.uid) {
      setError('You must be signed in to submit a listing.')
      return
    }
    if (!businessName.trim() || !shortDescription.trim() || !country.trim()) {
      setError('Business name, short description, and country are required.')
      return
    }

    try {
      setSaving(true)
      await createDirectoryListing({
        ownerUserId: userProfile.uid,
        businessName: businessName.trim(),
        category,
        shortDescription: shortDescription.trim(),
        longDescription: longDescription.trim() || undefined,
        country: country.trim(),
        city: city.trim() || undefined,
        contactEmail: contactEmail.trim() || undefined,
        contactPhone: contactPhone.trim() || undefined,
        website: website.trim() || undefined,
        isVerified: false,
        status: 'pending_review',
      })
      router.push('/directory?submitted=1')
    } catch (err: any) {
      setError(err?.message || 'Failed to submit listing')
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#f8fbfa] px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <Link href="/directory" className="text-sm font-medium text-slate-600 hover:text-slate-900">
          ← Back to Directory
        </Link>
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-2xl font-bold text-slate-900">Submit Directory Listing</h1>
          <p className="mt-2 text-sm text-slate-600">
            Submit your service for review. Listings go live after admin approval.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Business Name *</label>
              <input
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as DirectoryCategory)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {categories.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Short Description *</label>
              <textarea
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Long Description</label>
              <textarea
                value={longDescription}
                onChange={(e) => setLongDescription(e.target.value)}
                rows={5}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Country *</label>
                <input
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">City</label>
                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Contact Email</label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Contact Phone</label>
                <input
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Website</label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://example.com"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {error && <p className="text-sm font-medium text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={saving}
              className="inline-flex rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? 'Submitting...' : 'Submit for Review'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
