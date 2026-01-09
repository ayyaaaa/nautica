'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

// --- 1. Fetch Service Catalog ---
// Used to populate the dropdown in the client form
export async function getServiceCatalog() {
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'service-types',
    limit: 100,
    sort: 'name',
  })
  return result.docs
}

// --- 2. Fetch User's Services & Vessels ---
export async function getMyServices() {
  const payload = await getPayload({ config: configPromise })
  const requestHeaders = await headers()
  const { user } = await payload.auth({ headers: requestHeaders })

  if (!user) redirect('/portal/login')

  // Find vessels owned/operated by this user
  // depth: 1 IS CRITICAL here so we get the 'currentSlot' object, not just an ID
  const { docs: vessels } = await payload.find({
    collection: 'vessels',
    where: {
      or: [{ 'owner.id': { equals: user.id } }, { 'operator.id': { equals: user.id } }],
    },
    depth: 1,
  })

  const vesselIds = vessels.map((v) => v.id)

  if (vesselIds.length === 0) return { services: [], vessels: [] }

  const { docs: services } = await payload.find({
    collection: 'services',
    where: {
      vessel: { in: vesselIds },
    },
    depth: 1, // Depth 1 ensures we see the Service Type name
    sort: '-createdAt',
  })

  return { services, vessels }
}

// --- 3. Submit New Request (UPDATED) ---
export async function submitServiceRequest(formData: FormData) {
  const payload = await getPayload({ config: configPromise })
  const requestHeaders = await headers()
  const { user } = await payload.auth({ headers: requestHeaders })

  if (!user) return { success: false, error: 'Unauthorized' }

  // Capture all fields including the new ones
  const rawData = {
    vessel: formData.get('vesselId'),
    serviceType: formData.get('serviceType'),
    calculationMode: formData.get('calculationMode'),
    quantity: formData.get('quantity'),
    totalCost: formData.get('totalCost'),
    notes: formData.get('notes'),
    serviceLocation: formData.get('serviceLocation'), // <--- NEW
    preferredTime: formData.get('preferredTime'), // <--- NEW
    contactNumber: formData.get('contactNumber'), // <--- NEW
  }

  try {
    const payloadData: any = {
      vessel: Number(rawData.vessel),
      serviceType: rawData.serviceType,
      calculationMode: rawData.calculationMode,
      status: 'requested',
      paymentStatus: 'unpaid',
      requestDate: new Date().toISOString(),
      notes: rawData.notes,
      serviceLocation: rawData.serviceLocation, // Save snapshot of location
      preferredTime: rawData.preferredTime, // Save preferred time
      contactNumber: formData.get('contactNumber'), // <--- NEW
    }

    // Pass the correct value based on mode
    if (rawData.calculationMode === 'budget') {
      payloadData.totalCost = Number(rawData.totalCost)
    } else {
      payloadData.quantity = Number(rawData.quantity)
    }

    await payload.create({
      collection: 'services',
      data: payloadData,
    })

    revalidatePath('/portal/services')
    return { success: true }
  } catch (e: any) {
    console.error('Submit Error:', e)
    return { success: false, error: e.message || 'Failed to submit request' }
  }
}

// --- 4. Get Service Details ---
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

    // Security Check
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

// --- 5. Process Payment ---
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
