'use client'

import { useState, useEffect, useMemo } from 'react'
import ProtectedRoute from '@/app/components/ProtectedRoute'
import AdminRoute from '@/app/components/AdminRoute'
import DashboardNav from '@/app/components/DashboardNav'
import Link from 'next/link'
import { getAllUsers, updateUserRole, updateUserAccessLevel, getDonationsByUser, getMembershipApplicationByUser, getMembershipByUser, getPurchasesByUser } from '@/lib/firebase/firestore'
import type { UserProfile, UserRole, Donation, MembershipApplication, Membership, Purchase } from '@/types'

const PAGE_SIZE = 10

export default function AdminUsersPage() {
  return (
    <ProtectedRoute>
      <AdminRoute>
        <div className="min-h-screen bg-slate-50">
          <div className="border-b bg-white">
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">User Management</h1>
                <Link
                  href="/dashboard"
                  className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                >
                  ← Back to Dashboard
                </Link>
              </div>
            </div>
          </div>

          <DashboardNav />

          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
            <UsersManagement />
          </div>
        </div>
      </AdminRoute>
    </ProtectedRoute>
  )
}

function toDate(date: Date | any): Date | null {
  if (!date) return null
  if (date instanceof Date) return date
  if (date && typeof date === 'object' && 'toDate' in date) return (date as any).toDate()
  return new Date(date as string | number)
}

function formatDate(date: Date | null): string {
  if (!date) return 'N/A'
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

function UsersManagement() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updating, setUpdating] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  // User detail modal
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null)
  const [userDonations, setUserDonations] = useState<Donation[]>([])
  const [userMembershipApp, setUserMembershipApp] = useState<MembershipApplication | null>(null)
  const [userMembership, setUserMembership] = useState<Membership | null>(null)
  const [userPurchases, setUserPurchases] = useState<Purchase[]>([])
  const [detailLoading, setDetailLoading] = useState(false)

  const loadUsers = async () => {
    try {
      setLoading(true)
      setError('')
      const allUsers = await getAllUsers()
      setUsers(allUsers)
    } catch (err: any) {
      setError(err.message || 'Failed to load users')
      console.error('Error loading users:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      setUpdating(userId)
      await updateUserRole(userId, newRole)
      await loadUsers()
    } catch (err: any) {
      setError(err.message || 'Failed to update user role')
      console.error('Error updating role:', err)
    } finally {
      setUpdating(null)
    }
  }

  const handleAccessLevelChange = async (userId: string, level: number) => {
    try {
      setUpdating(userId)
      await updateUserAccessLevel(userId, level)
      await loadUsers()
    } catch (err: any) {
      setError(err.message || 'Failed to update access level')
      console.error('Error updating access level:', err)
    } finally {
      setUpdating(null)
    }
  }

  const openUserDetail = async (user: UserProfile) => {
    setSelectedUser(user)
    setDetailLoading(true)
    setUserDonations([])
    setUserMembershipApp(null)
    setUserMembership(null)
    setUserPurchases([])
    try {
      const [donations, membershipApp, membership, purchases] = await Promise.all([
        getDonationsByUser(user.uid).catch(() => []),
        getMembershipApplicationByUser(user.uid).catch(() => null),
        getMembershipByUser(user.uid).catch(() => null),
        getPurchasesByUser(user.uid).catch(() => []),
      ])
      setUserDonations(donations)
      setUserMembershipApp(membershipApp)
      setUserMembership(membership)
      setUserPurchases(purchases)
    } catch (err) {
      console.error('Error loading user details:', err)
    } finally {
      setDetailLoading(false)
    }
  }

  const roles: UserRole[] = ['supporter', 'member', 'moderator', 'admin']

  // Filter users by search query
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users
    const term = searchQuery.toLowerCase()
    return users.filter((u) =>
      (u.email?.toLowerCase() || '').includes(term) ||
      (u.name?.toLowerCase() || '').includes(term) ||
      (u.role?.toLowerCase() || '').includes(term) ||
      (u.membershipTier?.toLowerCase() || '').includes(term)
    )
  }, [users, searchQuery])

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE))
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return filteredUsers.slice(start, start + PAGE_SIZE)
  }, [filteredUsers, currentPage])

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-slate-900 border-r-transparent"></div>
          <p className="text-slate-600">Loading users...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">All Users</h2>
          <p className="mt-1 text-sm text-slate-600">
            {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}{searchQuery && ` matching "${searchQuery}"`}
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, role…"
            className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-4 text-sm placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
          {error}
          <button
            onClick={() => setError('')}
            className="ml-2 font-semibold hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Membership
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Access Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-sm text-slate-500">
                    {searchQuery ? `No users matching "${searchQuery}"` : 'No users found'}
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user) => (
                  <tr key={user.uid} className="hover:bg-slate-50 cursor-pointer" onClick={() => openUserDetail(user)}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {user.name || '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm capitalize text-slate-600">
                      {user.membershipTier}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize bg-slate-100 text-slate-800">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm" onClick={(e) => e.stopPropagation()}>
                      {(() => {
                        const level = user.accessLevel || 1
                        const color = level >= 5 ? 'bg-red-500'
                          : level >= 4 ? 'bg-amber-500'
                          : level >= 3 ? 'bg-green-500'
                          : level >= 2 ? 'bg-blue-500'
                          : 'bg-slate-300'
                        return (
                          <div className="flex items-center gap-2">
                            <div className="flex gap-0.5">
                              {[1, 2, 3, 4, 5].map((i) => (
                                <div
                                  key={i}
                                  className={`h-2 w-3 rounded-sm ${i <= level ? color : 'bg-slate-200'}`}
                                />
                              ))}
                            </div>
                            <select
                              value={level}
                              onChange={(e) => handleAccessLevelChange(user.uid, Number(e.target.value))}
                              disabled={updating === user.uid}
                              className="rounded border border-slate-300 bg-white px-1.5 py-0.5 text-xs font-semibold text-slate-600 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {[1, 2, 3, 4, 5].map((v) => (
                                <option key={v} value={v}>{v}</option>
                              ))}
                            </select>
                          </div>
                        )
                      })()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.uid, e.target.value as UserRole)}
                        disabled={updating === user.uid}
                        className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {roles.map((role) => (
                          <option key={role} value={role}>
                            {role.charAt(0).toUpperCase() + role.slice(1)}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-200 bg-white px-6 py-3">
            <p className="text-sm text-slate-600">
              Showing {((currentPage - 1) * PAGE_SIZE) + 1}–{Math.min(currentPage * PAGE_SIZE, filteredUsers.length)} of {filteredUsers.length}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((page) => {
                  // Show first, last, current, and neighbors
                  if (page === 1 || page === totalPages) return true
                  if (Math.abs(page - currentPage) <= 1) return true
                  return false
                })
                .reduce<(number | string)[]>((acc, page, idx, arr) => {
                  if (idx > 0 && page - (arr[idx - 1] as number) > 1) acc.push('...')
                  acc.push(page)
                  return acc
                }, [])
                .map((item, idx) =>
                  typeof item === 'string' ? (
                    <span key={`ellipsis-${idx}`} className="px-2 text-sm text-slate-400">…</span>
                  ) : (
                    <button
                      key={item}
                      onClick={() => setCurrentPage(item)}
                      className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                        currentPage === item
                          ? 'bg-slate-900 text-white'
                          : 'border border-slate-300 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {item}
                    </button>
                  )
                )}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-2xl">
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
              <h2 className="text-xl font-bold">User Details</h2>
              <button
                onClick={() => setSelectedUser(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Profile Overview */}
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-900 text-xl font-bold text-white">
                  {(selectedUser.name || selectedUser.email || '?').charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{selectedUser.name || 'No name'}</h3>
                  <p className="text-sm text-slate-500">{selectedUser.email}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium capitalize text-slate-800">
                      {selectedUser.role}
                    </span>
                    <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium capitalize text-blue-700">
                      {selectedUser.membershipTier}
                    </span>
                    {selectedUser.emailVerified && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        Verified
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-4 rounded-lg bg-slate-50 p-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">User ID</p>
                  <p className="mt-0.5 text-xs font-mono text-slate-700 break-all">{selectedUser.uid}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Joined</p>
                  <p className="mt-0.5 text-sm text-slate-700">{formatDate(toDate(selectedUser.createdAt))}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Phone</p>
                  <p className="mt-0.5 text-sm text-slate-700">{userMembershipApp?.mobileNumber || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Address</p>
                  <p className="mt-0.5 text-sm text-slate-700">{userMembershipApp?.physicalAddress || '—'}</p>
                </div>
                {(userMembershipApp?.province || userMembershipApp?.district) && (
                  <>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Province</p>
                      <p className="mt-0.5 text-sm text-slate-700">{userMembershipApp?.province || '—'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">District</p>
                      <p className="mt-0.5 text-sm text-slate-700">{userMembershipApp?.district || '—'}</p>
                    </div>
                  </>
                )}
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Access Level</p>
                  <p className="mt-0.5 text-sm font-semibold text-slate-700">{selectedUser.accessLevel || 1} / 5</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Referral Code</p>
                  <p className="mt-0.5 text-sm font-mono text-slate-700">{selectedUser.referralCode || '—'}</p>
                </div>
                {selectedUser.referredBy && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Referred By</p>
                    <p className="mt-0.5 text-sm font-mono text-slate-700">{selectedUser.referredBy}</p>
                  </div>
                )}
                {selectedUser.stripeCustomerId && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Stripe Customer</p>
                    <p className="mt-0.5 text-xs font-mono text-slate-700 break-all">{selectedUser.stripeCustomerId}</p>
                  </div>
                )}
              </div>

              {detailLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-6 w-6 animate-spin rounded-full border-3 border-slate-900 border-r-transparent" />
                </div>
              ) : (
                <>
                  {/* Membership Application */}
                  <div>
                    <h4 className="mb-2 text-sm font-bold text-slate-900">Membership Application</h4>
                    {userMembershipApp ? (
                      <div className="rounded-lg border border-slate-200 p-3 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600">Status</span>
                          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${
                            userMembershipApp.status === 'approved' ? 'bg-green-100 text-green-700'
                            : userMembershipApp.status === 'rejected' ? 'bg-red-100 text-red-700'
                            : userMembershipApp.status === 'pending' ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-slate-100 text-slate-700'
                          }`}>
                            {userMembershipApp.status}
                          </span>
                        </div>
                        {userMembershipApp.membershipNumber && (
                          <div className="mt-1 flex items-center justify-between">
                            <span className="text-slate-600">Membership #</span>
                            <span className="font-mono text-xs font-semibold">{userMembershipApp.membershipNumber}</span>
                          </div>
                        )}
                        {userMembershipApp.province && (
                          <div className="mt-1 flex items-center justify-between">
                            <span className="text-slate-600">Province</span>
                            <span className="text-xs">{userMembershipApp.province}</span>
                          </div>
                        )}
                        <div className="mt-1 flex items-center justify-between">
                          <span className="text-slate-600">Applied</span>
                          <span className="text-xs">{formatDate(toDate(userMembershipApp.createdAt))}</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-slate-400">No application submitted</p>
                    )}
                  </div>

                  {/* Membership Payment */}
                  <div>
                    <h4 className="mb-2 text-sm font-bold text-slate-900">Membership Payment</h4>
                    {userMembership ? (
                      <div className="rounded-lg border border-slate-200 p-3 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600">Status</span>
                          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${
                            userMembership.status === 'succeeded' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {userMembership.status}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center justify-between">
                          <span className="text-slate-600">Paid</span>
                          <span className="text-xs">{formatDate(toDate(userMembership.createdAt))}</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-slate-400">No membership payment</p>
                    )}
                  </div>

                  {/* Donations */}
                  <div>
                    <h4 className="mb-2 text-sm font-bold text-slate-900">
                      Donations
                      {userDonations.length > 0 && (
                        <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">{userDonations.length}</span>
                      )}
                    </h4>
                    {userDonations.length > 0 ? (
                      <div className="space-y-2">
                        {userDonations.slice(0, 5).map((d) => (
                          <div key={d.id} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm">
                            <span className="font-semibold text-slate-900">${d.amount.toFixed(2)}</span>
                            <div className="flex items-center gap-2">
                              <span className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${
                                d.status === 'succeeded' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                              }`}>{d.status}</span>
                              <span className="text-xs text-slate-500">{formatDate(toDate(d.createdAt))}</span>
                            </div>
                          </div>
                        ))}
                        {userDonations.length > 5 && (
                          <p className="text-center text-xs text-slate-400">+ {userDonations.length - 5} more</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-400">No donations</p>
                    )}
                  </div>

                  {/* Purchases */}
                  <div>
                    <h4 className="mb-2 text-sm font-bold text-slate-900">
                      Purchases
                      {userPurchases.length > 0 && (
                        <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">{userPurchases.length}</span>
                      )}
                    </h4>
                    {userPurchases.length > 0 ? (
                      <div className="space-y-2">
                        {userPurchases.slice(0, 5).map((p) => (
                          <div key={p.id} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm">
                            <div>
                              <span className="font-medium text-slate-900">{p.productName}</span>
                              <span className="ml-2 text-slate-500">${p.amount.toFixed(2)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${
                                p.status === 'succeeded' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                              }`}>{p.status}</span>
                              <span className="text-xs text-slate-500">{formatDate(toDate(p.createdAt))}</span>
                            </div>
                          </div>
                        ))}
                        {userPurchases.length > 5 && (
                          <p className="text-center text-xs text-slate-400">+ {userPurchases.length - 5} more</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-400">No purchases</p>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 border-t border-slate-200 bg-white px-6 py-3">
              <button
                onClick={() => setSelectedUser(null)}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
