'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CreditCard, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { processServicePayment } from './actions'
import { useRouter } from 'next/navigation'

export function ServicePaymentForm({
  id,
  amount,
  serviceName,
}: {
  id: string
  amount: number
  serviceName: string
}) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500)) // Mock delay
      const result = await processServicePayment(id)

      if (result.success) {
        toast.success('Payment Successful!', {
          description: 'Service status updated to In Progress.',
        })
        router.push('/portal/services')
        router.refresh()
      } else {
        toast.error('Payment Failed')
      }
    } catch (error) {
      toast.error('System Error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handlePay} className="space-y-4">
      <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-lg flex justify-between items-center text-blue-900">
        <div>
          <p className="text-xs uppercase tracking-wider font-semibold opacity-70">Payment For</p>
          <p className="font-medium capitalize">{serviceName}</p>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-wider font-semibold opacity-70">Total Due</p>
          <span className="text-2xl font-bold">MVR {amount.toLocaleString()}</span>
        </div>
      </div>

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
        className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-4"
        size="lg"
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          `Pay MVR ${amount.toLocaleString()}`
        )}
      </Button>
    </form>
  )
}
