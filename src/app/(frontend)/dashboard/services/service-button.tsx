'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, Check, Ban, Play } from 'lucide-react'
import { updateServiceStatus } from './actions'
import { toast } from 'sonner'

export function ServiceActions({ id, status }: { id: string; status: string }) {
  const [loading, setLoading] = useState(false)

  const handleUpdate = async (newStatus: string, successMsg: string) => {
    setLoading(true)
    const res = await updateServiceStatus(id, newStatus)
    if (res.success) {
      toast.success(successMsg)
    } else {
      toast.error('Action failed')
    }
    setLoading(false)
  }

  if (status === 'requested') {
    return (
      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={() => handleUpdate('payment_pending', 'Bill sent to User')}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Check className="h-4 w-4 mr-1" />
          )}
          Approve & Bill
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleUpdate('cancelled', 'Request Cancelled')}
          disabled={loading}
          className="text-red-600 hover:bg-red-50"
        >
          <Ban className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  if (status === 'in_progress') {
    return (
      <Button
        size="sm"
        onClick={() => handleUpdate('completed', 'Service Marked Complete')}
        disabled={loading}
        className="bg-green-600 hover:bg-green-700 text-white"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Check className="h-4 w-4 mr-1" />
        )}
        Mark Complete
      </Button>
    )
  }

  // If payment pending, Admin usually waits, but maybe they want to cancel
  if (status === 'payment_pending') {
    return <span className="text-xs text-muted-foreground italic">Waiting for payment...</span>
  }

  return null
}
