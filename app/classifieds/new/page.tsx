'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import ProtectedRoute from '@/app/components/ProtectedRoute'
import { useAuth } from '@/contexts/AuthContext'
import { createClassifiedListing } from '@/lib/firebase/firestore'
import type { ClassifiedCategory, ClassifiedCondition } from '@/types'

const categories: { value: ClassifiedCategory; label: string }[] = [
  { value: 'jobs', label: 'Jobs' },
  { value: 'housing', label: 'Housing' },
  { value: 'vehicles', label: 'Vehicles' },
  { value: 'services', label: 'Services' },
  { value: 'marketplace', label: 'Marketplace' },
  { value: 'community', label: 'Community' },
  { value: 'other', label: 'Other' },
]

const conditions: { value: ClassifiedCondition; label: string }[] = [
  { value: 'new', label: 'New' },
  { value: 'like_new', label: 'Like new' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'poor', label: 'Poor' },
]

export default function NewClassifiedPage() {
  return (
    <ProtectedRoute>
      <NewClassifiedForm />
    </ProtectedRoute>
  )
}

function NewClassifiedForm() {
  const router = useRouter()
  const { userProfile } = useAuth()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<ClassifiedCategory>('jobs')
  const [country, setCountry] = useState('')
  const [city, setCity] = useState('')
  const [price, setPrice] = useState('')
  const [currency, setCurrency] = useState('USD')
  const [isNegotiable, setIsNegotiable] = useState(false)
  const [condition, setCondition] = useState<ClassifiedCondition>('good')
  const [contactEmail, setContactEmail] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [expiresAt, setExpiresAt] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!userProfile?.uid) {
      setError('You must be signed in to submit a classified.')
      return
    }

    if (!title.trim() || !description.trim() || !country.trim()) {
      setError('Title, description, and country are required.')
      return
    }

    try {
      setSaving(true)
      await createClassifiedListing({
        ownerUserId: userProfile.uid,
        title: title.trim(),
        description: description.trim(),
        category,
        country: country.trim(),
        city: city.trim() || undefined,
        price: price.trim() ? Number(price) : undefined,
        currency: currency.trim() || undefined,
        isNegotiable,
        condition,
        contactEmail: contactEmail.trim() || undefined,
        contactPhone: contactPhone.trim() || undefined,
        whatsapp: whatsapp.trim() || undefined,
        expiresAt: expiresAt ? new Date(`${expiresAt}T23:59:59`) : undefined,
        isFeatured: false,
        status: 'pending_review',
      })
      router.push('/classifieds?submitted=1')
    } catch (err: any) {
      setError(err?.message || 'Failed to submit classified')
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#f8fbfa] px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <Link href="/classifieds" className="text-sm font-medium text-slate-600 hover:text-slate-900">
          ← Back to Classifieds
        </Link>
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-2xl font-bold text-slate-900">Post Classified</h1>
          <p className="mt-2 text-sm text-slate-600">
            Share your listing with the community. Posts are reviewed before publication.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Title *</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Description *</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ClassifiedCategory)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {categories.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Condition</label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value as ClassifiedCondition)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {conditions.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
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

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Price</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Currency</label>
                <input
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={isNegotiable}
                    onChange={(e) => setIsNegotiable(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  Negotiable
                </label>
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

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">WhatsApp</label>
                <input
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Expiry Date</label>
                <input
                  type="date"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
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
