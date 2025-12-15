'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { LogOut, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { processDeparture } from './actions'

export function DepartButton({ id, name }: { id: number; name: string }) {
  const [loading, setLoading] = useState(false)

  const handleDepart = async () => {
    // Confirmation dialog to prevent accidental billing
    if (
      !confirm(
        `Are you sure you want to process departure for ${name}?\n\nThis will:\n1. Stop the berthing timer.\n2. Calculate the final bill.\n3. Free up the berth slot.`,
      )
    )
      return

    setLoading(true)
    const res = await processDeparture(id)

    if (res.success) {
      toast.success('Departure Processed', { description: res.message })
    } else {
      toast.error('Action Failed', { description: res.error })
    }
    setLoading(false)
  }

  return (
    <Button
      size="sm"
      variant="outline"
      className="text-orange-600 border-orange-200 hover:bg-orange-50"
      onClick={handleDepart}
      disabled={loading}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4 mr-1" />}
      Depart & Bill
    </Button>
  )
}
