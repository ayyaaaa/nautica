import { getServiceDetails, processServicePayment } from '../../services/actions'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { CheckCircle2, AlertCircle } from 'lucide-react'
import { redirect, notFound } from 'next/navigation'

export default async function PayServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const service = await getServiceDetails(id)

  if (!service) return notFound()

  // If already paid, redirect back
  if (service.status !== 'payment_pending') {
    redirect('/portal/services')
  }

  // Server Action for the button
  async function payAction() {
    'use server'
    await processServicePayment(id)
    redirect('/portal/services')
  }

  return (
    <div className="max-w-md mx-auto py-20">
      <Card className="border-blue-200 shadow-md">
        <CardHeader className="bg-blue-50/50 pb-8 border-b">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <CheckCircle2 className="h-6 w-6" />
            </div>
          </div>
          <CardTitle className="text-center text-2xl">Approve Payment</CardTitle>
          <CardDescription className="text-center">
            Please confirm payment to start the service.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Service Type</span>
            <span className="font-medium capitalize">
              {typeof service.serviceType === 'object'
                ? service.serviceType.name
                : service.serviceType}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Vessel</span>
            <span className="font-medium">{(service.vessel as any)?.name}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Quantity</span>
            <span className="font-medium">{service.quantity} Units</span>
          </div>

          <Separator className="my-2" />

          <div className="flex justify-between items-center text-lg font-bold">
            <span>Total Amount</span>
            <span>MVR {service.totalCost?.toLocaleString()}</span>
          </div>

          <div className="bg-yellow-50 p-3 rounded-md border border-yellow-100 flex gap-2 text-xs text-yellow-800 mt-4">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <p>By clicking confirm, the amount will be deducted from your linked payment method.</p>
          </div>
        </CardContent>
        <CardFooter className="pt-2 pb-6">
          <form action={payAction} className="w-full">
            <Button className="w-full bg-blue-600 hover:bg-blue-700" size="lg">
              Confirm & Pay MVR {service.totalCost?.toLocaleString()}
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  )
}
