'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { revalidatePath } from 'next/cache'

export type InvoiceItem = {
  id: string | number
  type: 'vessel' | 'service'
  reference: string
  description: string
  amount: number
  status: 'paid' | 'unpaid' | 'waived'
  date: string
  method?: string
  transactionId?: string
}

// --- 1. GET HISTORY ---
export async function getAllTransactions() {
  const payload = await getPayload({ config: configPromise })

  const { docs: payments } = await payload.find({
    collection: 'payments',
    limit: 100,
    sort: '-paidAt',
    depth: 1,
  })

  const history: InvoiceItem[] = payments.map((p: any) => ({
    id: p.id,
    type: p.relatedService ? 'service' : 'vessel',
    reference: typeof p.vessel === 'object' ? p.vessel.name : 'Unknown Vessel',
    description: p.description || 'Payment',
    amount: p.amount,
    status: 'paid',
    date: p.paidAt,
    transactionId: p.invoiceNumber,
    method: p.method,
  }))

  return history
}

// --- 2. MARK AS PAID ---
export async function markAsPaid(
  id: string | number,
  type: 'vessel' | 'service',
  formData?: FormData | { method: 'cash' },
) {
  const payload = await getPayload({ config: configPromise })

  try {
    let transferSlipId = null
    let paymentMethod = 'cash'

    // 1. Handle File Upload
    if (formData instanceof FormData) {
      const file = formData.get('file') as File
      if (file) {
        paymentMethod = 'transfer'
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        const mediaUpload = await payload.create({
          collection: 'media',
          data: { alt: `Transfer Slip - ${type} ${id}` },
          file: {
            data: buffer,
            name: file.name,
            mimetype: file.type,
            size: file.size,
          },
        })
        transferSlipId = mediaUpload.id
      }
    }

    // Variables for the Log
    let paidAmount = 0
    let vesselId: number | null = null
    // FIX: Allow serviceId to be number
    let serviceId: number | null = null
    let description = ''

    const invoiceNum = `INV-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`

    // --- A. Process Vessel Payment ---
    if (type === 'vessel') {
      const vessel = await payload.findByID({ collection: 'vessels', id: id as number })
      paidAmount = vessel.finance?.fee || 0
      vesselId = vessel.id
      description =
        vessel.registrationType === 'permanent' ? 'Permit Renewal' : 'Departure Settlement'

      // Mark linked services as paid
      const unpaidServices = await payload.find({
        collection: 'services',
        where: {
          and: [
            { vessel: { equals: id } },
            { status: { equals: 'completed' } },
            { paymentStatus: { equals: 'unpaid' } },
          ],
        },
      })

      if (unpaidServices.docs.length > 0) {
        await Promise.all(
          unpaidServices.docs.map((s) =>
            payload.update({ collection: 'services', id: s.id, data: { paymentStatus: 'paid' } }),
          ),
        )
      }

      // Reset Vessel Balance
      const updates: any = {
        status: vessel.registrationType === 'permanent' ? 'active' : 'departed',
        finance: {
          ...vessel.finance,
          paymentStatus: 'paid',
          paymentDate: new Date().toISOString(),
          fee: 0,
        },
      }

      if (vessel.registrationType === 'permanent') {
        const now = new Date()
        const nextDue = new Date(now)
        nextDue.setFullYear(nextDue.getFullYear() + 1)
        updates.finance.nextPaymentDue = nextDue.toISOString()
      } else {
        updates.currentBerth = null
        if (vessel.currentBerth) {
          const slotId =
            typeof vessel.currentBerth === 'object' ? vessel.currentBerth.id : vessel.currentBerth
          await payload.update({
            collection: 'berthing-slots',
            id: slotId,
            data: { status: 'available' },
          })
        }
      }

      await payload.update({ collection: 'vessels', id: id as number, data: updates })

      // --- B. Process Service Payment ---
    } else {
      // FIX: Cast id to number (assuming SQL DB)
      const service = await payload.findByID({ collection: 'services', id: id as number })

      paidAmount = service.totalCost || 0
      serviceId = service.id
      description = `${service.serviceType} (${service.quantity})`
      vesselId = typeof service.vessel === 'object' ? service.vessel.id : service.vessel

      await payload.update({
        collection: 'services',
        id: id as number,
        data: { paymentStatus: 'paid' },
      })
    }

    // --- C. CREATE THE PERMANENT LOG ENTRY ---
    await payload.create({
      collection: 'payments',
      data: {
        invoiceNumber: invoiceNum,
        // FIX: Cast relationships to 'any' to bypass Strict TS Mismatch
        vessel: vesselId as any,
        description: description,
        amount: paidAmount,
        status: 'paid',
        method: paymentMethod as 'cash' | 'transfer',
        paidAt: new Date().toISOString(),
        relatedService: (serviceId || null) as any,
        proofOfPayment: transferSlipId,
      },
    })

    revalidatePath('/dashboard/payments')
    revalidatePath('/dashboard/vessels')
    return { success: true }
  } catch (error) {
    console.error('Payment Error:', error)
    return { success: false, error: 'Failed to update payment' }
  }
}

// --- 3. GET PENDING (Standard) ---
export async function getPendingPayments() {
  const payload = await getPayload({ config: configPromise })
  const invoices: InvoiceItem[] = []

  const { docs: vessels } = await payload.find({
    collection: 'vessels',
    where: { status: { equals: 'payment_pending' } },
    limit: 100,
  })

  vessels.forEach((v: any) => {
    invoices.push({
      id: v.id,
      type: 'vessel',
      reference: v.name,
      description: v.registrationType === 'permanent' ? 'Renewal Fee' : 'Departure Bill',
      amount: v.finance?.fee || 0,
      status: 'unpaid',
      date: v.updatedAt,
    })
  })

  const { docs: services } = await payload.find({
    collection: 'services',
    where: {
      and: [{ status: { equals: 'completed' } }, { paymentStatus: { equals: 'unpaid' } }],
    },
    depth: 1,
    limit: 100,
  })

  services.forEach((s: any) => {
    invoices.push({
      id: s.id,
      type: 'service',
      reference: s.vessel?.name || 'Unknown',
      description: `${s.serviceType} (${s.quantity})`,
      amount: s.totalCost || 0,
      status: 'unpaid',
      date: s.requestDate,
    })
  })

  return invoices.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}
