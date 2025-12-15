import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { notFound, redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { PaymentForm } from './payment-form' // We will create this next

export default async function PaymentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const payload = await getPayload({ config: configPromise })
  const requestHeaders = await headers()

  // 1. Security Check (Ensure user is logged in)
  const { user } = await payload.auth({ headers: requestHeaders })
  if (!user) redirect('/admin/login')

  // 2. Fetch Vessel
  const vessel = await payload.findByID({ collection: 'vessels', id })

  if (!vessel) return notFound()

  // 3. Security Check (Ensure user owns the vessel)
  const ownerId = typeof vessel.owner === 'object' ? vessel.owner.id : vessel.owner
  if (ownerId !== user.id) {
    return <div className="p-10 text-center text-red-500">Unauthorized Access</div>
  }

  // 4. Get the Bill Amount
  // If there is no specific fee set, default to 0 (or handle subscription logic)
  const amountToPay = vessel.finance?.fee || 0

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      {/* Pass the data to the Client Component */}
      <PaymentForm
        vesselName={vessel.name}
        regNumber={vessel.registrationNumber}
        amount={amountToPay}
        vesselId={id}
      />
    </div>
  )
}
