'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { revalidatePath } from 'next/cache'

export type InvoiceItem = {
  id: string | number
  type: 'vessel' | 'service'
  reference: string // Vessel Name
  description: string // e.g. "Monthly Berthing" or "Water Supply"
  amount: number
  status: string
  date: string
  subType?: string // permanent vs temp
}

export async function getPaymentsData() {
  const payload = await getPayload({ config: configPromise })

  const invoices: InvoiceItem[] = []

  // 1. FETCH UNPAID VESSELS (Registration / Berthing Fees)
  const { docs: vessels } = await payload.find({
    collection: 'vessels',
    where: {
      status: { equals: 'payment_pending' },
    },
    limit: 100,
  })

  vessels.forEach((v: any) => {
    invoices.push({
      id: v.id,
      type: 'vessel',
      reference: v.name,
      description:
        v.registrationType === 'permanent'
          ? 'New Registration / Renewal'
          : 'Berthing Settlement (Exit)',
      amount: v.finance?.fee || 0,
      status: 'unpaid',
      date: v.updatedAt,
      subType: v.registrationType,
    })
  })

  // 2. FETCH UNPAID SERVICES
  const { docs: services } = await payload.find({
    collection: 'services',
    where: {
      status: { equals: 'payment_pending' },
    },
    depth: 1,
    limit: 100,
  })

  services.forEach((s: any) => {
    invoices.push({
      id: s.id,
      type: 'service',
      reference: s.vessel?.name || 'Unknown Vessel',
      description: `${s.serviceType} (${s.quantity})`,
      amount: s.totalCost || 0,
      status: 'unpaid',
      date: s.requestDate,
    })
  })

  // 3. FETCH RECENTLY PAID HISTORY (Optional: Last 20 items)
  // You can expand this logic later to fetch paid items for a 'History' tab

  // Calculate Totals
  const totalPending = invoices.reduce((sum, item) => sum + item.amount, 0)

  return { invoices, totalPending }
}

// --- ACTION: MARK AS PAID ---
export async function markAsPaid(id: string | number, type: 'vessel' | 'service') {
  const payload = await getPayload({ config: configPromise })

  try {
    if (type === 'vessel') {
      const vessel = await payload.findByID({ collection: 'vessels', id: id as number })

      let nextStatus = 'active'

      // LOGIC SPLIT:
      // 1. Permanent Vessels: Payment = Renewal/Entry -> Stay Active
      if (vessel.registrationType === 'permanent') {
        nextStatus = 'active'
      }
      // 2. Temporary/Hourly Vessels: Payment = Exit Bill -> Mark Departed
      else {
        nextStatus = 'departed'
      }

      await payload.update({
        collection: 'vessels',
        id: id as number,
        data: {
          status: nextStatus as any,
          // Safety: Ensure berth is cleared if they are departing
          currentBerth: nextStatus === 'departed' ? null : vessel.currentBerth,
          finance: {
            ...vessel.finance,
            paymentStatus: 'paid',
            paymentDate: new Date().toISOString(),
          },
        },
      })
    }

    // ... (keep service logic as is) ...

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/payments')
    revalidatePath('/dashboard/vessels')
    return { success: true }
  } catch (error) {
    console.error(error)
    return { success: false, error: 'Payment update failed' }
  }
}
