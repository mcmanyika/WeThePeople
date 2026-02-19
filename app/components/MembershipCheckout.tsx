'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { stripePromise } from '@/lib/stripe/config'
import { createMembership, getReferralByReferred, updateReferralStatus, createNotification } from '@/lib/firebase/firestore'

const PLANS = {
  monthly: { id: 'member', name: 'Member', price: 5, label: 'month', period: 'monthly' as const },
  yearly: { id: 'member', name: 'Member', price: 60, label: 'year', period: 'yearly' as const },
}

const FEATURES = [
  'Access to community forums',
  'Monthly newsletter',
  'Exclusive webinars',
  'Advanced resources',
  'Priority support',
  'Early access to campaigns',
]

interface MembershipCheckoutContentProps {
  onSuccess?: () => void
}

function MembershipCheckoutContent({ onSuccess }: MembershipCheckoutContentProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [clientSecret, setClientSecret] = useState('')
  const [billingPeriod, setBillingPeriod] = useState<'yearly' | 'monthly'>('yearly')
  const { user } = useAuth()
  const router = useRouter()
  const stripe = useStripe()
  const elements = useElements()

  const selectedPlan = PLANS[billingPeriod]

  useEffect(() => {
    // Create payment intent when plan changes
    const createPaymentIntent = async () => {
      try {
        setError('')
        setClientSecret('')
        const response = await fetch('/api/stripe/create-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: selectedPlan.price,
            userId: user?.uid || null,
            userEmail: user?.email || null,
            userName: user?.displayName || null,
            type: 'membership',
            description: `${selectedPlan.name} Membership (${selectedPlan.period})`,
            tier: selectedPlan.id,
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to create payment intent')
        }

        setClientSecret(data.clientSecret)
      } catch (err: any) {
        console.error('Error creating payment intent:', err)
        setError(err.message || 'Failed to initialize payment')
        setClientSecret('')
      }
    }

    if (user) {
      createPaymentIntent()
    }
  }, [user?.uid, user?.email, user?.displayName, billingPeriod, selectedPlan.price, selectedPlan.id, selectedPlan.name, selectedPlan.period])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

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
      // Confirm payment with auto-captured user info
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

      if (confirmError) {
        throw new Error(confirmError.message)
      }

      if (paymentIntent?.status === 'succeeded') {
        // Create membership record in Firestore
        try {
          const membership = {
            userId: user?.uid || '',
            tier: selectedPlan.id as any,
            billingPeriod: selectedPlan.period,
            amount: selectedPlan.price,
            stripePaymentIntentId: paymentIntent.id,
            status: 'succeeded' as const,
          }
          const membershipId = await createMembership(membership)
          console.log('Membership record created in Firestore:', membershipId)
        } catch (membershipError: any) {
          console.error('Error creating membership record:', membershipError)
          console.error('Error details:', {
            code: membershipError?.code,
            message: membershipError?.message,
            userId: user?.uid,
            paymentIntentId: paymentIntent.id,
          })
          alert('Payment succeeded, but there was an error saving the membership. It will be saved automatically via webhook.')
        }

        // Update referral status to 'paid' if this user was referred, and notify the referrer
        if (user?.uid) {
          try {
            const referral = await getReferralByReferred(user.uid)
            if (referral && referral.status !== 'paid') {
              await updateReferralStatus(referral.id, 'paid')
              // Notify the referrer
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

        // Refresh user profile to update membership tier
        if (window.location.pathname.includes('/dashboard')) {
          setTimeout(() => {
            window.location.reload()
          }, 1500)
        } else {
          if (onSuccess) {
            onSuccess()
          }
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

      {/* Billing Toggle */}
      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => setBillingPeriod('monthly')}
          className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
            billingPeriod === 'monthly'
              ? 'bg-slate-900 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Monthly
        </button>
        <button
          type="button"
          onClick={() => setBillingPeriod('yearly')}
          className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
            billingPeriod === 'yearly'
              ? 'bg-slate-900 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Yearly
          <span className="ml-1.5 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700">Save ${PLANS.monthly.price * 12 - PLANS.yearly.price}</span>
        </button>
      </div>

      {/* Plan Cards */}
      <div className="grid grid-cols-2 gap-4">
        {/* Monthly */}
        <div
          onClick={() => setBillingPeriod('monthly')}
          className={`cursor-pointer rounded-xl border-2 p-5 text-center transition-all ${
            billingPeriod === 'monthly'
              ? 'border-slate-900 bg-slate-50 shadow-md'
              : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">Monthly</p>
          <div className="mb-1">
            <span className="text-3xl font-bold">${PLANS.monthly.price}</span>
            <span className="text-sm text-slate-500">/ mo</span>
          </div>
          <p className="text-xs text-slate-400">${PLANS.monthly.price * 12}/year</p>
        </div>

        {/* Yearly */}
        <div
          onClick={() => setBillingPeriod('yearly')}
          className={`relative cursor-pointer rounded-xl border-2 p-5 text-center transition-all ${
            billingPeriod === 'yearly'
              ? 'border-slate-900 bg-slate-50 shadow-md'
              : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-green-600 px-2.5 py-0.5 text-[10px] font-bold text-white">
            BEST VALUE
          </span>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">Yearly</p>
          <div className="mb-1">
            <span className="text-3xl font-bold">${PLANS.yearly.price}</span>
            <span className="text-sm text-slate-500">/ yr</span>
          </div>
          <p className="text-xs text-slate-400">${(PLANS.yearly.price / 12).toFixed(0)}/month</p>
        </div>
      </div>

      {/* Features */}
      <div className="mx-auto max-w-md">
        <ul className="space-y-2 text-sm text-slate-600">
          {FEATURES.map((feature, idx) => (
            <li key={idx} className="flex items-start">
              <svg
                className="mr-2 h-5 w-5 flex-shrink-0 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              {feature}
            </li>
          ))}
        </ul>
      </div>

      {clientSecret && (
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-900">
            Card Details
          </label>
          <div className="rounded-lg border border-slate-300 p-4">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#1e293b',
                    '::placeholder': {
                      color: '#94a3b8',
                    },
                  },
                },
              }}
            />
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !clientSecret}
        className="w-full rounded-lg bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed sm:text-base"
      >
        {loading ? 'Processing...' : `Purchase Membership — $${selectedPlan.price}/${selectedPlan.label}`}
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

