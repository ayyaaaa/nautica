'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { rejectVessel } from './actions' // <--- Import the new function

export function RejectButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false)

  const handleReject = async () => {
    if (!confirm('Are you sure you want to reject this vessel?')) return

    setLoading(true)
    // Call the new specific reject action
    const res = await rejectVessel(id)

    if (res.success) {
      toast.success('Vessel Rejected')
    } else {
      toast.error('Action Failed', { description: res.error })
    }
    setLoading(false)
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleReject}
      disabled={loading}
      className="text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <XCircle className="h-4 w-4 mr-1" />
      )}
      Reject
    </Button>
  )
}
