'use client'

import { useState, useEffect } from 'react'
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

export default function PaymentPage({ params }: { params: Promise<{ id: string }> }) {
  const [isLoading, setIsLoading] = useState(false)
  const [id, setId] = useState<string>('')

  useEffect(() => {
    params.then((p) => setId(p.id))
  }, [params])

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500)) // Simulate processing
      const result = await processPayment(id)

      if (result.success) {
        toast.success('Payment Successful!', { description: 'Permit is now active.' })
        window.location.href = '/portal'
      } else {
        toast.error('Payment Failed')
      }
    } catch (error) {
      toast.error('System Error')
    } finally {
      setIsLoading(false)
    }
  }

  if (!id)
    return (
      <div className="p-10 text-center">
        <Loader2 className="animate-spin mx-auto" />
      </div>
    )

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md shadow-xl border-t-4 border-t-primary">
        <CardHeader>
          <div className="flex items-center gap-2 text-primary mb-2">
            <Lock className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Secure Checkout</span>
          </div>
          <CardTitle>Complete Registration</CardTitle>
          <CardDescription>Enter payment details to activate your permit.</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handlePay} className="space-y-4">
            <div className="space-y-2">
              <Label>Cardholder Name</Label>
              <Input placeholder="Ali Ahmed" required />
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
              className="w-full bg-primary hover:bg-primary/90 mt-4 text-white"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : 'Confirm Payment'}
            </Button>
          </form>
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
