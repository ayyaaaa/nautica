'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export async function getDashboardStats() {
  const payload = await getPayload({ config: configPromise })
  const requestHeaders = await headers()
  const { user } = await payload.auth({ headers: requestHeaders })

  if (!user || user.role !== 'admin') redirect('/login')

  // Fetch all vessels to calculate aggregates
  const { docs: vessels } = await payload.find({
    collection: 'vessels',
    limit: 1000,
    depth: 0,
  })

  // --- 1. CALCULATE SUMMARY CARDS ---
  const today = new Date().toDateString()
  const currentMonth = new Date().getMonth()

  const stats = {
    activeVessels: 0,
    pendingApproval: 0,
    berthsOccupied: 0, // Mock: We'll assume active vessels occupy a berth
    totalBerths: 50, // Mock: Total capacity
    unpaidAmount: 0,
    unpaidCount: 0,
    revenueToday: 0,
    revenueMonth: 0,
    revenueLastMonth: 0, // Mock for growth calc
    pendingServices: 5, // Mock: Since we don't have a Services collection yet
  }

  // --- 2. PREPARE CHART DATA ---
  // We will map 'vesselType' counts
  const typeBreakdown: Record<string, number> = {}
  const revenueHistory: { date: string; value: number }[] = []

  vessels.forEach((v) => {
    // Counts
    if (v.status === 'active') {
      stats.activeVessels++
      stats.berthsOccupied++
    }
    if (v.status === 'pending') stats.pendingApproval++

    // Finance
    const fee = v.finance?.fee || 0

    // Unpaid
    if (v.status === 'payment_pending' || v.finance?.paymentStatus === 'unpaid') {
      stats.unpaidCount++
      stats.unpaidAmount += fee
    }

    // Revenue
    if (v.finance?.paymentStatus === 'paid' && v.finance.paymentDate) {
      const pDate = new Date(v.finance.paymentDate)

      // Today
      if (pDate.toDateString() === today) {
        stats.revenueToday += fee
      }
      // This Month
      if (pDate.getMonth() === currentMonth) {
        stats.revenueMonth += fee
      }

      // Add to history (simplified)
      revenueHistory.push({
        date: pDate.toLocaleDateString(),
        value: fee,
      })
    }

    // Vessel Types for Pie Chart
    const type = v.vesselType || 'Other'
    typeBreakdown[type] = (typeBreakdown[type] || 0) + 1
  })

  // --- 3. RECENT ACTIVITY LIST ---
  // Sort by newest
  const recentActivity = vessels
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  return { stats, typeBreakdown, revenueHistory, recentActivity, user }
}
