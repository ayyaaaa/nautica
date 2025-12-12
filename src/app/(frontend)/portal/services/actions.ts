'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

// 1. Fetch User's Services
export async function getMyServices() {
  const payload = await getPayload({ config: configPromise })
  const requestHeaders = await headers()
  const { user } = await payload.auth({ headers: requestHeaders })

  if (!user) redirect('/login')

  // Find vessels owned/operated by this user
  const { docs: vessels } = await payload.find({
    collection: 'vessels',
    where: {
      or: [{ 'owner.id': { equals: user.id } }, { 'operator.id': { equals: user.id } }],
    },
  })

  const vesselIds = vessels.map((v) => v.id)

  if (vesselIds.length === 0) return { services: [], vessels: [] }

  const { docs: services } = await payload.find({
    collection: 'services',
    where: {
      vessel: { in: vesselIds },
    },
    sort: '-createdAt',
  })

  return { services, vessels }
}

// 2. Submit New Request
export async function submitServiceRequest(formData: FormData) {
  const payload = await getPayload({ config: configPromise })
  const requestHeaders = await headers()
  const { user } = await payload.auth({ headers: requestHeaders })

  if (!user) return { error: 'Unauthorized' }

  const vesselIdString = formData.get('vesselId') as string
  const type = formData.get('serviceType') as string
  const quantity = Number(formData.get('quantity'))
  const notes = formData.get('notes') as string

  // Fetch Site Settings
  const settings = await payload.findGlobal({ slug: 'site-settings' })
  let rate = 0

  // Cast settings to any to avoid "property does not exist" type errors
  const s = settings as any

  switch (type) {
    case 'cleaning':
      rate = s.cleaningRate || 150
      break
    case 'water':
      rate = s.waterRate || 50
      break
    case 'fuel':
      rate = s.fuelRate || 25
      break
    case 'waste':
      rate = s.wasteRate || 200
      break
    case 'electric':
      rate = s.electricRate || 5
      break
    case 'loading':
      rate = s.loadingRate || 100
      break
  }

  const estimatedCost = rate * quantity

  try {
    await payload.create({
      collection: 'services',
      data: {
        // FIX: Convert the string ID to a Number
        vessel: Number(vesselIdString),

        serviceType: type as any,
        status: 'requested',
        quantity: quantity,
        totalCost: estimatedCost,
        requestDate: new Date().toISOString(),
        notes: notes,
      },
    })
    return { success: true }
  } catch (e) {
    console.error(e)
    return { error: 'Failed to submit request' }
  }
}
