'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'

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
  const query: any = {
    and: [],
  }

  // 1. Search Filter (Name or Registration Number)
  if (search) {
    query.and.push({
      or: [{ name: { like: search } }, { registrationNumber: { like: search } }],
    })
  }

  // 2. Status Filter
  if (status && status !== 'all') {
    query.and.push({
      status: { equals: status },
    })
  }

  // 3. Fetch Data
  const result = await payload.find({
    collection: 'vessels',
    where: query,
    page,
    limit,
    depth: 1, // To get Owner details
    sort: '-createdAt',
  })

  return {
    docs: result.docs,
    totalPages: result.totalPages,
    page: result.page,
    totalDocs: result.totalDocs,
  }
}
