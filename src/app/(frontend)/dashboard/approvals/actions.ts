'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { revalidatePath } from 'next/cache'

// --- 1. Fetch Pending Vessels ---
export async function getPendingVessels() {
  const payload = await getPayload({ config: configPromise })
  const results = await payload.find({
    collection: 'vessels',
    where: { status: { equals: 'pending' } },
    depth: 2,
    sort: '-createdAt',
  })
  return results.docs
}

// --- 2. Fetch Available Slots ---
export async function getAvailableSlots(registrationType: string) {
  const payload = await getPayload({ config: configPromise })

  // Logic: Permanent vessels need 'permanent' slots (Block A)
  // Temporary/Hourly vessels need 'temporary' slots (T-Jetty)
  const requiredType = registrationType === 'permanent' ? 'permanent' : 'temporary'

  const { docs } = await payload.find({
    collection: 'berthing-slots',
    where: {
      and: [{ status: { equals: 'available' } }, { type: { equals: requiredType } }],
    },
    limit: 100,
    sort: 'name',
  })

  return docs.map((slot: any) => ({
    id: slot.id,
    label: `${slot.name} (${slot.zone.replace(/_/g, ' ').toUpperCase()})`,
  }))
}

// --- 3. REJECT Logic ---
export async function rejectVessel(vesselId: string) {
  const payload = await getPayload({ config: configPromise })

  const vesselIDNum = Number(vesselId)

  try {
    await payload.update({
      collection: 'vessels',
      id: vesselIDNum,
      data: { status: 'rejected' },
    })
    revalidatePath('/dashboard/approvals')
    return { success: true }
  } catch (e) {
    return { success: false, error: 'Failed to reject' }
  }
}
export async function getPendingApprovals() {
  const payload = await getPayload({ config: configPromise })

  const { docs } = await payload.find({
    collection: 'vessels',
    where: {
      // STRICT FILTER: Only show 'pending' (Brand new requests)
      // Do NOT show 'payment_pending' (Exit bills or approved renewals)
      status: { equals: 'pending' },
    },
    sort: '-createdAt',
  })

  return docs
}

// --- 4. APPROVE Logic (Conditional: Upfront vs Pay-Later) ---
export async function approveVesselWithSlot(vesselId: string, slotId: string, regType: string) {
  const payload = await getPayload({ config: configPromise })

  // Convert String IDs to Numbers
  const vesselIDNum = Number(vesselId)
  const slotIDNum = Number(slotId)

  if (isNaN(vesselIDNum) || isNaN(slotIDNum)) {
    return { success: false, error: 'Validation Error: Invalid ID format' }
  }

  try {
    // A. Fetch Rates & Settings
    // ------------------------------------------------
    const settings = await payload.findGlobal({ slug: 'site-settings' })
    const s = settings as any

    let baseRate = 0
    let planType: 'yearly' | 'monthly' | 'daily' | 'hourly' = 'daily'

    // Determine Rate and Plan Type based on Registration
    if (regType === 'permanent') {
      baseRate = s.yearlyRate || 100000
      planType = 'yearly'
    } else if (regType === 'hourly') {
      baseRate = s.hourlyRate || 50
      planType = 'hourly'
    } else {
      // Temporary / Day-to-Day
      baseRate = s.dailyRate || 500
      planType = 'daily'
    }

    // Calculate Tax for the Base Rate (Note: For temp, this is just the rate, not final bill)
    const taxPercent = s.taxPercentage || 0
    const taxAmount = baseRate * (taxPercent / 100)
    const totalCalculatedRate = baseRate + taxAmount
    // ------------------------------------------------

    // B. LOGIC SPLIT: Permanent vs Temporary
    const isPermanent = regType === 'permanent'

    // 1. Permanent: Status = 'payment_pending', Fee = Full Amount
    // 2. Temporary: Status = 'active', Fee = 0 (Calculated on Departure)
    const newStatus = isPermanent ? 'payment_pending' : 'active'
    const initialVesselFee = isPermanent ? totalCalculatedRate : 0

    // C. Mark the Physical Slot as OCCUPIED
    await payload.update({
      collection: 'berthing-slots',
      id: slotIDNum,
      data: { status: 'occupied' },
    })

    // D. Create History Record (Berths Log)
    // We record the "Start Time" here. This is crucial for calculating the bill later.
    await payload.create({
      collection: 'berths',
      data: {
        vessel: vesselIDNum,
        planType: planType,
        status: 'active',
        startTime: new Date().toISOString(),
        assignedSlot: slotIDNum,
        billing: {
          rateApplied: baseRate,
          // If permanent, we know the total. If temp, we set 0 (calculated on exit).
          totalCalculated: isPermanent ? totalCalculatedRate : 0,
          isPaid: false,
        },
      },
    })

    // E. Update Vessel
    await payload.update({
      collection: 'vessels',
      id: vesselIDNum,
      data: {
        status: newStatus as any, // 'active' for temp, 'payment_pending' for perm
        currentBerth: slotIDNum,
        finance: {
          fee: initialVesselFee, // 0 for temp
          paymentStatus: 'unpaid',
        },
      } as any,
    })

    revalidatePath('/dashboard/approvals')
    revalidatePath('/dashboard/vessels') // Refresh fleet list to show new active boat
    return { success: true }
  } catch (e: any) {
    console.error('Approval Error:', e)
    return { success: false, error: e.message || 'Approval failed. Check server logs.' }
  }
}
