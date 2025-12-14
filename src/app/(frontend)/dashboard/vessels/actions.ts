'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { revalidatePath } from 'next/cache'

// --- 1. Fetch list of users for the dropdown ---
export async function getOwners() {
  const payload = await getPayload({ config: configPromise })
  const { docs } = await payload.find({
    collection: 'users',
    limit: 100,
    sort: 'email',
  })

  return docs.map((u) => ({
    id: u.id,
    label: u.fullName ? `${u.fullName} (${u.email})` : u.email,
  }))
}

// ... existing getVessels function (no changes needed here) ...
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

// --- 2. Create Vessel with Selected Owner ---
export async function createManualVessel(formData: FormData) {
  const payload = await getPayload({ config: configPromise })

  const name = formData.get('name') as string
  const regNo = formData.get('registrationNumber') as string
  const type = formData.get('vesselType') as string
  const regType = formData.get('registrationType') as string
  const ownerId = formData.get('ownerId') as string

  const vesselType = type.toUpperCase()

  try {
    await payload.create({
      collection: 'vessels',
      data: {
        name,
        registrationNumber: regNo,
        vesselType: vesselType as any,
        registrationType: regType as any,
        status: 'pending',

        // FIX: Convert string ID to Number
        owner: Number(ownerId),

        useType: 'Other',
      },
      draft: false,
    })

    revalidatePath('/dashboard/vessels')
    revalidatePath('/dashboard/approvals')

    return { success: true }
  } catch (error) {
    console.error('Create Vessel Error:', error)
    return { success: false, error: 'Failed to create vessel. Check duplicate Reg No.' }
  }
}
