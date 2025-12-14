'use client'

import { useState, useEffect } from 'react'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { createManualVessel, getOwners } from './actions'

export function CreateVesselDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  // FIX 1: Update type to expect 'number' for ID
  const [owners, setOwners] = useState<{ id: number; label: string }[]>([])

  useEffect(() => {
    // This will now match the type returned by getOwners
    getOwners().then(setOwners)
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)

    const res = await createManualVessel(formData)

    if (res.success) {
      toast.success('Vessel Registered', {
        description: 'Sent to Approvals for Billing.',
      })
      setOpen(false)
    } else {
      toast.error('Registration Failed', {
        description: res.error,
      })
    }
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Register Manual Vessel
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Register New Vessel</DialogTitle>
          <DialogDescription>Assign a vessel to an owner manually.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="owner" className="text-right font-bold text-primary">
              Assign To
            </Label>
            <div className="col-span-3">
              <Select name="ownerId" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select Owner..." />
                </SelectTrigger>
                <SelectContent>
                  {owners.map((owner) => (
                    // FIX 2: Convert number to string for the Select value
                    <SelectItem key={owner.id} value={owner.id.toString()}>
                      {owner.label}
                    </SelectItem>
                  ))}
                  {owners.length === 0 && (
                    <SelectItem value="none" disabled>
                      No users found
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="border-t my-2"></div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input id="name" name="name" placeholder="Ocean King" className="col-span-3" required />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="regNo" className="text-right">
              Reg No.
            </Label>
            <Input
              id="regNo"
              name="registrationNumber"
              placeholder="P-12345"
              className="col-span-3"
              required
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">
              Type
            </Label>
            <div className="col-span-3">
              <Select name="vesselType" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dhoani">Dhoani</SelectItem>
                  <SelectItem value="launch">Launch</SelectItem>
                  <SelectItem value="yacht">Yacht</SelectItem>
                  <SelectItem value="barge">Barge</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="regType" className="text-right">
              Plan
            </Label>
            <div className="col-span-3">
              <Select name="registrationType" required defaultValue="temporary">
                <SelectTrigger>
                  <SelectValue placeholder="Select plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="permanent">Permanent (Monthly)</SelectItem>
                  <SelectItem value="temporary">Day-to-Day</SelectItem>
                  <SelectItem value="hourly">Short Visit (Hourly)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create & Send to Approval
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
