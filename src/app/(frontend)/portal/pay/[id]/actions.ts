'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'

export async function processPayment(vesselId: string) {
  const payload = await getPayload({ config: configPromise })

  try {
    // 1. Fetch vessel to know its type
    const vessel = await payload.findByID({ collection: 'vessels', id: vesselId })

    // 2. Calculate Expiry Date
    const now = new Date()
    const nextDue = new Date()

    if (vessel.registrationType === 'permanent') {
      // Add 1 Year
      nextDue.setFullYear(now.getFullYear() + 1)
    } else if (vessel.registrationType === 'hourly') {
      // Add 4 Hours (Standard Slot)
      nextDue.setTime(now.getTime() + 4 * 60 * 60 * 1000)
    } else {
      // Add 24 Hours (Day-to-Day)
      nextDue.setTime(now.getTime() + 24 * 60 * 60 * 1000)
    }

    // 3. Update Database
    await payload.update({
      collection: 'vessels',
      id: vesselId,
      data: {
        status: 'active',
        finance: {
          paymentStatus: 'paid',
          paymentDate: now.toISOString(),
          nextPaymentDue: nextDue.toISOString(), // <--- SAVE EXPIRY
          transactionId: `TXN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        },
      },
    })

    return { success: true }
  } catch (e) {
    return { success: false }
  }
}
