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

// --- 3. Submit New Request ---
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
    serviceLocation: formData.get('serviceLocation'),
    preferredTime: formData.get('preferredTime'),
    contactNumber: formData.get('contactNumber'),
  }

  try {
    const payloadData: any = {
      vessel: Number(rawData.vessel),
      serviceType: Number(rawData.serviceType),
      calculationMode: rawData.calculationMode,
      status: 'requested',
      paymentStatus: 'unpaid',
      requestDate: new Date().toISOString(),
      notes: rawData.notes,
      serviceLocation: rawData.serviceLocation,
      preferredTime: rawData.preferredTime,
      contactNumber: rawData.contactNumber,
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

// --- 5. Process Payment (UPDATED & FIXED) ---
// --- 5. Process Payment (FIXED ID MATCHING) ---
export async function processServicePayment(serviceId: string | number, method: 'cash' | 'transfer' = 'cash') {
  const payload = await getPayload({ config: configPromise })
  
  // Ensure ID is a number if your database uses numeric IDs
  const numericServiceId = Number(serviceId)

  console.log(`💰 Processing Payment for Service: ${numericServiceId} (${method})`)

  try {
    // A. Update the Service Status
    await payload.update({
      collection: 'services',
      id: numericServiceId, // Pass ID as number
      data: {
        status: 'in_progress',
        paymentStatus: 'paid',
      } as any,
    })

    // B. Find the Linked Invoice
    // We try querying with BOTH the number and string format to be 100% safe
    const { docs: invoices } = await payload.find({
      collection: 'invoices',
      where: {
        or: [
          { relatedService: { equals: numericServiceId } }, // Try Number
          { relatedService: { equals: String(serviceId) } } // Try String
        ]
      },
      limit: 1,
    })

    console.log(`🔍 Found ${invoices.length} invoices for this service.`)

    // C. Update Invoice & Create Receipt
    if (invoices.length > 0) {
      const invoice = invoices[0]

      // 1. Mark Invoice as Paid
      await payload.update({
        collection: 'invoices',
        id: invoice.id,
        data: {
          status: 'paid',
        },
      })
      console.log(`✅ Invoice ${invoice.invoiceNumber} marked as PAID.`)

      // 2. Create Payment Record (Audit Log)
      try {
        await payload.create({
          collection: 'payments',
          data: {
            invoiceNumber: invoice.invoiceNumber,
            vessel: typeof invoice.vessel === 'object' ? invoice.vessel.id : invoice.vessel,
            amount: invoice.grandTotal,
            status: 'paid',
            method: method,
            paidAt: new Date().toISOString(),
            description: `Payment for Service Req #${numericServiceId}`,
            relatedService: numericServiceId,
          },
        })
      } catch (err) {
        console.error('⚠️ Could not create payment receipt:', err)
      }
    } else {
      console.warn('⚠️ Service marked Paid, but NO INVOICE found to update.')
    }

    // D. Refresh Data
    revalidatePath('/portal/services')
    revalidatePath(`/portal/services/pay-service/${serviceId}`)
    
    // Also refresh Admin Dashboard so you see it there immediately
    revalidatePath('/dashboard/invoices') 
    revalidatePath('/dashboard/services')

    return { success: true }
  } catch (e) {
    console.error('❌ Payment Error:', e)
    return { success: false, error: 'Payment processing failed' }
  }
}

// --- 6. Get Site Settings ---
export async function getSiteSettings() {
  const payload = await getPayload({ config: configPromise })
  const settings = await payload.findGlobal({ slug: 'site-settings' })
  return settings
}
// --- 6. Update Service Request (Editable by User) ---
export async function updateServiceRequest(serviceId: string, formData: FormData) {
  const payload = await getPayload({ config: configPromise })
  const requestHeaders = await headers()
  const { user } = await payload.auth({ headers: requestHeaders })

  if (!user) return { success: false, error: 'Unauthorized' }

  try {
    // 1. Fetch existing service to check permissions & status
    const service = await payload.findByID({
      collection: 'services',
      id: serviceId,
      depth: 1
    })

    // Security: Ensure User Owns the Vessel
    const vessel = typeof service.vessel === 'object' ? service.vessel : null
    const ownerId = typeof vessel?.owner === 'object' ? vessel.owner.id : vessel?.owner
    const operatorId = typeof vessel?.operator === 'object' ? vessel.operator?.id : vessel?.operator

    if (ownerId !== user.id && operatorId !== user.id) {
      return { success: false, error: 'You do not have permission to edit this request.' }
    }

    // Logic: Only allow editing if status is 'requested'
    if (service.status !== 'requested') {
      return { success: false, error: 'Cannot edit. Request is already being processed.' }
    }

    // 2. Prepare Update Data
    const rawData = {
      calculationMode: formData.get('calculationMode'),
      quantity: formData.get('quantity'),
      totalCost: formData.get('totalCost'),
      notes: formData.get('notes'),
      preferredTime: formData.get('preferredTime'),
      contactNumber: formData.get('contactNumber'),
    }

    const updates: any = {
      calculationMode: rawData.calculationMode,
      notes: rawData.notes,
      preferredTime: rawData.preferredTime,
      contactNumber: rawData.contactNumber,
    }

    // Handle Budget vs Quantity logic
    if (rawData.calculationMode === 'budget') {
      updates.totalCost = Number(rawData.totalCost)
      updates.quantity = null // Reset quantity so hook recalculates it
    } else {
      updates.quantity = Number(rawData.quantity)
      updates.totalCost = null // Reset cost so hook recalculates it
    }

    // 3. Perform Update
    await payload.update({
      collection: 'services',
      id: serviceId,
      data: updates,
    })

    revalidatePath('/portal/services')
    return { success: true }
  } catch (e: any) {
    console.error('Update Error:', e)
    return { success: false, error: e.message || 'Failed to update request' }
  }
}