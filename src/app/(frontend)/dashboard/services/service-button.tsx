'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, Check, Ban, Play, Clock } from 'lucide-react'
import { updateServiceStatus } from './actions'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

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

  // --- CASE 1: NEW REQUEST (Choose Workflow) ---
  if (status === 'requested') {
    return (
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4 mr-1" />
              )}
              Process...
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Select Action</DropdownMenuLabel>
            <DropdownMenuSeparator />

            {/* Option A: Bill Immediately (e.g. Permanent Vessels) */}
            <DropdownMenuItem onClick={() => handleUpdate('payment_pending', 'Bill sent to User')}>
              <Clock className="mr-2 h-4 w-4 text-orange-500" />
              <span>Approve & Bill Now</span>
            </DropdownMenuItem>

            {/* Option B: Pay Later (e.g. Temporary Vessels) */}
            <DropdownMenuItem
              onClick={() => handleUpdate('in_progress', 'Service Started (Pay at Exit)')}
            >
              <Play className="mr-2 h-4 w-4 text-green-500" />
              <span>Start Work (Pay Later)</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          size="sm"
          variant="outline"
          onClick={() => handleUpdate('cancelled', 'Request Cancelled')}
          disabled={loading}
          className="text-red-600 border-red-200 hover:bg-red-50"
        >
          <Ban className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  // --- CASE 2: PAYMENT PENDING (Waiting for payment) ---
  if (status === 'payment_pending') {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground italic">Waiting for payment...</span>
        {/* Optional: Override button if Admin receives cash or force starts */}
        <Button
          size="sm"
          variant="ghost"
          onClick={() => handleUpdate('in_progress', 'Force Started (Admin Override)')}
          className="h-6 px-2 text-[10px] text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          disabled={loading}
        >
          Override
        </Button>
      </div>
    )
  }

  // --- CASE 3: IN PROGRESS (Work started) ---
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

  // --- CASE 4: COMPLETED ---
  if (status === 'completed') {
    return (
      <span className="text-xs font-medium text-green-600 flex items-center">
        <Check className="h-3 w-3 mr-1" /> Done
      </span>
    )
  }

  return <span className="text-muted-foreground text-xs">-</span>
}
