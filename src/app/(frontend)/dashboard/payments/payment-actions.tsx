'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, CheckCircle2 } from 'lucide-react'
import { markAsPaid } from './actions'
import { toast } from 'sonner'

export function MarkPaidButton({
  id,
  type,
  amount,
}: {
  id: string | number
  type: 'vessel' | 'service'
  amount: number
}) {
  const [loading, setLoading] = useState(false)

  const handlePay = async () => {
    if (!confirm(`Confirm receipt of MVR ${amount.toLocaleString()}?`)) return

    setLoading(true)
    const res = await markAsPaid(id, type)
    if (res.success) {
      toast.success('Payment Recorded', { description: 'Invoice marked as paid.' })
    } else {
      toast.error('Error', { description: 'Failed to update record.' })
    }
    setLoading(false)
  }

  return (
    <Button
      size="sm"
      onClick={handlePay}
      disabled={loading}
      className="bg-green-600 hover:bg-green-700 text-white"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <CheckCircle2 className="h-4 w-4 mr-2" />
      )}
      Mark Paid
    </Button>
  )
}
