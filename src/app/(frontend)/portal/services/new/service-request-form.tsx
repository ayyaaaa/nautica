'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2, MapPin, Phone } from 'lucide-react'

// UI Components
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Card, CardContent } from '@/components/ui/card'
import { DateTimePicker } from '@/components/ui/date-time-picker' // Ensure you created this file

// Import Action
import { submitServiceRequest } from '../actions'

interface ServiceRequestFormProps {
  vessels: any[]
  serviceTypes: any[]
}

export function ServiceRequestForm({ vessels, serviceTypes }: ServiceRequestFormProps) {
  const [selectedVesselId, setSelectedVesselId] = useState<string>('')
  const [selectedServiceId, setSelectedServiceId] = useState<string>('')
  const [calcMode, setCalcMode] = useState<'quantity' | 'budget'>('quantity')
  const [date, setDate] = useState<Date | undefined>(undefined) // State for Custom Time Picker
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  // 1. Find full objects based on selection
  const selectedService = serviceTypes.find((s) => s.id === selectedServiceId)
  const selectedVessel = vessels.find((v) => v.id.toString() === selectedVesselId)

  // 2. Extract Slot Name Safely
  const currentSlotName = selectedVessel?.currentSlot
    ? typeof selectedVessel.currentSlot === 'object'
      ? selectedVessel.currentSlot.name
      : 'Unknown Slot'
    : 'Unassigned / At Sea'

  async function handleSubmit(formData: FormData) {
    if (!date) {
      toast.error('Time Required', { description: 'Please select a preferred service time.' })
      return
    }

    setIsSubmitting(true)
    const res = await submitServiceRequest(formData)

    if (res.success) {
      toast.success('Request Submitted', {
        description: 'The harbor team has been notified.',
      })
      router.push('/portal/services')
    } else {
      toast.error('Error', { description: res.error })
      setIsSubmitting(false)
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      {/* --- SECTION 1: VESSEL & LOCATION --- */}
      <div className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="vessel">Select Vessel</Label>
          <Select name="vesselId" required onValueChange={(val) => setSelectedVesselId(val)}>
            <SelectTrigger>
              <SelectValue placeholder="Select a vessel" />
            </SelectTrigger>
            <SelectContent>
              {vessels.map((v) => (
                <SelectItem key={v.id} value={v.id.toString()}>
                  {v.name} ({v.registrationNumber})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Auto-Location Display */}
        {selectedVessel && (
          <div className="flex items-center gap-3 p-3 text-sm rounded-md bg-blue-50/50 border border-blue-100 text-blue-900 animate-in fade-in slide-in-from-top-1">
            <div className="bg-blue-100 p-2 rounded-full">
              <MapPin className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <span className="block font-semibold text-xs uppercase tracking-wider text-blue-500">
                Service Location
              </span>
              <span className="font-medium">{currentSlotName}</span>
            </div>
            {/* Hidden Input to send to backend */}
            <input type="hidden" name="serviceLocation" value={currentSlotName} />
          </div>
        )}
      </div>

      {/* --- SECTION 2: TIME PREFERENCE (CUSTOM COMPONENT) --- */}
      <div className="space-y-2">
        <Label>Preferred Time</Label>

        {/* Custom Shadcn-style Picker */}
        <DateTimePicker date={date} setDate={setDate} />

        {/* HIDDEN INPUT: Bridges React State -> FormData */}
        <input type="hidden" name="preferredTime" value={date ? date.toISOString() : ''} />

        <p className="text-[11px] text-muted-foreground">
          Services are typically provided within 2 hours of the requested time.
        </p>
      </div>

      {/* --- SECTION 3: SERVICE TYPE --- */}
      <div className="space-y-2">
        <Label htmlFor="type">Service Type</Label>
        <Select name="serviceType" required onValueChange={(val) => setSelectedServiceId(val)}>
          <SelectTrigger>
            <SelectValue placeholder="Select service..." />
          </SelectTrigger>
          <SelectContent>
            {serviceTypes.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {/* NEW: Contact Number */}
      <div className="space-y-2">
        <Label htmlFor="contactNumber">Site Contact Number</Label>
        <div className="relative">
          <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            type="tel"
            name="contactNumber"
            placeholder="e.g. 7771234"
            required
            className="pl-10"
          />
        </div>
        <p className="text-[11px] text-muted-foreground">
          Number to call when the service team arrives.
        </p>
      </div>

      {/* --- SECTION 4: CALCULATOR --- */}
      {selectedService && (
        <Card className="bg-muted/30 border-dashed animate-in fade-in zoom-in-95">
          <CardContent className="pt-6 space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium">Current Rate:</span>
              <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-bold">
                {selectedService.rate} MVR / {selectedService.unit}
              </span>
            </div>

            {/* Mode Switcher */}
            <div className="space-y-3">
              <Label className="text-xs uppercase text-muted-foreground font-semibold">
                Order By
              </Label>
              <RadioGroup
                name="calculationMode"
                defaultValue="quantity"
                onValueChange={(v) => setCalcMode(v as any)}
                className="grid grid-cols-2 gap-4"
              >
                <div>
                  <RadioGroupItem value="quantity" id="mode-qty" className="sr-only peer" />
                  <Label
                    htmlFor="mode-qty"
                    className="flex flex-col items-center justify-between p-3 border-2 rounded-md border-muted bg-popover hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary cursor-pointer text-center h-full"
                  >
                    <span className="font-semibold">Quantity</span>
                    <span className="text-[10px] text-muted-foreground font-normal">
                      (e.g. 50 {selectedService.unit}s)
                    </span>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="budget" id="mode-budget" className="sr-only peer" />
                  <Label
                    htmlFor="mode-budget"
                    className="flex flex-col items-center justify-between p-3 border-2 rounded-md border-muted bg-popover hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary cursor-pointer text-center h-full"
                  >
                    <span className="font-semibold">Budget</span>
                    <span className="text-[10px] text-muted-foreground font-normal">
                      (e.g. 500 MVR)
                    </span>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Dynamic Input */}
            <div className="space-y-2">
              <Label htmlFor="amount">
                {calcMode === 'quantity'
                  ? `Enter Quantity (${selectedService.unit}s)`
                  : 'Enter Total Budget (MVR)'}
              </Label>
              <Input
                type="number"
                name={calcMode === 'quantity' ? 'quantity' : 'totalCost'}
                min="1"
                defaultValue=""
                required
                placeholder={calcMode === 'quantity' ? 'e.g., 10' : 'e.g., 500'}
                className="text-lg"
              />
              <p className="text-[11px] text-muted-foreground">
                {calcMode === 'quantity'
                  ? 'Total cost will be calculated automatically upon submission.'
                  : `You will get approx. ${(1 / selectedService.rate).toFixed(2)} ${selectedService.unit}s per MVR.`}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* --- SECTION 5: NOTES --- */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notes / Instructions</Label>
        <Textarea
          name="notes"
          placeholder="Specific hose connection type, access details, etc..."
          className="resize-none h-24"
        />
      </div>

      {/* --- FOOTER --- */}
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="ghost" asChild type="button">
          <a href="/portal/services">Cancel</a>
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Submit Request
        </Button>
      </div>
    </form>
  )
}
