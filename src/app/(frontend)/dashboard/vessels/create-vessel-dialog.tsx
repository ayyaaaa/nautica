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
import { Loader2, Plus, Check, ChevronsUpDown, User, Ship } from 'lucide-react'
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
    if (open) {
      getOwners().then(setOwners)
    }
  }, [open])

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
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm">
          <Plus className="mr-2 h-4 w-4" /> Register New Vessel
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px] overflow-visible">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary mb-1">
            <div className="p-2 bg-primary/10 rounded-full">
              <Ship className="h-5 w-5" />
            </div>
            <DialogTitle>Register New Vessel</DialogTitle>
          </div>
          <DialogDescription>
            Manually assign a vessel to an owner. This vessel will require approval before docking.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-5 py-4">
          {/* --- SECTION 1: OWNER ASSIGNMENT --- */}
          <div className="space-y-3 bg-muted/30 p-4 rounded-md border border-muted">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4 text-primary" />
              <Label htmlFor="owner" className="font-semibold text-foreground">
                Assign To Owner
              </Label>
            </div>

            {/* HIDDEN INPUT for Form Data */}
            <input type="hidden" name="ownerId" value={selectedOwnerId || ''} />

            <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openCombobox}
                  className={cn(
                    'w-full justify-between bg-background',
                    !selectedOwnerId && 'text-muted-foreground',
                  )}
                >
                  {selectedOwnerId
                    ? owners.find((owner) => owner.id === selectedOwnerId)?.label.split('|')[0]
                    : 'Search name, email or ID card...'}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search owner..." />
                  <CommandList>
                    <CommandEmpty>No owner found.</CommandEmpty>
                    <CommandGroup>
                      {owners.map((owner) => (
                        <CommandItem
                          key={owner.id}
                          value={owner.label}
                          onSelect={() => {
                            setSelectedOwnerId(owner.id)
                            setOpenCombobox(false)
                          }}
                        >
                          <Check
                            className={cn(
                              'mr-2 h-4 w-4 text-primary',
                              selectedOwnerId === owner.id ? 'opacity-100' : 'opacity-0',
                            )}
                          />
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{owner.label.split('|')[0]}</span>
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

          {/* --- SECTION 2: VESSEL DETAILS --- */}
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Vessel Name</Label>
                <Input id="name" name="name" placeholder="e.g. Ocean King" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="regNo">Reg No.</Label>
                <Input id="regNo" name="registrationNumber" placeholder="P-12345" required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Vessel Type</Label>
                <Select name="vesselType" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DHOANI">Dhoani</SelectItem>
                    <SelectItem value="LAUNCH">Launch</SelectItem>
                    <SelectItem value="YACHT">Yacht</SelectItem>
                    <SelectItem value="BARGE">Barge</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="regType">Registration Plan</Label>
                <Select name="registrationType" required defaultValue="temporary">
                  <SelectTrigger>
                    <SelectValue placeholder="Select plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="temporary">Day-to-Day (Visitor)</SelectItem>
                    <SelectItem value="permanent">Permanent (Monthly)</SelectItem>
                    <SelectItem value="hourly">Short Visit (Hourly)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" type="button" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !selectedOwnerId}
              className="bg-primary hover:bg-primary/90"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create & Send to Approval
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
