'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { revalidatePath } from 'next/cache'

export async function getServiceRequests() {
  const payload = await getPayload({ config: configPromise })

  // Fetch 'requested' (new) and 'payment_pending' (waiting for user)
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
    revalidatePath('/dashboard/services')
    return { success: true }
  } catch (e) {
    return { success: false }
  }
}
