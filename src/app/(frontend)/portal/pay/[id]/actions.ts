'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'

export async function processPayment(vesselId: string) {
  const payload = await getPayload({ config: configPromise })

  try {
    const vessel = await payload.findByID({ collection: 'vessels', id: vesselId })

    // 1. Find the Unpaid Services
    const unpaidServices = await payload.find({
      collection: 'services',
      where: {
        and: [
          { vessel: { equals: vesselId } },
          { status: { equals: 'completed' } },
          { paymentStatus: { equals: 'unpaid' } },
        ],
      },
      limit: 100,
    })

    // 2. Mark Services as PAID
    if (unpaidServices.docs.length > 0) {
      await Promise.all(
        unpaidServices.docs.map((service) =>
          payload.update({
            collection: 'services',
            id: service.id,
            data: { paymentStatus: 'paid' },
          }),
        ),
      )
    }

    // 3. Prepare Updates
    const now = new Date()
    const updates: any = {
      finance: {
        ...vessel.finance,
        paymentStatus: 'paid',
        paymentDate: now.toISOString(),
        transactionId: `TXN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        fee: 0, // Clear the debt
      },
    }

    // 4. SMART LOGIC: Only extend expiry if this was a Renewal (Payment Pending + Permanent)
    // If status is 'active', they are likely just paying off a fuel bill mid-stay.
    if (vessel.status === 'payment_pending') {
      if (vessel.registrationType === 'permanent') {
        updates.status = 'active'

        // Extend Expiry by 1 Year
        const currentExpiry = vessel.finance?.nextPaymentDue
          ? new Date(vessel.finance.nextPaymentDue)
          : now
        const baseDate = currentExpiry < now ? now : currentExpiry
        const nextDue = new Date(baseDate)
        nextDue.setFullYear(nextDue.getFullYear() + 1)

        updates.finance.nextPaymentDue = nextDue.toISOString()
      } else {
        // If Temporary/Hourly, this is a Departure Bill
        updates.status = 'departed'
      }
    }

    // 5. Update Vessel
    await payload.update({
      collection: 'vessels',
      id: vesselId,
      data: updates,
    })

    return { success: true }
  } catch (e: any) {
    console.error('Payment Error:', e)
    return { success: false, error: e.message }
  }
}
