import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { redirect } from 'next/navigation'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Lock, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { ServicePaymentForm } from './payment-form' // <--- Import the Client Component

export default async function ServicePaymentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const payload = await getPayload({ config: configPromise })

  // 1. Fetch service details SERVER-SIDE
  const service = await payload.findByID({ collection: 'services', id })

  // 2. Security Check: Only allow payment if status is correct
  if (!service || service.status !== 'payment_pending') {
    redirect('/portal/services')
  }

  // 3. Render the Page
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md shadow-xl border-t-4 border-t-blue-600">
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <Button variant="ghost" size="sm" className="-ml-3" asChild>
              <Link href="/portal/services">
                <ArrowLeft className="w-4 h-4 mr-1" /> Cancel
              </Link>
            </Button>
            <div className="flex items-center gap-2 text-blue-600">
              <Lock className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Secure Payment</span>
            </div>
          </div>
          <CardTitle>Service Invoice</CardTitle>
          <CardDescription>Complete payment to start the service.</CardDescription>
        </CardHeader>

        <CardContent>
          {/* 4. Pass data to the Client Component */}
          <ServicePaymentForm
            id={id}
            amount={service.totalCost || 0}
            serviceName={service.serviceType}
          />
        </CardContent>
        <CardFooter className="justify-center border-t py-4 bg-muted/20">
          <p className="text-xs text-muted-foreground">
            Payments processed securely via MockGateway
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
