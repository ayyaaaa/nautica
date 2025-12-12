'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'

export async function processPayment(vesselId: string) {
  const payload = await getPayload({ config: configPromise })

  try {
    // 1. Verify payment (Mocked)

    // 2. Activate Vessel
    await payload.update({
      collection: 'vessels',
      id: vesselId,
      data: {
        status: 'active', // <--- Vessel becomes active here
        finance: {
          paymentStatus: 'paid',
          paymentDate: new Date().toISOString(),
          transactionId: `TXN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        },
      },
    })

    return { success: true }
  } catch (e) {
    return { success: false }
  }
}
