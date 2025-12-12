'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { updateApplicationStatus } from './actions'
import { toast } from 'sonner'

export function ApprovalActions({ id }: { id: string }) {
  const [loading, setLoading] = useState(false)

  // FIX: Update type here to match action
  const handleUpdate = async (status: 'active' | 'rejected') => {
    setLoading(true)
    try {
      const result = await updateApplicationStatus(id, status)
      if (result.success) {
        // We still show "Approved" to the human user, but send "active" to DB
        const displayStatus = status === 'active' ? 'Approved' : 'Rejected'
        toast.success(`Vessel ${displayStatus} successfully`)
      } else {
        toast.error('Failed to update status')
      }
    } catch (e) {
      toast.error('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex justify-end gap-2">
      <Button
        size="sm"
        variant="outline"
        className="text-red-600 hover:text-red-700 hover:bg-red-50"
        onClick={() => handleUpdate('rejected')}
        disabled={loading}
      >
        <XCircle className="w-4 h-4 mr-1" />
        Reject
      </Button>
      <Button
        size="sm"
        className="bg-green-600 hover:bg-green-700 text-white"
        // FIX: Send 'active' instead of 'approved'
        onClick={() => handleUpdate('active')}
        disabled={loading}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <CheckCircle className="w-4 h-4 mr-1" />
        )}
        Approve
      </Button>
    </div>
  )
}
