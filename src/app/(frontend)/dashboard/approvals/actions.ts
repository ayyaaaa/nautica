'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { revalidatePath } from 'next/cache'

export async function getPendingApplications() {
  const payload = await getPayload({ config: configPromise })

  const results = await payload.find({
    collection: 'vessels',
    where: {
      status: {
        equals: 'pending',
      },
    },
    depth: 2,
    sort: '-createdAt',
  })

  return results.docs
}

// FIX: Change 'approved' to 'active' to match your database schema
export async function updateApplicationStatus(vesselId: string, newStatus: 'active' | 'rejected') {
  const payload = await getPayload({ config: configPromise })

  try {
    await payload.update({
      collection: 'vessels',
      id: vesselId,
      data: {
        status: newStatus, // Now sends 'active' which is valid
      },
    })

    revalidatePath('/dashboard/approvals')
    return { success: true }
  } catch (error) {
    console.error('Update Error:', error)
    return { success: false }
  }
}
