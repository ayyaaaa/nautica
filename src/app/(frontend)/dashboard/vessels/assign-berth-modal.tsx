'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { assignBerth } from '@/app/(frontend)/dashboard/vessels/actions'
import { Loader2, Anchor } from 'lucide-react'
import { toast } from 'sonner'

export function AssignBerthModal({
  vesselId,
  vesselName,
  availableSlots,
}: {
  vesselId: number
  vesselName: string
  availableSlots: { id: string; label: string }[]
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState('')

  const handleAssign = async () => {
    if (!selectedSlot) return
    setLoading(true)

    const res = await assignBerth(vesselId, selectedSlot)

    if (res.success) {
      toast.success('Berth Assigned', { description: `${vesselName} is now active.` })
      setIsOpen(false)
    } else {
      toast.error('Error', { description: res.error })
    }
    setLoading(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-green-100 hover:text-green-900 text-green-700 font-medium">
          <Anchor className="mr-2 h-4 w-4" /> Approve & Dock
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Berth to {vesselName}</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <label className="text-sm font-medium mb-2 block">Select Available Slot</label>
          <Select onValueChange={setSelectedSlot}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a slot..." />
            </SelectTrigger>
            <SelectContent>
              {availableSlots.length === 0 ? (
                <div className="p-2 text-sm text-muted-foreground">No slots available</div>
              ) : (
                availableSlots.map((slot) => (
                  <SelectItem key={slot.id} value={slot.id}>
                    {slot.label}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleAssign} disabled={loading || !selectedSlot}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm Assignment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
