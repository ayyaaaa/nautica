'use client'

import { useState, useMemo } from 'react'
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
import { Separator } from '@/components/ui/separator'
import { DateTimePicker } from '@/components/ui/date-time-picker'

import { submitServiceRequest } from '../actions'

// Note: GST_RATE constant is removed because we get it via props now

interface ServiceRequestFormProps {
  vessels: any[]
  serviceTypes: any[]
  gstRate: number // <--- New Prop (e.g., 0.06)
}

export function ServiceRequestForm({ vessels, serviceTypes, gstRate }: ServiceRequestFormProps) {
  const [selectedVesselId, setSelectedVesselId] = useState<string>('')
  const [selectedServiceId, setSelectedServiceId] = useState<string>('')
  const [calcMode, setCalcMode] = useState<'quantity' | 'budget'>('quantity')

  const [inputValue, setInputValue] = useState<string>('')

  const [date, setDate] = useState<Date | undefined>(undefined)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const selectedService = serviceTypes.find((s) => s.id.toString() === selectedServiceId)
  const selectedVessel = vessels.find((v) => v.id.toString() === selectedVesselId)

  const currentSlotName = selectedVessel?.currentBerth
    ? typeof selectedVessel.currentBerth === 'object'
      ? selectedVessel.currentBerth.name
      : 'Unknown Slot'
    : 'Unassigned / At Sea'

  // --- LIVE COST CALCULATION ---
  const costDetails = useMemo(() => {
    if (!selectedService || !inputValue) return null

    const rate = selectedService.rate || 0
    const val = parseFloat(inputValue)

    if (isNaN(val) || val <= 0) return null

    let quantity = 0
    let subtotal = 0

    if (calcMode === 'quantity') {
      quantity = val
      subtotal = quantity * rate
    } else {
      // Budget Mode
      const totalInclusive = val
      subtotal = totalInclusive / (1 + gstRate) // <--- Use Dynamic Rate
      quantity = subtotal / rate
    }

    const gstAmount = subtotal * gstRate // <--- Use Dynamic Rate
    const total = subtotal + gstAmount

    return {
      quantity,
      subtotal,
      gstAmount,
      total,
    }
  }, [selectedService, inputValue, calcMode, gstRate]) // Add gstRate dependency

  async function handleSubmit(formData: FormData) {
    if (!date) {
      toast.error('Time Required', { description: 'Please select a preferred service time.' })
      return
    }

    setIsSubmitting(true)
    const res = await submitServiceRequest(formData)

    if (res.success) {
      toast.success('Request Submitted')
      router.push('/portal/services')
    } else {
      toast.error('Error', { description: res.error })
      setIsSubmitting(false)
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      {/* VESSEL & LOCATION */}
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
            <input type="hidden" name="serviceLocation" value={currentSlotName} />
          </div>
        )}
      </div>

      {/* TIME PREFERENCE */}
      <div className="space-y-2">
        <Label>Preferred Time</Label>
        <DateTimePicker date={date} setDate={setDate} />
        <input type="hidden" name="preferredTime" value={date ? date.toISOString() : ''} />
        <p className="text-[11px] text-muted-foreground">
          Services are typically provided within 2 hours of the requested time.
        </p>
      </div>

      {/* SERVICE TYPE */}
      <div className="space-y-2">
        <Label htmlFor="type">Service Type</Label>
        <Select name="serviceType" required onValueChange={(val) => setSelectedServiceId(val)}>
          <SelectTrigger>
            <SelectValue placeholder="Select service..." />
          </SelectTrigger>
          <SelectContent>
            {serviceTypes.map((s) => (
              <SelectItem key={s.id} value={s.id.toString()}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* CONTACT NUMBER */}
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
      </div>

      {/* CALCULATOR */}
      {selectedService && (
        <Card className="bg-muted/30 border-dashed animate-in fade-in zoom-in-95">
          <CardContent className="pt-6 space-y-5">
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium">Current Rate:</span>
              <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-bold">
                {selectedService.rate} MVR / {selectedService.unit}
              </span>
            </div>

            <div className="space-y-3">
              <Label className="text-xs uppercase text-muted-foreground font-semibold">
                Order By
              </Label>
              <RadioGroup
                name="calculationMode"
                defaultValue="quantity"
                onValueChange={(v) => {
                  setCalcMode(v as any)
                  setInputValue('')
                }}
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
                required
                placeholder={calcMode === 'quantity' ? 'e.g., 10' : 'e.g., 500'}
                className="text-lg"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
            </div>

            {/* LIVE SUMMARY */}
            {costDetails && (
              <div className="rounded-lg bg-background border p-4 space-y-2 text-sm animate-in slide-in-from-top-2 shadow-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>
                    Subtotal ({costDetails.quantity.toFixed(1)} {selectedService.unit}s)
                  </span>
                  <span>
                    {costDetails.subtotal.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{' '}
                    MVR
                  </span>
                </div>

                <div className="flex justify-between text-muted-foreground">
                  {/* Dynamic Percentage Label */}
                  <span>GST ({(gstRate * 100).toFixed(0)}%)</span>
                  <span>
                    {costDetails.gstAmount.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{' '}
                    MVR
                  </span>
                </div>

                <Separator className="my-2" />

                <div className="flex justify-between items-center">
                  <span className="font-bold text-base">Total Payable</span>
                  <span className="text-primary font-bold text-lg">
                    {costDetails.total.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{' '}
                    MVR
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* NOTES */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notes / Instructions</Label>
        <Textarea
          name="notes"
          placeholder="Specific hose connection type, access details, etc..."
          className="resize-none h-24"
        />
      </div>

      {/* FOOTER */}
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
