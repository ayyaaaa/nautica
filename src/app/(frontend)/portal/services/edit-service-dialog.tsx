'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Pencil, Loader2 } from 'lucide-react'
import { updateServiceRequest } from './actions'
import { toast } from 'sonner' // Assuming you have sonner/toast, otherwise remove

export function EditServiceDialog({ service }: { service: any }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState(service.calculationMode || 'quantity')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    // Add mode manually since radio buttons can be tricky in FormData sometimes
    formData.set('calculationMode', mode) 

    const result = await updateServiceRequest(service.id, formData)

    if (result.success) {
      toast.success('Request updated successfully')
      setOpen(false)
    } else {
      toast.error(result.error)
    }
    setLoading(false)
  }

  // Format date for datetime-local input (YYYY-MM-DDTHH:MM)
  const formattedDate = service.preferredTime 
    ? new Date(service.preferredTime).toISOString().slice(0, 16) 
    : ''

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Pencil className="h-4 w-4 text-muted-foreground hover:text-primary" />
          <span className="sr-only">Edit</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Service Request</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          
          {/* Calculation Mode */}
          <div className="grid gap-2">
            <Label>Calculation Mode</Label>
            <RadioGroup 
              name="calculationMode" 
              value={mode} 
              onValueChange={setMode}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="quantity" id="edit-qty" />
                <Label htmlFor="edit-qty">By Quantity</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="budget" id="edit-budget" />
                <Label htmlFor="edit-budget">By Budget</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Dynamic Input based on Mode */}
          {mode === 'quantity' ? (
            <div className="grid gap-2">
              <Label htmlFor="quantity">Quantity (e.g. Liters/Tons)</Label>
              <Input 
                id="quantity" 
                name="quantity" 
                type="number" 
                defaultValue={service.quantity} 
                required 
              />
            </div>
          ) : (
            <div className="grid gap-2">
              <Label htmlFor="totalCost">Budget Limit (MVR)</Label>
              <Input 
                id="totalCost" 
                name="totalCost" 
                type="number" 
                defaultValue={service.totalCost} 
                required 
              />
            </div>
          )}

          {/* Preferred Time */}
          <div className="grid gap-2">
            <Label htmlFor="preferredTime">Preferred Time</Label>
            <Input 
              id="preferredTime" 
              name="preferredTime" 
              type="datetime-local" 
              defaultValue={formattedDate}
              required 
            />
          </div>

          {/* Contact */}
          <div className="grid gap-2">
            <Label htmlFor="contactNumber">Contact Number</Label>
            <Input 
              id="contactNumber" 
              name="contactNumber" 
              defaultValue={service.contactNumber} 
              required 
            />
          </div>

          {/* Notes */}
          <div className="grid gap-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea 
              id="notes" 
              name="notes" 
              defaultValue={service.notes} 
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}