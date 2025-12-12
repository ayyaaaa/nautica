'use client'

import { useState } from 'react'
import { Check, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { updateApplicationStatus } from './actions'

export function ApprovalActions({ id }: { id: string }) {
  const [loading, setLoading] = useState(false)

  // FIX: Updated type to match the server action ('approve' | 'reject')
  const handleUpdate = async (action: 'approve' | 'reject') => {
    setLoading(true)
    try {
      const result = await updateApplicationStatus(id, action)

      if (result.success) {
        toast.success(`Application ${action === 'approve' ? 'Approved' : 'Rejected'}`, {
          description:
            action === 'approve'
              ? 'Fee calculated and bill generated.'
              : 'Application has been rejected.',
        })
      } else {
        toast.error('Update Failed', {
          description: 'Could not update application status.',
        })
      }
    } catch (error) {
      toast.error('Network Error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        variant="outline"
        className="h-8 w-8 p-0 border-green-200 bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700"
        disabled={loading}
        // FIX: Sending 'approve' instead of 'active'
        onClick={() => handleUpdate('approve')}
        title="Approve & Bill"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
        <span className="sr-only">Approve</span>
      </Button>

      <Button
        size="sm"
        variant="outline"
        className="h-8 w-8 p-0 border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700"
        disabled={loading}
        // Sending 'reject' is correct
        onClick={() => handleUpdate('reject')}
        title="Reject"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
        <span className="sr-only">Reject</span>
      </Button>
    </div>
  )
}
