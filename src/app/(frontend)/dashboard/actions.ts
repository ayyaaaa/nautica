'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export async function getDashboardStats() {
  const payload = await getPayload({ config: configPromise })
  const requestHeaders = await headers()
  const { user } = await payload.auth({ headers: requestHeaders })

  // Security: Only Admins allowed
  if (!user || user.role !== 'admin') {
    redirect('/login')
  }

  // 1. Fetch All Vessels (We need all of them to calculate stats)
  // In a huge app, you would use database aggregation, but this is fine for now.
  const { docs: vessels } = await payload.find({
    collection: 'vessels',
    limit: 1000,
    depth: 0, // Keep it light
  })

  // 2. Calculate Stats
  const stats = {
    pendingReviews: 0,
    awaitingPayment: 0,
    activeFleet: 0,
    totalRevenue: 0,
    pendingRevenue: 0,
    recentActivity: [] as any[],
  }

  vessels.forEach((v) => {
    // Count Statuses
    if (v.status === 'pending') stats.pendingReviews++
    if (v.status === 'payment_pending') stats.awaitingPayment++
    if (v.status === 'active') stats.activeFleet++

    // Calculate Money
    const fee = v.finance?.fee || 0
    if (v.status === 'active' && v.finance?.paymentStatus === 'paid') {
      stats.totalRevenue += fee
    }
    if (v.status === 'payment_pending') {
      stats.pendingRevenue += fee
    }
  })

  // 3. Get Recent 5 items for the table
  // Sort by createdAt desc manually since we fetched all
  stats.recentActivity = vessels
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  return { stats, user }
}
