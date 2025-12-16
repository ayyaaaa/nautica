'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'

export async function processPayment(vesselId: string) {
  const payload = await getPayload({ config: configPromise })

  try {
    const vessel = await payload.findByID({ collection: 'vessels', id: vesselId })

    // 1. Fetch any Unpaid Services for this vessel
    const unpaidServices = await payload.find({
      collection: 'service-requests',
      where: {
        and: [
          { vessel: { equals: vesselId } },
          { status: { equals: 'completed' } },
          { paymentStatus: { equals: 'pending' } }, // Only unpaid items
        ],
      },
      limit: 100,
    })

    // 2. Mark Services as PAID
    // We loop through found services and update them
    if (unpaidServices.docs.length > 0) {
      await Promise.all(
        unpaidServices.docs.map((service) =>
          payload.update({
            collection: 'service-requests',
            id: service.id,
            data: { paymentStatus: 'paid' },
          }),
        ),
      )
    }

    // 3. Handle Subscription / Expiry Logic
    const now = new Date()
    const nextDue = new Date()

    if (vessel.registrationType === 'permanent') {
      nextDue.setFullYear(now.getFullYear() + 1)
    } else if (vessel.registrationType === 'hourly') {
      nextDue.setTime(now.getTime() + 4 * 60 * 60 * 1000)
    } else {
      nextDue.setTime(now.getTime() + 24 * 60 * 60 * 1000)
    }

    // 4. Update Vessel (Clear Debt & Set Active)
    await payload.update({
      collection: 'vessels',
      id: vesselId,
      data: {
        status: 'active', // or 'departed' depending on your flow, usually 'departed' if paying a bill to leave
        finance: {
          fee: 0, // Clear the debt
          paymentStatus: 'paid',
          paymentDate: now.toISOString(),
          nextPaymentDue: nextDue.toISOString(),
          transactionId: `TXN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        } as any, // Cast to any to avoid strict type issues with nested updates
      },
    })

    return { success: true }
  } catch (e: any) {
    console.error(e)
    return { success: false, error: e.message }
  }
}
