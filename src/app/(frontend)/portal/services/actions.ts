'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

// --- 1. Fetch User's Services ---
export async function getMyServices() {
  const payload = await getPayload({ config: configPromise })
  const requestHeaders = await headers()
  const { user } = await payload.auth({ headers: requestHeaders })

  if (!user) redirect('/portal/login') // Ensure redirection goes to portal login

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

// --- 2. Submit New Request ---
export async function submitServiceRequest(formData: FormData) {
  const payload = await getPayload({ config: configPromise })
  const requestHeaders = await headers()
  const { user } = await payload.auth({ headers: requestHeaders })

  if (!user) return { error: 'Unauthorized' }

  const vesselIdString = formData.get('vesselId') as string
  const type = formData.get('serviceType') as string
  const quantity = Number(formData.get('quantity'))
  const notes = formData.get('notes') as string

  const settings = await payload.findGlobal({ slug: 'site-settings' })
  const s = settings as any

  let rate = 0
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
        vessel: Number(vesselIdString),
        serviceType: type as any,
        status: 'requested',
        paymentStatus: 'unpaid',
        quantity: quantity,
        totalCost: estimatedCost,
        requestDate: new Date().toISOString(),
        notes: notes,
      },
    })

    revalidatePath('/portal/services')
    return { success: true }
  } catch (e) {
    console.error(e)
    return { error: 'Failed to submit request' }
  }
}

// --- 3. Get Service Details (Required for Payment Page) ---
export async function getServiceDetails(id: string) {
  const payload = await getPayload({ config: configPromise })
  const requestHeaders = await headers()
  const { user } = await payload.auth({ headers: requestHeaders })

  if (!user) return null

  try {
    const service = await payload.findByID({
      collection: 'services',
      id,
      depth: 2,
    })

    // Security Check: Verify ownership
    const vessel = typeof service.vessel === 'object' ? service.vessel : null
    const ownerId = typeof vessel?.owner === 'object' ? vessel.owner.id : vessel?.owner
    const operatorId = typeof vessel?.operator === 'object' ? vessel.operator?.id : vessel?.operator

    if (ownerId !== user.id && operatorId !== user.id) {
      return null
    }

    return service
  } catch (error) {
    return null
  }
}

// --- 4. Process Payment (Required for Payment Button) ---
export async function processServicePayment(id: string) {
  const payload = await getPayload({ config: configPromise })

  try {
    await payload.update({
      collection: 'services',
      id,
      data: {
        status: 'in_progress',
        paymentStatus: 'paid',
      } as any,
    })

    revalidatePath('/portal/services')
    return { success: true }
  } catch (e) {
    return { success: false, error: 'Payment failed' }
  }
}
