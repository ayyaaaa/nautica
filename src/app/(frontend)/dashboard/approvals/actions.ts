'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { revalidatePath } from 'next/cache'

export async function getPendingApplications() {
  const payload = await getPayload({ config: configPromise })
  const results = await payload.find({
    collection: 'vessels',
    where: { status: { equals: 'pending' } },
    depth: 2,
    sort: '-createdAt',
  })
  return results.docs
}

export async function updateApplicationStatus(vesselId: string, action: 'approve' | 'reject') {
  const payload = await getPayload({ config: configPromise })

  try {
    if (action === 'reject') {
      await payload.update({
        collection: 'vessels',
        id: vesselId,
        data: { status: 'rejected' },
      })
    } else {
      // 1. Fetch Vessel & Settings
      const vessel = await payload.findByID({ collection: 'vessels', id: vesselId })
      const settings = await payload.findGlobal({ slug: 'site-settings' })

      // 2. Determine Base Rate
      let baseRate = 0
      if (vessel.registrationType === 'permanent') {
        baseRate = settings.monthlyRate || 10000
      } else if (vessel.registrationType === 'hourly') {
        baseRate = settings.hourlyRate || 50 // <--- Hourly Logic
      } else {
        baseRate = settings.dailyRate || 500
      }

      // 3. Calculate Tax (GST)
      const taxPercent = settings.taxPercentage || 0
      const taxAmount = baseRate * (taxPercent / 100)
      const totalFee = baseRate + taxAmount

      // 4. Update Status & Save Fee
      await payload.update({
        collection: 'vessels',
        id: vesselId,
        data: {
          status: 'payment_pending',
          finance: {
            fee: totalFee,
            paymentStatus: 'unpaid',
          },
        },
      })
    }

    revalidatePath('/dashboard/approvals')
    return { success: true }
  } catch (error) {
    console.error('Update Error:', error)
    return { success: false }
  }
}
