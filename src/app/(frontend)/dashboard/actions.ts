'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

// --- 1. NEW: Get Running Bills (Held Tabs for Temporary Vessels) ---
export async function getRunningBills() {
  const payload = await getPayload({ config: configPromise })

  // A. Fetch Active Temporary Vessels
  // We only care about boats that are IN the harbor ('active') but are NOT permanent residents
  const { docs: vessels } = await payload.find({
    collection: 'vessels',
    where: {
      and: [{ status: { equals: 'active' } }, { registrationType: { not_equals: 'permanent' } }],
    },
    depth: 1,
  })

  // B. Fetch Settings for Rates
  const settings = (await payload.findGlobal({ slug: 'site-settings' })) as any
  const dailyRate = settings.dailyRate || 500
  const hourlyRate = settings.hourlyRate || 50

  // C. Calculate Running Totals for each Vessel
  const runningBills = await Promise.all(
    vessels.map(async (v: any) => {
      // 1. Get Active Berth Session (to calculate time parked)
      const { docs: berths } = await payload.find({
        collection: 'berths',
        where: {
          and: [{ vessel: { equals: v.id } }, { status: { equals: 'active' } }],
        },
        limit: 1,
      })

      let berthingCost = 0
      let startTime = new Date()

      if (berths.length > 0) {
        startTime = new Date(berths[0].startTime)
        const now = new Date()
        const diffMs = now.getTime() - startTime.getTime()
        const hours = diffMs / (1000 * 60 * 60)

        if (v.registrationType === 'hourly') {
          berthingCost = Math.ceil(hours) * hourlyRate
        } else {
          // Daily logic (round up to next 24h block)
          const days = Math.ceil(hours / 24)
          berthingCost = days * dailyRate
        }
      }

      // 2. Get Unpaid Services (Fuel, Water, etc.)
      const { docs: services } = await payload.find({
        collection: 'services',
        where: {
          and: [
            { vessel: { equals: v.id } },
            { status: { equals: 'completed' } },
            { paymentStatus: { equals: 'unpaid' } },
          ],
        },
      })

      const servicesCost = services.reduce((sum, s: any) => sum + (s.totalCost || 0), 0)

      return {
        id: v.id,
        name: v.name,
        regNo: v.registrationNumber,
        type: v.registrationType,
        arrivalTime: startTime.toISOString(), // Convert to string for serialization
        berthingCost,
        servicesCost,
        totalPending: berthingCost + servicesCost,
        serviceCount: services.length,
      }
    }),
  )

  return runningBills
}

// --- 2. EXISTING: Main Dashboard Stats ---
export async function getDashboardStats() {
  const payload = await getPayload({ config: configPromise })
  const requestHeaders = await headers()
  const { user } = await payload.auth({ headers: requestHeaders })

  if (!user || (user as any).role !== 'admin') redirect('/admin/login')

  // A. Fetch Core Data
  const { docs: vessels } = await payload.find({
    collection: 'vessels',
    limit: 1000,
    depth: 0,
  })

  // Get REAL pending services count
  const { totalDocs: pendingServicesCount } = await payload.count({
    collection: 'services',
    where: {
      status: { equals: 'requested' },
    },
  })

  // Get REAL Berth Stats
  const { totalDocs: totalBerths } = await payload.count({
    collection: 'berthing-slots',
  })

  const { totalDocs: occupiedBerths } = await payload.count({
    collection: 'berthing-slots',
    where: { status: { equals: 'occupied' } },
  })

  // --- 3. CALCULATE AGGREGATES ---
  const today = new Date().toDateString()
  const currentMonth = new Date().getMonth()

  const stats = {
    activeVessels: 0,
    pendingApproval: 0,
    berthsOccupied: occupiedBerths, // Real data
    totalBerths: totalBerths, // Real data
    unpaidAmount: 0,
    unpaidCount: 0,
    revenueToday: 0,
    revenueMonth: 0,
    revenueLastMonth: 0,
    pendingServices: pendingServicesCount,
  }

  // --- 4. PREPARE CHART DATA ---
  const typeBreakdown: Record<string, number> = {}
  const revenueHistory: { date: string; value: number }[] = []

  vessels.forEach((v) => {
    // Counts
    if (v.status === 'active') {
      stats.activeVessels++
    }
    if (v.status === 'pending') stats.pendingApproval++

    // Finance Analysis
    const fee = v.finance?.fee || 0

    // Unpaid Count (for Permanent vessels or those with generated bills)
    if (v.status === 'payment_pending' || v.finance?.paymentStatus === 'unpaid') {
      // Only count if there is actually a fee attached
      if (fee > 0) {
        stats.unpaidCount++
        stats.unpaidAmount += fee
      }
    }

    // Revenue Calculation
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

    // Pie Chart Data
    const type = v.vesselType || 'Other'
    typeBreakdown[type] = (typeBreakdown[type] || 0) + 1
  })

  // --- 5. RECENT ACTIVITY LIST ---
  const recentActivity = vessels
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  return { stats, typeBreakdown, revenueHistory, recentActivity, user }
}
