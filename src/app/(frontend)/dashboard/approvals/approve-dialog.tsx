'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
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
import { Label } from '@/components/ui/label'
import { Loader2, CheckCircle2, Anchor } from 'lucide-react'
import { toast } from 'sonner'
import { approveVesselWithSlot, getAvailableSlots } from './actions'

export function ApproveDialog({
  vesselId,
  vesselName,
  regType,
}: {
  vesselId: number
  vesselName: string
  regType: string
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [slots, setSlots] = useState<{ id: string; label: string }[]>([])

  // Load compatible slots when opening
  const handleOpenChange = async (isOpen: boolean) => {
    setOpen(isOpen)
    if (isOpen) {
      const available = await getAvailableSlots(regType)
      setSlots(available as any)
    }
  }

  const handleApprove = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const slotId = formData.get('slotId') as string

    const res = await approveVesselWithSlot(vesselId.toString(), slotId, regType)

    if (res.success) {
      toast.success('Vessel Approved', { description: 'Berth assigned & billing started.' })
      setOpen(false)
    } else {
      toast.error('Error', { description: res.error })
    }
    setLoading(false)
  }

  const isPermanent = regType === 'permanent'

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
          <CheckCircle2 className="w-4 h-4 mr-1" /> Approve
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Anchor className="h-5 w-5 text-blue-600" />
            Approve {vesselName}
          </DialogTitle>
          <DialogDescription>
            Assign a {isPermanent ? 'Permanent (Block A)' : 'Temporary (T-Jetty)'} berth.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleApprove} className="space-y-4 py-4">
          <div className="p-3 bg-muted rounded-md text-sm border">
            <span className="font-semibold">Required Zone:</span>{' '}
            {isPermanent ? 'Block A (A-E)' : 'T-Jetty (Zone T)'}
          </div>

          <div className="space-y-2">
            <Label>Select Available Slot</Label>
            <Select name="slotId" required>
              <SelectTrigger>
                <SelectValue
                  placeholder={slots.length > 0 ? 'Select slot...' : 'Loading slots...'}
                />
              </SelectTrigger>
              <SelectContent>
                {slots.map((s) => (
                  <SelectItem key={s.id} value={s.id.toString()}>
                    {s.label}
                  </SelectItem>
                ))}
                {slots.length === 0 && (
                  <SelectItem value="none" disabled>
                    No slots available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={loading || slots.length === 0}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm Assignment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
