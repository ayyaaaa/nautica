import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { notFound, redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { PaymentForm } from './payment-form'

export default async function PaymentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const payload = await getPayload({ config: configPromise })
  const requestHeaders = await headers()

  // 1. Auth Check
  const { user } = await payload.auth({ headers: requestHeaders })
  if (!user) redirect('/admin/login')

  // 2. Fetch Vessel
  const vessel = await payload.findByID({ collection: 'vessels', id })
  if (!vessel) return notFound()

  // 3. Ownership Check
  const ownerId = typeof vessel.owner === 'object' ? vessel.owner.id : vessel.owner
  if (ownerId !== user.id) {
    return <div className="p-10 text-center text-red-500">Unauthorized Access</div>
  }

  // 4. Fetch Unpaid Services (Matches your 'Services.ts' schema)
  const serviceRequests = await payload.find({
    collection: 'services',
    where: {
      and: [
        { vessel: { equals: id } },
        { status: { equals: 'completed' } },
        { paymentStatus: { equals: 'unpaid' } },
      ],
    },
    limit: 100,
  })

  // 5. Calculate Totals
  const berthFee = vessel.finance?.fee || 0
  const servicesFee = serviceRequests.docs.reduce((sum, item) => sum + (item.totalCost || 0), 0)
  const totalAmount = berthFee + servicesFee

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <PaymentForm
        vesselName={vessel.name}
        regNumber={vessel.registrationNumber}
        vesselId={id}
        // Pass detailed breakdown
        berthFee={berthFee}
        servicesFee={servicesFee}
        totalAmount={totalAmount}
        serviceCount={serviceRequests.docs.length}
      />
    </div>
  )
}
