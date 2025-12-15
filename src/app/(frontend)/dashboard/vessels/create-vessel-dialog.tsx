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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Loader2, Plus, Check, ChevronsUpDown, User } from 'lucide-react'
import { toast } from 'sonner'
import { createManualVessel, getOwners } from './actions'
import { cn } from '@/lib/utils'

export function CreateVesselDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  // Combobox State
  const [openCombobox, setOpenCombobox] = useState(false)
  const [owners, setOwners] = useState<{ id: number; label: string }[]>([])
  const [selectedOwnerId, setSelectedOwnerId] = useState<number | null>(null)

  useEffect(() => {
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
      // Reset form state
      setSelectedOwnerId(null)
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
      <DialogContent className="sm:max-w-[500px] overflow-visible">
        <DialogHeader>
          <DialogTitle>Register New Vessel</DialogTitle>
          <DialogDescription>Assign a vessel to an owner manually.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          {/* --- SEARCHABLE OWNER SELECTION --- */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="owner" className="text-right font-bold text-primary">
              Assign To
            </Label>
            <div className="col-span-3">
              {/* HIDDEN INPUT: This passes the value to the Server Action via FormData */}
              <input type="hidden" name="ownerId" value={selectedOwnerId || ''} />

              <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openCombobox}
                    className="w-full justify-between"
                  >
                    {selectedOwnerId
                      ? owners.find((owner) => owner.id === selectedOwnerId)?.label
                      : 'Search name, email or ID card...'}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[350px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search owner..." />
                    <CommandList>
                      <CommandEmpty>No owner found.</CommandEmpty>
                      <CommandGroup>
                        {owners.map((owner) => (
                          <CommandItem
                            key={owner.id}
                            value={owner.label} // Search works on this value
                            onSelect={() => {
                              setSelectedOwnerId(owner.id)
                              setOpenCombobox(false)
                            }}
                          >
                            <Check
                              className={cn(
                                'mr-2 h-4 w-4',
                                selectedOwnerId === owner.id ? 'opacity-100' : 'opacity-0',
                              )}
                            />
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">
                                {owner.label.split('|')[0]}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {owner.label.split('|').slice(1).join(' ')}
                              </span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="border-t my-2"></div>

          {/* VESSEL DETAILS */}
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
            <Button type="submit" disabled={loading || !selectedOwnerId}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create & Send to Approval
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
