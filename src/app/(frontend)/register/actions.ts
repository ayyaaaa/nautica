'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { RegistrationFormValues } from '@/lib/validations/registration'

export async function submitRegistration(data: RegistrationFormValues, formData: FormData) {
  const payload = await getPayload({ config: configPromise })

  try {
    // 1. Handle File Uploads
    const operatorIdFile = formData.get('operatorIdDoc') as File
    const operatorPhotoFile = formData.get('operatorPhoto') as File
    const vesselRegFile = formData.get('vesselRegDoc') as File

    // Helper to upload a file to Payload 'media' collection
    const uploadFile = async (file: File) => {
      if (!file || file.size === 0) return null
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      const media = await payload.create({
        collection: 'media',
        data: {
          alt: file.name,
        },
        file: {
          data: buffer,
          name: file.name,
          mimetype: file.type,
          size: file.size,
        },
      })
      return media.id
    }

    // Upload files
    const operatorIdDocId = await uploadFile(operatorIdFile)
    const operatorPhotoId = await uploadFile(operatorPhotoFile)
    const vesselRegDocId = await uploadFile(vesselRegFile)

    // 2. Create the Operator User
    // Check if user exists first
    const existingUsers = await payload.find({
      collection: 'users',
      where: { email: { equals: data.operatorEmail } },
    })

    let operatorUserId: string | number = ''

    if (existingUsers.totalDocs > 0) {
      // If user exists, we use their ID. We DO NOT update their password here for security.
      operatorUserId = existingUsers.docs[0].id
    } else {
      // User does NOT exist, create them with the provided password
      const newUser = await payload.create({
        collection: 'users',
        data: {
          email: data.operatorEmail,
          password: data.password, // <--- Using the password from the form
          role: 'operator',
          fullName: data.operatorName,
          idNumber: data.operatorId,
          phone: data.operatorPhone,
          address: {
            island: data.operatorAddress.island,
          },
          idCardCopy: operatorIdDocId || undefined,
          photo: operatorPhotoId || undefined,
        },
      })
      operatorUserId = newUser.id
    }

    // 3. Create the Vessel
    const newVessel = await payload.create({
      collection: 'vessels',
      // FIX: Explicitly set draft: false to satisfy TypeScript
      draft: false,
      data: {
        name: data.vesselName,
        registrationNumber: data.vesselRegNo,
        registrationType: data.registrationType,
        vesselType: data.vesselType,
        useType: data.useType,
        status: 'pending',

        // Relationships
        // Cast IDs to 'any' to avoid "string vs number" conflicts depending on your DB
        owner: operatorUserId as any,
        operator: operatorUserId as any,

        // Specs (Only if permanent)
        specs:
          data.registrationType === 'permanent'
            ? {
                length: data.length,
                width: data.width,
                fuelType: data.fuelType as any, // Cast enums to any
                engineType: data.engineType as any,
              }
            : undefined,

        // Documents
        registrationDoc: vesselRegDocId as any,
      },
    })

    return { success: true, vesselId: newVessel.id }
  } catch (error: any) {
    console.error('Registration Error:', error)
    return { success: false, error: error.message }
  }
}
