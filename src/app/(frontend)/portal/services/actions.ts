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

  // Find all vessels owned by this user (to link services)
  const { docs: vessels } = await payload.find({
    collection: 'vessels',
    where: {
      or: [{ 'owner.id': { equals: user.id } }, { 'operator.id': { equals: user.id } }],
    },
  })

  const vesselIds = vessels.map((v) => v.id)

  if (vesselIds.length === 0) return { services: [], vessels: [] }

  // Find services linked to these vessels
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

  const vesselId = formData.get('vesselId') as string
  const type = formData.get('serviceType') as string
  const quantity = Number(formData.get('quantity'))
  const notes = formData.get('notes') as string

  // Fetch Site Settings to calculate estimated cost immediately (optional but good UX)
  const settings = await payload.findGlobal({ slug: 'site-settings' })
  let rate = 0
  // @ts-ignore (Types might not be generated yet)
  switch (type) {
    case 'cleaning':
      rate = settings.serviceRates?.cleaningRate || 150
      break
    case 'water':
      rate = settings.serviceRates?.waterRate || 50
      break
    case 'fuel':
      rate = settings.serviceRates?.fuelRate || 25
      break
    case 'waste':
      rate = settings.serviceRates?.wasteRate || 200
      break
    case 'electric':
      rate = settings.serviceRates?.electricRate || 5
      break
    case 'loading':
      rate = settings.serviceRates?.loadingRate || 100
      break
  }
  const estimatedCost = rate * quantity

  try {
    await payload.create({
      collection: 'services',
      data: {
        vessel: vesselId,
        serviceType: type,
        status: 'requested', // Admin will review this and switch to 'payment_pending'
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
