'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { revalidatePath } from 'next/cache'

// --- HELPER: Invoice ID Generator ---
function generateInvoiceId() {
  const date = new Date().toISOString().slice(2, 10).replace(/-/g, '')
  const random = Math.floor(1000 + Math.random() * 9000)
  return `INV-${date}-${random}`
}

// --- 1. Fetch List of Users (For Dropdown) ---
export async function getOwners() {
  const payload = await getPayload({ config: configPromise })
  const { docs } = await payload.find({
    collection: 'users',
    limit: 1000,
    sort: 'email',
  })

  return docs.map((u: any) => ({
    id: u.id,
    label: `${u.fullName || 'No Name'} | ${u.email} ${u.identityCard ? `| ID: ${u.identityCard}` : ''}`,
  }))
}

// --- 2. Fetch Vessels (Table Data with Debt Calculation) ---
export async function getVessels({
  search,
  status,
  page = 1,
}: {
  search?: string
  status?: string
  page?: number
}) {
  const payload = await getPayload({ config: configPromise })
  const limit = 10
  const query: any = { and: [] }

  if (search) {
    query.and.push({
      or: [{ name: { like: search } }, { registrationNumber: { like: search } }],
    })
  }
  if (status && status !== 'all') {
    query.and.push({ status: { equals: status } })
  }

  // 1. Fetch Vessels
  const result = await payload.find({
    collection: 'vessels',
    where: query,
    page,
    limit,
    depth: 1,
    sort: '-createdAt',
  })

  const vessels = result.docs

  // 2. ENRICHMENT: Calculate Total Debt (Berth + Services)
  const vesselIds = vessels.map((v) => v.id)

  if (vesselIds.length > 0) {
    // Fetch ALL unpaid, completed services for these vessels
    const services = await payload.find({
      collection: 'services',
      where: {
        and: [
          { vessel: { in: vesselIds } },
          { status: { equals: 'completed' } },
          { paymentStatus: { equals: 'unpaid' } },
        ],
      },
      limit: 500,
    })

    // Map services to their vessels
    vessels.forEach((vessel: any) => {
      const vesselServices = services.docs.filter(
        (s: any) => (typeof s.vessel === 'object' ? s.vessel.id : s.vessel) === vessel.id,
      )

      const servicesTotal = vesselServices.reduce((sum, s) => sum + (s.totalCost || 0), 0)
      const berthFee = vessel.finance?.fee || 0

      // Attach the "Real" Total to the vessel object
      // (We assign to 'calculatedTotalDue' which the frontend expects)
      ;(vessel as any).calculatedTotalDue = berthFee + servicesTotal
      ;(vessel as any).unpaidServicesCount = vesselServices.length
    })
  }

  return {
    docs: vessels,
    totalPages: result.totalPages,
    page: result.page,
    totalDocs: result.totalDocs,
  }
}

// --- 3. Create Vessel ---
export async function createManualVessel(formData: FormData) {
  const payload = await getPayload({ config: configPromise })

  const name = formData.get('name') as string
  const regNo = formData.get('registrationNumber') as string
  const type = formData.get('vesselType') as string
  const regType = formData.get('registrationType') as string
  const ownerId = formData.get('ownerId') as string

  const numericOwnerId = Number(ownerId)
  if (isNaN(numericOwnerId) || numericOwnerId === 0) {
    return { success: false, error: 'Invalid Owner selected.' }
  }

  const VALID_TYPES = [
    'DHOANI',
    'LAUNCH',
    'BOAT',
    'BOKKURA',
    'BAHTHELI',
    'DINGHY',
    'BARGE',
    'YACHT',
    'TUG',
    'SUBMARINE',
    'PASSENGER FERRY',
    'OTHER',
  ]
  const rawType = type.toUpperCase()
  const vesselType = VALID_TYPES.includes(rawType) ? rawType : 'OTHER'

  try {
    await payload.create({
      collection: 'vessels',
      data: {
        name,
        registrationNumber: regNo,
        vesselType: vesselType as any,
        registrationType: regType as any,
        status: 'pending',
        owner: numericOwnerId,
        useType: 'Other',
      },
      draft: false,
    })

    revalidatePath('/dashboard/vessels')
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to create vessel.' }
  }
}

// --- 4. Process Departure (Admins Only) ---
export async function processDeparture(vesselId: number) {
  const payload = await getPayload({ config: configPromise })

  try {
    const vessel = await payload.findByID({ collection: 'vessels', id: vesselId })

    // SAFETY CHECK: Prevent overwriting an existing bill if clicked twice
    if (vessel.status !== 'active') {
      return {
        success: false,
        error: `Cannot process departure. Vessel is currently '${vessel.status}'.`,
      }
    }

    // 1. Fetch Rates from SiteSettings (with Fallbacks)
    let settings: any = {}
    try {
      settings = await payload.findGlobal({ slug: 'site-settings' })
    } catch (e) {
      console.warn('Site settings not found, using defaults.')
    }

    // Default Rates if settings are missing
    const hourlyRate = settings?.hourlyRate || 50
    const dailyRate = settings?.dailyRate || 500
    const taxPercent = settings?.taxPercentage !== undefined ? settings.taxPercentage : 6

    // 2. Find Active Berthing Session
    const berthRecords = await payload.find({
      collection: 'berths',
      where: {
        and: [{ vessel: { equals: vesselId } }, { status: { equals: 'active' } }],
      },
      limit: 1,
    })

    let berthingCost = 0
    let quantity = 1
    let unitPrice = 0
    let description = 'Berthing Fee'
    const currentSession = berthRecords.docs[0] || null

    // 3. Calculate Cost based on Duration & Plan Type
    if (currentSession) {
      const startTime = new Date(currentSession.startTime).getTime()
      const diffMs = Date.now() - startTime
      const hoursParked = Math.ceil(diffMs / (1000 * 60 * 60))

      if (vessel.registrationType === 'hourly') {
        berthingCost = hoursParked * hourlyRate
        quantity = hoursParked
        unitPrice = hourlyRate
        description = `Hourly Berthing (${hoursParked} hrs)`
      } else if (vessel.registrationType === 'permanent') {
        berthingCost = 0 // Permanent vessels pay monthly subscription separately
        description = 'Permanent Vessel Departure'
      } else {
        // Default to Temporary (Daily)
        const days = Math.ceil(hoursParked / 24)
        berthingCost = days * dailyRate
        quantity = days
        unitPrice = dailyRate
        description = `Daily Berthing (${days} days)`
      }
    } else {
      // Fallback: If no active berth found (Edge Case)
      if (vessel.registrationType === 'temporary') {
        berthingCost = dailyRate
        unitPrice = dailyRate
        description = 'Manual Departure Fee (No active record)'
      }
    }

    // 4. Create the INVOICE Record (The Missing Link!)
    if (berthingCost > 0) {
      await payload.create({
        collection: 'invoices',
        data: {
          invoiceNumber: generateInvoiceId(),
          status: 'issued',
          vessel: vesselId,
          sourceType: 'berth',
          relatedBerth: currentSession?.id,
          lineItems: [
            {
              description: description,
              quantity: quantity,
              unitPrice: unitPrice,
              // Note: Tax & Grand Total are auto-calculated by the Invoices.ts hook
            },
          ],
        },
      })
    }

    // 5. Calculate Final Bill for Vessel Record (Visual/Quick Access)
    const taxAmount = berthingCost * (taxPercent / 100)
    const finalBill = berthingCost + taxAmount

    // 6. Close the Berthing Record (History)
    if (currentSession) {
      await payload.update({
        collection: 'berths',
        id: currentSession.id,
        data: {
          endTime: new Date().toISOString(),
          status: 'completed',
          billing: { totalCalculated: finalBill },
        },
      })
    } else {
      // Create a "closing" record if one didn't exist
      const slotId =
        typeof vessel.currentBerth === 'object' ? vessel.currentBerth?.id : vessel.currentBerth
      await payload.create({
        collection: 'berths',
        data: {
          vessel: vesselId,
          startTime: new Date().toISOString(),
          endTime: new Date().toISOString(),
          status: 'completed',
          billing: { totalCalculated: finalBill },
          planType: (vessel.registrationType || 'temporary') as any,
          assignedSlot: (slotId || null) as any,
        },
        draft: false,
      })
    }

    // 7. Free up the Slot
    if (vessel.currentBerth) {
      const slotId =
        typeof vessel.currentBerth === 'object' ? vessel.currentBerth.id : vessel.currentBerth
      await payload.update({
        collection: 'berthing-slots',
        id: slotId,
        data: { status: 'available' },
      })
    }

    // 8. Update Vessel Status & Bill
    await payload.update({
      collection: 'vessels',
      id: vesselId,
      data: {
        status: 'payment_pending',
        currentBerth: null,
        finance: {
          fee: finalBill,
          paymentStatus: finalBill > 0 ? 'unpaid' : 'paid',
        },
      } as any,
    })

    revalidatePath('/dashboard/vessels')

    return {
      success: true,
      message: `Departure Processed. Invoice Generated: MVR ${finalBill.toLocaleString()}`,
    }
  } catch (error: any) {
    console.error('Departure Error', error)
    return { success: false, error: error.message || 'An unexpected error occurred.' }
  }
}

// --- 5. Re-Admit (Admins Only) ---
export async function reAdmitVessel(id: number) {
  const payload = await getPayload({ config: configPromise })

  await payload.update({
    collection: 'vessels',
    id: id,
    data: {
      status: 'pending',
      currentBerth: null,
    } as any,
  })

  revalidatePath('/dashboard/vessels')
}

// --- 6. Get Available Berths ---
export async function getAvailableBerths() {
  const payload = await getPayload({ config: configPromise })
  const { docs } = await payload.find({
    collection: 'berthing-slots',
    where: { status: { equals: 'available' } },
    sort: 'name',
    limit: 100,
  })
  return docs.map((slot: any) => ({
    id: slot.id,
    label: `${slot.name} (${slot.zone}) - ${slot.type}`,
  }))
}

// --- 7. Assign Berth & Activate ---
export async function assignBerth(vesselId: number, slotId: string) {
  const payload = await getPayload({ config: configPromise })

  try {
    const vessel = await payload.findByID({ collection: 'vessels', id: vesselId })

    // Create Active Log
    // (This triggers the 'afterChange' hook in Berths.ts to create an Upfront Invoice)
    await payload.create({
      collection: 'berths',
      data: {
        vessel: vesselId,
        startTime: new Date().toISOString(),
        status: 'active',
        assignedSlot: slotId as any,
        planType: (vessel.registrationType || 'temporary') as any,
      },
      draft: false,
    })

    // Mark Slot Occupied
    await payload.update({
      collection: 'berthing-slots',
      id: slotId,
      data: { status: 'occupied' },
    })

    // Activate Vessel
    await payload.update({
      collection: 'vessels',
      id: vesselId,
      data: {
        status: 'active',
        currentBerth: slotId as any,
      } as any,
    })

    revalidatePath('/dashboard/vessels')
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to assign berth.' }
  }
}
