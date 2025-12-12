'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'

export async function processServicePayment(serviceId: string) {
  const payload = await getPayload({ config: configPromise })

  try {
    // 1. Fetch Service to verify it exists and price
    const service = await payload.findByID({ collection: 'services', id: serviceId })

    if (!service) return { success: false, error: 'Service not found' }

    // 2. Mock Payment Gateway Delay
    // In real life, verify Stripe/BML payment here using service.totalCost

    // 3. Update Status
    // We move it to 'in_progress' so the crew knows the bill is paid and they can do the job.
    await payload.update({
      collection: 'services',
      id: serviceId,
      data: {
        status: 'in_progress', // <--- Work starts now
        // If you wanted to track payment transaction IDs specifically for services,
        // you'd add those fields to the Services collection.
        // For now, we just assume status change implies payment success.
      },
    })

    return { success: true }
  } catch (e) {
    console.error(e)
    return { success: false, error: 'Payment processing failed' }
  }
}
