'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { stripePromise } from '@/lib/stripe/config'
import { createMembership, getReferralByReferred, updateReferralStatus, createNotification } from '@/lib/firebase/firestore'

type Category = 'individual' | 'micro' | 'institutional'

interface Tier {
  id: string
  label: string
  price: number
  period: 'yearly' | 'monthly'
  note?: string
  isVoluntary?: boolean
  hasMonthlyOption?: boolean
  monthlyPrice?: number
}

const INDIVIDUAL_TIERS: Tier[] = [
  { id: 'general', label: 'General Citizens', price: 5, period: 'yearly' },
  { id: 'student', label: 'Students / Youth', price: 2, period: 'yearly' },
  { id: 'worker', label: 'Workers / Informal Traders', price: 3, period: 'yearly', note: 'Flexible' },
  { id: 'diaspora', label: 'Diaspora Citizens', price: 60, period: 'yearly', hasMonthlyOption: true, monthlyPrice: 5 },
  { id: 'warvets', label: 'Liberation War Veterans', price: 0, period: 'yearly', isVoluntary: true, note: 'Voluntary / Waived' },
  { id: 'unwaged', label: 'Unwaged / Vulnerable Persons', price: 0, period: 'yearly', isVoluntary: true, note: 'Voluntary / Waived' },
]

const MICRO_TIERS: Tier[] = [
  { id: 'micro', label: 'Any Individual', price: 1, period: 'monthly', note: 'Optional micro-subscription' },
]

const INSTITUTIONAL_TIERS: Tier[] = [
  { id: 'cbo', label: 'Small Community-Based Organisations', price: 25, period: 'yearly' },
  { id: 'union', label: 'Local Trade Unions / Faith-Based Bodies', price: 50, period: 'yearly' },
  { id: 'professional', label: 'Professional Associations', price: 250, period: 'yearly' },
  { id: 'national', label: 'National Civic Organisations & Political Parties', price: 300, period: 'yearly' },
]

const FEATURES = [
  'Access to community forums',
  'Monthly newsletter',
  'Exclusive webinars',
  'Advanced resources',
  'Priority support',
  'Early access to campaigns',
]

const CATEGORY_INFO: Record<Category, { label: string; icon: string; description: string }> = {
  individual: { label: 'Individual', icon: '👤', description: 'Annual membership for individuals' },
  micro: { label: 'Monthly Micro', icon: '💳', description: 'USD 1/month micro-subscription' },
  institutional: { label: 'Institutional', icon: '🏛️', description: 'Annual organisational membership' },
}

interface MembershipCheckoutContentProps {
  onSuccess?: () => void
}

function MembershipCheckoutContent({ onSuccess }: MembershipCheckoutContentProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [clientSecret, setClientSecret] = useState('')
  const [category, setCategory] = useState<Category>('individual')
  const [selectedTierId, setSelectedTierId] = useState('general')
  const [diasporaPeriod, setDiasporaPeriod] = useState<'yearly' | 'monthly'>('yearly')
  const [voluntaryAmount, setVoluntaryAmount] = useState('')
  const { user } = useAuth()
  const router = useRouter()
  const stripe = useStripe()
  const elements = useElements()

  const tiers = category === 'individual' ? INDIVIDUAL_TIERS : category === 'micro' ? MICRO_TIERS : INSTITUTIONAL_TIERS
  const selectedTier = tiers.find((t) => t.id === selectedTierId) || tiers[0]

  // Compute actual price
  const getPrice = () => {
    if (selectedTier.isVoluntary) {
      const amt = parseFloat(voluntaryAmount)
      return isNaN(amt) || amt < 0 ? 0 : amt
    }
    if (selectedTier.hasMonthlyOption && diasporaPeriod === 'monthly') {
      return selectedTier.monthlyPrice || selectedTier.price
    }
    return selectedTier.price
  }

  const getPeriodLabel = () => {
    if (selectedTier.hasMonthlyOption && diasporaPeriod === 'monthly') return 'month'
    return selectedTier.period === 'monthly' ? 'month' : 'year'
  }

  const price = getPrice()

  // Reset tier when category changes
  useEffect(() => {
    if (category === 'individual') setSelectedTierId('general')
    else if (category === 'micro') setSelectedTierId('micro')
    else setSelectedTierId('cbo')
  }, [category])

  useEffect(() => {
    const createPaymentIntent = async () => {
      if (price <= 0) {
        setClientSecret('')
        return
      }
      try {
        setError('')
        setClientSecret('')
        const period = selectedTier.hasMonthlyOption ? diasporaPeriod : selectedTier.period
        const response = await fetch('/api/stripe/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: price,
            userId: user?.uid || null,
            userEmail: user?.email || null,
            userName: user?.displayName || null,
            type: 'membership',
            description: `${selectedTier.label} Membership (${period})`,
            tier: selectedTier.id,
          }),
        })
        const data = await response.json()
        if (!response.ok) throw new Error(data.error || 'Failed to create payment intent')
        setClientSecret(data.clientSecret)
      } catch (err: any) {
        console.error('Error creating payment intent:', err)
        setError(err.message || 'Failed to initialize payment')
        setClientSecret('')
      }
    }
    if (user) createPaymentIntent()
  }, [user?.uid, user?.email, user?.displayName, selectedTierId, diasporaPeriod, price, selectedTier.id, selectedTier.label, selectedTier.period, selectedTier.hasMonthlyOption])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (price <= 0) {
      setError('Please enter an amount greater than $0.')
      return
    }

    if (!stripe || !elements || !clientSecret) {
      setError('Payment system not ready. Please try again.')
      return
    }

    const cardElement = elements.getElement(CardElement)
    if (!cardElement) {
      setError('Card element not found')
      return
    }

    setLoading(true)

    try {
      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: user?.displayName || undefined,
              email: user?.email || undefined,
            },
          },
        }
      )

      if (confirmError) throw new Error(confirmError.message)

      if (paymentIntent?.status === 'succeeded') {
        try {
          const period = selectedTier.hasMonthlyOption ? diasporaPeriod : selectedTier.period
          const membership = {
            userId: user?.uid || '',
            tier: selectedTier.id as any,
            billingPeriod: period,
            amount: price,
            stripePaymentIntentId: paymentIntent.id,
            status: 'succeeded' as const,
          }
          const membershipId = await createMembership(membership)
          console.log('Membership record created in Firestore:', membershipId)
        } catch (membershipError: any) {
          console.error('Error creating membership record:', membershipError)
          alert('Payment succeeded, but there was an error saving the membership. It will be saved automatically via webhook.')
        }

        if (user?.uid) {
          try {
            const referral = await getReferralByReferred(user.uid)
            if (referral && referral.status !== 'paid') {
              await updateReferralStatus(referral.id, 'paid')
              try {
                await createNotification({
                  type: 'new_membership_application',
                  title: 'Referral Converted! 🎉',
                  message: `${referral.referredName} (referred by you) just paid for their membership!`,
                  link: '/dashboard/referrals',
                  audience: 'user',
                  userId: referral.referrerUserId,
                })
              } catch (e) { /* non-critical */ }
            }
          } catch (e) { /* non-critical */ }
        }

        if (window.location.pathname.includes('/dashboard')) {
          setTimeout(() => { window.location.reload() }, 1500)
        } else {
          if (onSuccess) onSuccess()
          router.push(`/success?payment_intent=${paymentIntent.id}`)
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to process membership')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Category Tabs */}
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Membership Type</p>
        <div className="grid grid-cols-3 gap-2">
          {(Object.keys(CATEGORY_INFO) as Category[]).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`rounded-xl border-2 px-3 py-3 text-center transition-all ${
                category === cat
                  ? 'border-slate-900 bg-slate-50 shadow-sm'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <span className="text-lg">{CATEGORY_INFO[cat].icon}</span>
              <p className={`mt-1 text-xs font-semibold ${category === cat ? 'text-slate-900' : 'text-slate-600'}`}>
                {CATEGORY_INFO[cat].label}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Tier Selection */}
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Select Your Plan</p>
        <div className="space-y-2">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              onClick={() => setSelectedTierId(tier.id)}
              className={`cursor-pointer rounded-xl border-2 px-4 py-3 transition-all ${
                selectedTierId === tier.id
                  ? 'border-slate-900 bg-slate-50 shadow-sm'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                    selectedTierId === tier.id ? 'border-slate-900' : 'border-slate-300'
                  }`}>
                    {selectedTierId === tier.id && <div className="h-2 w-2 rounded-full bg-slate-900" />}
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${selectedTierId === tier.id ? 'text-slate-900' : 'text-slate-700'}`}>
                      {tier.label}
                    </p>
                    {tier.note && (
                      <p className="text-[11px] text-slate-400">{tier.note}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  {tier.isVoluntary ? (
                    <span className="text-xs font-medium text-slate-400">Voluntary</span>
                  ) : tier.hasMonthlyOption ? (
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-900">${tier.monthlyPrice}/mo <span className="font-normal text-slate-400">or</span> ${tier.price}/yr</p>
                    </div>
                  ) : (
                    <p className="text-sm font-bold text-slate-900">
                      ${tier.price}<span className="text-xs font-normal text-slate-400">/{tier.period === 'monthly' ? 'mo' : 'yr'}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Diaspora monthly/yearly toggle */}
      {selectedTier.hasMonthlyOption && (
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Billing Period</p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setDiasporaPeriod('monthly')}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
                diasporaPeriod === 'monthly'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Monthly — ${selectedTier.monthlyPrice}/mo
            </button>
            <button
              type="button"
              onClick={() => setDiasporaPeriod('yearly')}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
                diasporaPeriod === 'yearly'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Yearly — ${selectedTier.price}/yr
            </button>
          </div>
        </div>
      )}

      {/* Voluntary amount input */}
      {selectedTier.isVoluntary && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Voluntary Contribution (USD)</p>
          <input
            type="number"
            min="0"
            step="1"
            value={voluntaryAmount}
            onChange={(e) => setVoluntaryAmount(e.target.value)}
            placeholder="Enter amount (e.g. 5)"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-400 focus:bg-white focus:ring-1 focus:ring-slate-200"
          />
          <p className="mt-1.5 text-[11px] text-slate-400">This membership category is waived. Any contribution is voluntary and appreciated.</p>
        </div>
      )}

      {/* Price Summary */}
      <div className="rounded-xl bg-slate-50 border border-slate-200 px-5 py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400">Selected plan</p>
            <p className="text-sm font-medium text-slate-700">{selectedTier.label}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-slate-900">${price}</p>
            <p className="text-xs text-slate-400">per {getPeriodLabel()}</p>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="mx-auto max-w-md">
        <ul className="space-y-2 text-sm text-slate-600">
          {FEATURES.map((feature, idx) => (
            <li key={idx} className="flex items-start">
              <svg className="mr-2 h-5 w-5 flex-shrink-0 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {feature}
            </li>
          ))}
        </ul>
      </div>

      {/* Card Element */}
      {price > 0 && clientSecret && (
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-900">Card Details</label>
          <div className="rounded-lg border border-slate-300 p-4">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#1e293b',
                    '::placeholder': { color: '#94a3b8' },
                  },
                },
              }}
            />
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={loading || price <= 0 || !clientSecret}
        className="w-full rounded-lg bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed sm:text-base"
      >
        {loading ? 'Processing...' : `Purchase Membership — $${price}/${getPeriodLabel()}`}
      </button>
    </form>
  )
}

interface MembershipCheckoutProps {
  onSuccess?: () => void
}

export default function MembershipCheckout({ onSuccess }: MembershipCheckoutProps) {
  return (
    <Elements stripe={stripePromise}>
      <MembershipCheckoutContent onSuccess={onSuccess} />
    </Elements>
  )
}
