'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { z } from 'zod'

// UI Components
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'

// Actions & Schema
import { submitNewVessel } from './actions'
import { registrationSchema } from '@/lib/validations/registration'

// Schema Subset
const vesselSchema = registrationSchema.pick({
  registrationType: true,
  vesselName: true,
  vesselRegNo: true,
  vesselType: true,
  useType: true,
  length: true,
  width: true,
  fuelType: true,
  vesselRegDoc: true,
})

type VesselFormValues = z.infer<typeof vesselSchema>

export function AddVesselDialog() {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const form = useForm<VesselFormValues>({
    resolver: zodResolver(vesselSchema) as any,
    defaultValues: {
      registrationType: 'temporary',
      vesselName: '',
      vesselRegNo: '',
    },
  })

  const regType = form.watch('registrationType')

  const onSubmit = async (data: VesselFormValues) => {
    setIsSubmitting(true)
    try {
      const formData = new FormData()
      if (data.vesselRegDoc) formData.append('vesselRegDoc', data.vesselRegDoc as any)

      const result = await submitNewVessel(data, formData)

      if (result.success) {
        toast.success('Vessel Added', {
          description: 'Your new vessel has been registered successfully.',
        })
        setOpen(false)
        form.reset()
        router.refresh()
      } else {
        toast.error('Failed', { description: result.error })
      }
    } catch (error) {
      toast.error('Error', { description: 'Something went wrong.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus className="mr-2 h-4 w-4" /> New Vessel
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Register New Vessel</DialogTitle>
          <DialogDescription>Add a new vessel to your existing fleet.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 py-4">
            {/* Registration Type */}
            <FormField
              control={form.control}
              name="registrationType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Registration Plan</FormLabel>
                  <FormControl>
                    {/* CHANGED: grid-cols-3 to fit Hourly */}
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-3 gap-4"
                    >
                      {/* 1. Day-to-Day */}
                      <div>
                        <RadioGroupItem
                          value="temporary"
                          id="temp-modal"
                          className="sr-only peer"
                        />
                        <label
                          htmlFor="temp-modal"
                          className="flex flex-col items-center justify-between p-3 border-2 rounded-md border-muted bg-popover hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary cursor-pointer h-full"
                        >
                          <span className="font-semibold text-sm">Day-to-Day</span>
                          <span className="text-[10px] text-muted-foreground">Normal Visit</span>
                        </label>
                      </div>

                      {/* 2. Hourly (The Missing One) */}
                      <div>
                        <RadioGroupItem value="hourly" id="hourly-modal" className="sr-only peer" />
                        <label
                          htmlFor="hourly-modal"
                          className="flex flex-col items-center justify-between p-3 border-2 rounded-md border-muted bg-popover hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary cursor-pointer h-full"
                        >
                          <span className="font-semibold text-sm">Hourly</span>
                          <span className="text-[10px] text-muted-foreground">Short Visit</span>
                        </label>
                      </div>

                      {/* 3. Permanent */}
                      <div>
                        <RadioGroupItem
                          value="permanent"
                          id="perm-modal"
                          className="sr-only peer"
                        />
                        <label
                          htmlFor="perm-modal"
                          className="flex flex-col items-center justify-between p-3 border-2 rounded-md border-muted bg-popover hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary cursor-pointer h-full"
                        >
                          <span className="font-semibold text-sm">Permanent</span>
                          <span className="text-[10px] text-muted-foreground">Monthly</span>
                        </label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="vesselName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vessel Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="vesselRegNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Registration No.</FormLabel>
                    <FormControl>
                      <Input placeholder="P1234A-01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Type Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="vesselType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vessel Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {['DHOANI', 'LAUNCH', 'YACHT', 'DINGHY', 'BARGE', 'OTHER'].map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="useType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Usage</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select usage" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {['Passenger', 'Fishing', 'Cargo', 'Diving', 'Excursion'].map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Specs (Permanent Only) */}
            {regType === 'permanent' && (
              <div className="space-y-4 pt-2">
                <Separator />
                <h4 className="text-xs font-semibold uppercase text-muted-foreground">
                  Technical Specs
                </h4>
                <FormField
                  control={form.control}
                  name="vesselRegDoc"
                  render={({ field: { value, onChange, ...fieldProps } }) => (
                    <FormItem>
                      <FormLabel>Upload Registration Document</FormLabel>
                      <FormControl>
                        <Input
                          {...fieldProps}
                          type="file"
                          accept="application/pdf,image/*"
                          onChange={(e) => onChange(e.target.files && e.target.files[0])}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="length"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Length (m)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="width"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Width (m)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="fuelType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fuel</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="-" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Diesel">Diesel</SelectItem>
                            <SelectItem value="Petrol">Petrol</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Vessel
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
