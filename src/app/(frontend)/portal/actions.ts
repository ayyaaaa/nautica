'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export async function getMyVessels() {
  const payload = await getPayload({ config: configPromise })
  const requestHeaders = await headers()

  // 1. Get the current logged-in user
  const { user } = await payload.auth({ headers: requestHeaders })

  // 2. If not logged in, force redirect to login
  if (!user) {
    redirect('/admin/login')
  }

  // 3. Find vessels where 'owner' OR 'operator' is this user
  const results = await payload.find({
    collection: 'vessels',
    where: {
      or: [{ owner: { equals: user.id } }, { operator: { equals: user.id } }],
    },
    depth: 1,
    sort: '-createdAt',
  })

  return { vessels: results.docs, user }
}
// ... existing getMyVessels ...

export async function renewSubscription(vesselId: string) {
  const payload = await getPayload({ config: configPromise })

  // 1. Fetch Settings for current price
  const settings = await payload.findGlobal({ slug: 'site-settings' })
  const vessel = await payload.findByID({ collection: 'vessels', id: vesselId })

  // 2. Calculate New Fee (Prices might have changed since last year)
  let baseRate = 0
  if (vessel.registrationType === 'permanent') baseRate = settings.yearlyRate || 100000
  else if (vessel.registrationType === 'hourly') baseRate = settings.hourlyRate || 50
  else baseRate = settings.dailyRate || 500

  const tax = (baseRate * (settings.taxPercentage || 0)) / 100
  const totalFee = baseRate + tax

  // 3. Reset Status to 'payment_pending'
  await payload.update({
    collection: 'vessels',
    id: vesselId,
    data: {
      status: 'payment_pending', // This triggers the "Pay" button in portal
      finance: {
        paymentStatus: 'unpaid',
        fee: totalFee, // Update to new fee
      },
    },
  })

  return { success: true }
}
