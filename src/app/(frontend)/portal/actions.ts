'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'

// --- 1. Fetch User's Vessels ---
export async function getMyVessels() {
  const payload = await getPayload({ config: configPromise })
  const requestHeaders = await headers()
  const { user } = await payload.auth({ headers: requestHeaders })

  if (!user) return []

  const result = await payload.find({
    collection: 'vessels',
    where: {
      owner: { equals: user.id },
    },
    depth: 1,
    limit: 50,
  })

  return result.docs
}

// --- 2. Renew Subscription ---
export async function renewSubscription(vesselId: string) {
  const payload = await getPayload({ config: configPromise })

  try {
    const vessel = await payload.findByID({ collection: 'vessels', id: vesselId })
    const now = new Date()
    const nextDue = new Date(now)
    nextDue.setFullYear(nextDue.getFullYear() + 1)

    await payload.update({
      collection: 'vessels',
      id: vesselId,
      data: {
        status: 'payment_pending',
        finance: {
          ...vessel.finance,
          paymentStatus: 'unpaid',
          nextPaymentDue: nextDue.toISOString(),
          fee: 5000,
        } as any,
      },
    })

    revalidatePath('/portal')
    return { success: true }
  } catch (error) {
    console.error('Renew Error:', error)
    return { success: false }
  }
}

// --- 3. Process Payment ---
export async function processPayment(vesselId: string) {
  const payload = await getPayload({ config: configPromise })

  try {
    const vessel = await payload.findByID({ collection: 'vessels', id: vesselId })
    const now = new Date()
    const updates: any = {
      finance: {
        ...vessel.finance,
        paymentStatus: 'paid',
        paymentDate: now.toISOString(),
        transactionId: `TXN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        fee: 0,
      },
    }

    if (vessel.status === 'payment_pending') {
      const isRenewal =
        vessel.finance?.nextPaymentDue && new Date(vessel.finance.nextPaymentDue) > now
      updates.status = isRenewal ? 'active' : 'departed'
    } else if (vessel.registrationType === 'permanent') {
      updates.status = 'active'
      const currentExpiry = vessel.finance?.nextPaymentDue
        ? new Date(vessel.finance.nextPaymentDue)
        : new Date()
      const baseDate = currentExpiry < now ? now : currentExpiry
      const nextDue = new Date(baseDate)
      nextDue.setFullYear(nextDue.getFullYear() + 1)
      updates.finance.nextPaymentDue = nextDue.toISOString()
    } else if (vessel.status === 'pending') {
      updates.status = 'active'
    }

    await payload.update({
      collection: 'vessels',
      id: vesselId,
      data: updates,
    })

    revalidatePath('/portal')
    return { success: true }
  } catch (e: any) {
    console.error('Payment Error:', e)
    return { success: false, error: e.message }
  }
}

// --- 4. Submit New Vessel (Used by AddVesselDialog) ---
export async function submitNewVessel(data: any, formData: FormData) {
  const payload = await getPayload({ config: configPromise })
  const requestHeaders = await headers()
  const { user } = await payload.auth({ headers: requestHeaders })

  if (!user) {
    return { success: false, error: 'You must be logged in to add a vessel.' }
  }

  try {
    const vesselRegFile = formData.get('vesselRegDoc') as File
    let vesselRegDocId = null

    if (vesselRegFile && vesselRegFile.size > 0) {
      const arrayBuffer = await vesselRegFile.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      const media = await payload.create({
        collection: 'media',
        data: { alt: `Reg Doc - ${data.vesselName}` },
        file: {
          data: buffer,
          name: vesselRegFile.name,
          mimetype: vesselRegFile.type,
          size: vesselRegFile.size,
        },
      })
      vesselRegDocId = media.id
    }

    await payload.create({
      collection: 'vessels',
      draft: false,
      data: {
        name: data.vesselName,
        registrationNumber: data.vesselRegNo,
        registrationType: data.registrationType,
        vesselType: data.vesselType,
        useType: data.useType,
        status: 'pending',
        owner: user.id,
        operator: user.id,
        specs:
          data.registrationType === 'permanent'
            ? {
                length: data.length,
                width: data.width,
                fuelType: data.fuelType,
              }
            : undefined,
        registrationDoc: vesselRegDocId,
      },
    })

    revalidatePath('/portal')
    return { success: true }
  } catch (error: any) {
    console.error('Add Vessel Error:', error)
    return { success: false, error: error.message }
  }
}
