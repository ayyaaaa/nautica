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
