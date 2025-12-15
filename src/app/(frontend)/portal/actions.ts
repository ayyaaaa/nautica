'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'

// --- 1. Fetch User's Vessels ---
export async function getMyVessels() {
  const payload = await getPayload({ config: configPromise })
  const requestHeaders = await headers()
  const { user } = await payload.auth({ headers: requestHeaders })

  if (!user) return []

  // Find vessels where the 'owner' field matches the current user's ID
  const result = await payload.find({
    collection: 'vessels',
    where: {
      owner: { equals: user.id },
    },
    depth: 1, // Get full details (including finance)
    limit: 50,
  })

  return result.docs
}

// --- 2. Renew Subscription (Extend 1 Year) ---
export async function renewSubscription(vesselId: string) {
  const payload = await getPayload({ config: configPromise })

  try {
    const vessel = await payload.findByID({ collection: 'vessels', id: vesselId })
    const now = new Date()

    // Calculate new expiry (1 Year from today)
    const nextDue = new Date(now)
    nextDue.setFullYear(nextDue.getFullYear() + 1)

    await payload.update({
      collection: 'vessels',
      id: vesselId,
      data: {
        status: 'payment_pending', // Mark as pending payment
        finance: {
          ...vessel.finance,
          paymentStatus: 'unpaid', // Needs payment
          nextPaymentDue: nextDue.toISOString(),
          fee: 5000, // Example renewal fee
        } as any,
      },
    })

    revalidatePath('/portal')
    return { success: true }
  } catch (error) {
    console.error('Renew Error:', error)
    return { success: false }
  }
}

// --- 3. Process Payment (Logic Updated) ---
export async function processPayment(vesselId: string) {
  const payload = await getPayload({ config: configPromise })

  try {
    const vessel = await payload.findByID({ collection: 'vessels', id: vesselId })

    const now = new Date()
    const updates: any = {
      finance: {
        ...vessel.finance, // Keep existing history if needed
        paymentStatus: 'paid',
        paymentDate: now.toISOString(),
        transactionId: `TXN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        fee: 0, // Clear the debt
      },
    }

    // --- SCENARIO 1: Paying a Departure Bill ---
    // If status was 'payment_pending', it usually means they left.
    // However, if they have a FUTURE nextPaymentDue, it was a renewal.
    if (vessel.status === 'payment_pending') {
      const isRenewal =
        vessel.finance?.nextPaymentDue && new Date(vessel.finance.nextPaymentDue) > now

      // If it's a renewal, they stay active. If it's a departure bill, they are marked departed.
      updates.status = isRenewal ? 'active' : 'departed'
    }

    // --- SCENARIO 2: Buying a Subscription (Permanent) ---
    // If they are 'permanent' and paying (and not already caught by scenario 1), extend expiry.
    else if (vessel.registrationType === 'permanent') {
      updates.status = 'active'

      const currentExpiry = vessel.finance?.nextPaymentDue
        ? new Date(vessel.finance.nextPaymentDue)
        : new Date()

      // If expired, start from today. If active, add 1 year to current expiry.
      const baseDate = currentExpiry < now ? now : currentExpiry
      const nextDue = new Date(baseDate)
      nextDue.setFullYear(nextDue.getFullYear() + 1)

      updates.finance.nextPaymentDue = nextDue.toISOString()
    }

    // --- SCENARIO 3: Initial Registration ---
    else if (vessel.status === 'pending') {
      updates.status = 'active'
    }

    // Update Database
    await payload.update({
      collection: 'vessels',
      id: vesselId,
      data: updates,
    })

    revalidatePath('/portal')
    return { success: true }
  } catch (e: any) {
    console.error('Payment Error:', e)
    return { success: false, error: e.message }
  }
}
