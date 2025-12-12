'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export async function getPermitData(vesselId: string) {
  const payload = await getPayload({ config: configPromise })
  const requestHeaders = await headers()

  // 1. Get User
  const { user } = await payload.auth({ headers: requestHeaders })
  if (!user) redirect('/login')

  // 2. Fetch Vessel
  const vessel = await payload.findByID({
    collection: 'vessels',
    id: vesselId,
    depth: 1,
  })

  if (!vessel) {
    return { error: 'Vessel not found' }
  }

  // 3. SECURITY CHECK: Ensure this user actually owns/operates this vessel
  // FIX: Safely extract ID whether it's an object (populated) or string (ID only) or null
  const ownerId = vessel.owner && typeof vessel.owner === 'object' ? vessel.owner.id : vessel.owner
  const operatorId =
    vessel.operator && typeof vessel.operator === 'object' ? vessel.operator.id : vessel.operator

  // Use optional chaining just in case the IDs are null
  const isOwner = ownerId === user.id
  const isOperator = operatorId === user.id

  if (!isOwner && !isOperator && user.role !== 'admin') {
    redirect('/portal')
  }

  // 4. Double Check Status
  if (vessel.status !== 'active') {
    return { error: 'Permit not available. Vessel is not active.' }
  }

  return { vessel, user }
}
