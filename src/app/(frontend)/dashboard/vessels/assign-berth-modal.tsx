'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { assignBerth } from './actions'
import { Loader2, Anchor, CheckCircle2 } from 'lucide-react'
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
        <Button
          size="sm"
          variant="outline"
          className="h-8 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 transition-colors"
        >
          <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
          Approve & Dock
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-2 text-emerald-600 mb-2">
            <div className="p-2 bg-emerald-100 rounded-full">
              <Anchor className="h-5 w-5" />
            </div>
            <DialogTitle>Assign Berth</DialogTitle>
          </div>
          <DialogDescription>
            Approve <span className="font-semibold text-foreground">{vesselName}</span> for entry.
            Select an available berthing slot to start the billing clock.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-3">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Select Available Slot
          </label>
          <Select onValueChange={setSelectedSlot}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose a slot..." />
            </SelectTrigger>
            <SelectContent>
              {availableSlots.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
                  <div className="p-2 bg-muted rounded-full">
                    <Anchor className="w-4 h-4 opacity-50" />
                  </div>
                  No slots available.
                </div>
              ) : (
                availableSlots.map((slot) => (
                  <SelectItem key={slot.id} value={slot.id}>
                    {slot.label}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>

          {selectedSlot && (
            <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded flex items-center gap-2">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              Slot selected. Vessel status will change to Active.
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            disabled={loading || !selectedSlot}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm Assignment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
