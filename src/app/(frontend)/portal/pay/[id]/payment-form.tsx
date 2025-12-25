'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CreditCard, Loader2, Lock } from 'lucide-react'
import { toast } from 'sonner'
import { processPayment } from './actions'

interface PaymentFormProps {
  vesselName: string
  regNumber: string
  vesselId: string
  berthFee: number
  servicesFee: number
  totalAmount: number
  serviceCount: number
}

export function PaymentForm({
  vesselName,
  vesselId,
  berthFee,
  servicesFee,
  totalAmount,
  serviceCount,
}: PaymentFormProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500)) // Mock Gateway
      const result = await processPayment(vesselId)

      if (result.success) {
        toast.success('Payment Successful!', {
          description: `Bill of MVR ${totalAmount.toLocaleString()} cleared.`,
        })
        window.location.href = '/portal'
      } else {
        toast.error('Payment Failed', { description: result.error })
      }
    } catch (error) {
      toast.error('System Error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md shadow-xl border-t-4 border-t-blue-600">
      <CardHeader className="bg-slate-50/50 border-b pb-6">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl text-blue-900">Checkout</CardTitle>
            <CardDescription>Payment for {vesselName}</CardDescription>
          </div>
          <div className="text-right">
            <span className="block text-xs text-muted-foreground uppercase font-bold">
              Total Due
            </span>
            <span className="text-2xl font-bold text-slate-900">
              MVR {totalAmount.toLocaleString()}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        {/* Bill Breakdown */}
        <div className="bg-slate-50 border rounded-md p-4 mb-6 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Berthing Fee</span>
            <span className="font-medium">MVR {berthFee.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Services ({serviceCount})</span>
            <span className="font-medium">MVR {servicesFee.toLocaleString()}</span>
          </div>
          <div className="border-t pt-2 mt-2 flex justify-between font-bold text-base">
            <span>Total</span>
            <span>MVR {totalAmount.toLocaleString()}</span>
          </div>
        </div>

        <form onSubmit={handlePay} className="space-y-4">
          {/* Form Fields (Card Name, Number, etc.) */}
          <div className="space-y-2">
            <Label>Cardholder Name</Label>
            <Input placeholder="Name on card" required />
          </div>

          <div className="space-y-2">
            <Label>Card Number</Label>
            <div className="relative">
              <Input placeholder="0000 0000 0000 0000" required />
              <CreditCard className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Expiry</Label>
              <Input placeholder="MM/YY" required />
            </div>
            <div className="space-y-2">
              <Label>CVC</Label>
              <Input placeholder="123" required />
            </div>
          </div>

          <Button
            className="w-full bg-blue-600 hover:bg-blue-700 mt-4 text-white"
            size="lg"
            disabled={isLoading || totalAmount === 0}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              `Pay MVR ${totalAmount.toLocaleString()}`
            )}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="justify-center border-t py-4 bg-muted/20">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Lock className="w-3 h-3" />
          Payments processed securely
        </div>
      </CardFooter>
    </Card>
  )
}
