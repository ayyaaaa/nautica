'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { revalidatePath } from 'next/cache'

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

// --- 2. Fetch Vessels (Table Data) ---
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

  const result = await payload.find({
    collection: 'vessels',
    where: query,
    page,
    limit,
    depth: 1,
    sort: '-createdAt',
  })

  return {
    docs: result.docs,
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
    const settings = (await payload.findGlobal({ slug: 'site-settings' })) as any

    const berthRecords = await payload.find({
      collection: 'berths',
      where: {
        and: [{ vessel: { equals: vesselId } }, { status: { equals: 'active' } }],
      },
      limit: 1,
    })

    let berthingCost = 0
    let currentSession = null

    if (berthRecords.docs.length > 0) {
      currentSession = berthRecords.docs[0]
      const startTime = new Date(currentSession.startTime).getTime()
      const diffMs = Date.now() - startTime
      const hoursParked = diffMs / (1000 * 60 * 60)

      if (vessel.registrationType === 'hourly') {
        berthingCost = Math.ceil(hoursParked) * (settings.hourlyRate || 50)
      } else if (vessel.registrationType === 'permanent') {
        berthingCost = 0
      } else {
        berthingCost = Math.ceil(hoursParked / 24) * (settings.dailyRate || 500)
      }
    } else {
      // Fallback for missing entry record
      if (vessel.registrationType === 'temporary') {
        berthingCost = settings.dailyRate || 500
      }
    }

    const tax = berthingCost * ((settings.taxPercentage || 0) / 100)
    const finalBill = berthingCost + tax

    // Close Record or Create History
    if (currentSession) {
      await payload.update({
        collection: 'berths',
        id: currentSession.id,
        data: {
          endTime: new Date().toISOString(),
          status: 'completed',
          billing: { totalCalculated: berthingCost },
        },
      })
    } else {
      const slotId =
        typeof vessel.currentBerth === 'object' ? vessel.currentBerth?.id : vessel.currentBerth
      await payload.create({
        collection: 'berths',
        data: {
          vessel: vesselId,
          startTime: new Date().toISOString(),
          endTime: new Date().toISOString(),
          status: 'completed',
          billing: { totalCalculated: berthingCost },
          planType: (vessel.registrationType || 'temporary') as any,
          assignedSlot: (slotId || null) as any,
        },
        draft: false,
      })
    }

    // Free Slot
    if (vessel.currentBerth) {
      const slotId =
        typeof vessel.currentBerth === 'object' ? vessel.currentBerth.id : vessel.currentBerth
      await payload.update({
        collection: 'berthing-slots',
        id: slotId,
        data: { status: 'available' },
      })
    }

    // Update Vessel
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
    return { success: true }
  } catch (error: any) {
    console.error('Departure Error', error)
    return { success: false, error: error.message }
  }
}

// --- 5. Re-Admit (Admins Only) ---

export async function reAdmitVessel(id: number) {
  const payload = await getPayload({ config: configPromise })

  await payload.update({
    collection: 'vessels',
    id: id,
    data: {
      status: 'pending', // 1. Send back to the "Waiting Line"
      currentBerth: null, // 2. IMPORTANT: Remove the old berth link
      //    (It might be taken by someone else now)
    } as any,
  })

  // 3. Admin must now go to "Pending" tab and assign a NEW slot
  revalidatePath('/dashboard/vessels')
}
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
    label: `${slot.name} (${slot.size}ft) - ${slot.location}`,
  }))
}

// --- 7. NEW: Assign Berth & Activate ---
export async function assignBerth(vesselId: number, slotId: string) {
  const payload = await getPayload({ config: configPromise })

  try {
    // 1. Fetch Vessel to get type
    const vessel = await payload.findByID({ collection: 'vessels', id: vesselId })

    // 2. Create the "Active" Berth Log (Clock In)
    await payload.create({
      collection: 'berths',
      data: {
        vessel: vesselId,
        startTime: new Date().toISOString(),
        status: 'active', // Clock starts ticking
        assignedSlot: slotId as any,
        planType: (vessel.registrationType || 'temporary') as any,
      },
      draft: false,
    })

    // 3. Mark Slot as Occupied
    await payload.update({
      collection: 'berthing-slots',
      id: slotId,
      data: { status: 'occupied' },
    })

    // 4. Update Vessel to Active
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
    console.error('Assign Berth Error', error)
    return { success: false, error: 'Failed to assign berth.' }
  }
}
