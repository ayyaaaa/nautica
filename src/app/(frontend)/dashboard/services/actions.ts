'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { revalidatePath } from 'next/cache'

export async function getServiceRequests() {
  const payload = await getPayload({ config: configPromise })

  // Fetch 'requested' (new), 'payment_pending' (waiting), and 'in_progress' (active)
  const { docs } = await payload.find({
    collection: 'services',
    where: {
      or: [
        { status: { equals: 'requested' } },
        { status: { equals: 'payment_pending' } },
        { status: { equals: 'in_progress' } },
      ],
    },
    depth: 2, // Populate vessel details
    sort: '-createdAt',
  })
  return docs
}

export async function updateServiceStatus(id: string, newStatus: string) {
  const payload = await getPayload({ config: configPromise })

  try {
    await payload.update({
      collection: 'services',
      id,
      data: { status: newStatus as any },
    })

    // Refresh the UI to show the new status button
    revalidatePath('/dashboard/services')
    return { success: true }
  } catch (e) {
    console.error('Service Update Error:', e)
    return { success: false }
  }
}
