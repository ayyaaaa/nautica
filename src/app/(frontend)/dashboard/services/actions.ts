'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'

export async function getServiceRequests() {
  const payload = await getPayload({ config: configPromise })

  // Fetch 'active' requests only (hides completed/cancelled)
  const { docs } = await payload.find({
    collection: 'services',
    where: {
      or: [
        { status: { equals: 'requested' } },
        { status: { equals: 'payment_pending' } },
        { status: { equals: 'in_progress' } },
      ],
    },
    // Depth 2 is CRITICAL here:
    // 1. It populates 'serviceType' (so we get name & unit)
    // 2. It populates 'vessel' (so we get vessel name)
    depth: 2,
    sort: '-createdAt',
  })
  return docs
}

export async function updateServiceStatus(id: string, newStatus: string) {
  const payload = await getPayload({ config: configPromise })

  // 1. Security Check (Optional but Recommended)
  const requestHeaders = await headers()
  const { user } = await payload.auth({ headers: requestHeaders })

  if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    await payload.update({
      collection: 'services',
      id,
      data: { status: newStatus as any },
    })

    // Refresh the Dashboard UI
    revalidatePath('/dashboard/services')
    return { success: true }
  } catch (e) {
    console.error('Service Update Error:', e)
    return { success: false, error: 'Update failed' }
  }
}
