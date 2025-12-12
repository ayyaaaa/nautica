'use client'

import { useState } from 'react'
import { useForm, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, ArrowRight, ArrowLeft, CheckCircle2, UploadCloud } from 'lucide-react'
import { toast } from 'sonner'

// UI Components
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
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
import { Checkbox } from '@/components/ui/checkbox'

// Custom Components
import { ModeToggle } from '@/components/mode-toggle'

// Backend Action & Validation
import { submitRegistration } from './actions'
import { registrationSchema, RegistrationFormValues } from '@/lib/validations/registration'

export default function RegistrationPage() {
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialize Form
  const form = useForm<RegistrationFormValues>({
    // FIX: Cast resolver to 'any' to avoid strict type version mismatches
    resolver: zodResolver(registrationSchema) as any,
    mode: 'onChange',
    defaultValues: {
      registrationType: 'temporary',
      isOwner: true,
      isBusiness: false,
      operatorName: '',
      operatorId: '',
      operatorPhone: '',
      operatorEmail: '',
      operatorAddress: { island: '', houseName: '', street: '' },
      vesselName: '',
      vesselRegNo: '',
    },
  })

  // Watchers
  const regType = form.watch('registrationType')
  const isBusiness = form.watch('isBusiness')
  const isOwner = form.watch('isOwner')
  const formValues = form.getValues()

  // Navigation Logic
  const nextStep = async () => {
    let valid = false

    if (step === 1) {
      // Validate Step 1 fields
      const step1Fields = [
        'registrationType',
        'operatorName',
        'operatorId',
        'operatorPhone',
        'operatorEmail',
        'isBusiness',
        'isOwner',
        'operatorAddress.island',
        'operatorIdDoc',
        'operatorPhoto', // Validate files are selected
        ...(isBusiness ? ['businessName', 'businessRegNo'] : []),
        ...(!isOwner ? ['ownerName', 'ownerId', 'ownerPhone'] : []),
      ]
      valid = await form.trigger(step1Fields as any)
    } else if (step === 2) {
      // Validate Step 2 fields
      const step2Fields = [
        'vesselName',
        'vesselRegNo',
        'vesselType',
        'useType',
        ...(regType === 'permanent' ? ['length', 'width', 'fuelType', 'vesselRegDoc'] : []),
      ]
      valid = await form.trigger(step2Fields as any)
    }

    if (valid) {
      setStep(step + 1)
      window.scrollTo(0, 0)
    } else {
      toast.error('Please fill in all required fields.')
    }
  }

  const prevStep = () => setStep(step - 1)

  // Final Submit Handler
  const onSubmit: SubmitHandler<RegistrationFormValues> = async (data) => {
    setIsSubmitting(true)
    try {
      // Create FormData to send files + text
      const formData = new FormData()

      // Append Files manually (Zod just stores the File object in state)
      if (data.operatorIdDoc) formData.append('operatorIdDoc', data.operatorIdDoc as any)
      if (data.operatorPhoto) formData.append('operatorPhoto', data.operatorPhoto as any)
      if (data.vesselRegDoc) formData.append('vesselRegDoc', data.vesselRegDoc as any)

      // Call Server Action
      const result = await submitRegistration(data, formData)

      if (result.success) {
        toast.success('Application Submitted Successfully!', {
          description: `Vessel ID: ${result.vesselId}. Your application is pending approval.`,
          duration: 10000, // Show for 10s
        })
        // Optional: Reset form or redirect
        // form.reset();
      } else {
        toast.error('Submission Failed', {
          description: result.error || 'An unknown error occurred on the server.',
        })
      }
    } catch (error) {
      toast.error('Network Error', {
        description: 'Please check your connection and try again.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container max-w-3xl py-10 mx-auto relative">
      {/* Dark Mode Toggle */}
      <div className="absolute right-4 top-4 md:right-0 md:top-3">
        <ModeToggle />
      </div>

      {/* Progress Bar */}
      <div className="mb-8 mt-12 md:mt-3">
        <div className="flex justify-between mb-2 text-sm font-medium">
          <span className={step >= 1 ? 'text-primary' : 'text-muted-foreground'}>1. Operator</span>
          <span className={step >= 2 ? 'text-primary' : 'text-muted-foreground'}>2. Vessel</span>
          <span className={step >= 3 ? 'text-primary' : 'text-muted-foreground'}>3. Review</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full transition-all duration-500 ease-in-out bg-primary"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </div>

      <Card className="border-t-4 border-t-primary shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">
            {step === 1 && 'Operator Information'}
            {step === 2 && 'Vessel Details'}
            {step === 3 && 'Review Application'}
          </CardTitle>
          <CardDescription>
            {step === 1 && 'Please provide your personal and contact details.'}
            {step === 2 && 'Enter the technical details of the vessel.'}
            {step === 3 && 'Please review your information before submitting.'}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* ================= STEP 1: OPERATOR ================= */}
              {step === 1 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-left-4">
                  {/* Reg Type */}
                  <FormField
                    control={form.control}
                    name="registrationType"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Registration Type</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="grid grid-cols-1 gap-4 md:grid-cols-2"
                          >
                            <div>
                              <RadioGroupItem
                                value="temporary"
                                id="temp"
                                className="sr-only peer"
                              />
                              <label
                                htmlFor="temp"
                                className="flex flex-col items-center justify-between p-4 border-2 rounded-md border-muted bg-popover hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
                              >
                                <span className="mb-1 text-lg font-semibold">Day-to-Day</span>
                                <span className="text-xs text-center text-muted-foreground">
                                  Short term visits
                                </span>
                              </label>
                            </div>
                            <div>
                              <RadioGroupItem
                                value="permanent"
                                id="perm"
                                className="sr-only peer"
                              />
                              <label
                                htmlFor="perm"
                                className="flex flex-col items-center justify-between p-4 border-2 rounded-md border-muted bg-popover hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
                              >
                                <span className="mb-1 text-lg font-semibold">Permanent Slot</span>
                                <span className="text-xs text-center text-muted-foreground">
                                  Monthly contract
                                </span>
                              </label>
                            </div>
                            {/* NEW: Hourly */}
                            <div>
                              <RadioGroupItem value="hourly" id="hourly" className="sr-only peer" />
                              <label
                                htmlFor="hourly"
                                className="flex flex-col items-center justify-between p-4 border-2 rounded-md border-muted bg-popover hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
                              >
                                <span className="mb-1 text-lg font-semibold">Short Visit</span>
                                <span className="text-xs text-center text-muted-foreground">
                                  Hourly Rate
                                </span>
                              </label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Separator />

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="operatorName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Full Name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="operatorId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ID Card / Passport No.</FormLabel>
                          <FormControl>
                            <Input placeholder="AXXXXXX" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="operatorPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="777XXXX" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="operatorEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="email@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="operatorAddress.island"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Island / Atoll</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. K. Maafushi" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* FILE UPLOADS: OPERATOR */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="operatorIdDoc"
                      render={({ field: { value, onChange, ...fieldProps } }) => (
                        <FormItem>
                          <FormLabel>Upload ID/Passport Copy</FormLabel>
                          <FormControl>
                            <div className="flex items-center gap-2">
                              <Input
                                {...fieldProps}
                                type="file"
                                accept="image/*,application/pdf"
                                className="cursor-pointer file:text-primary"
                                onChange={(event) => {
                                  onChange(event.target.files && event.target.files[0])
                                }}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="operatorPhoto"
                      render={({ field: { value, onChange, ...fieldProps } }) => (
                        <FormItem>
                          <FormLabel>Upload Passport Size Photo</FormLabel>
                          <FormControl>
                            <Input
                              {...fieldProps}
                              type="file"
                              accept="image/*"
                              className="cursor-pointer file:text-primary"
                              onChange={(event) => {
                                onChange(event.target.files && event.target.files[0])
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Business & Owner Toggles */}
                  <div className="p-4 space-y-4 rounded-lg bg-secondary/20">
                    <FormField
                      control={form.control}
                      name="isBusiness"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>I represent a registered Business</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    {isBusiness && (
                      <div className="grid grid-cols-1 gap-4 pt-2 pl-7 animate-in slide-in-from-top-2">
                        <FormField
                          control={form.control}
                          name="businessName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Business Name</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="businessRegNo"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Registration No.</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                    <Separator />
                    <FormField
                      control={form.control}
                      name="isOwner"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>I am the owner of this vessel</FormLabel>
                            <FormDescription>
                              Uncheck if you are an operator hiring the vessel.
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    {!isOwner && (
                      <div className="grid grid-cols-1 gap-4 pt-2 pl-7 animate-in slide-in-from-top-2">
                        <FormField
                          control={form.control}
                          name="ownerName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Owner Name</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="ownerPhone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Owner Phone</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ================= STEP 2: VESSEL ================= */}
              {step === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                          <FormLabel>Registration Number</FormLabel>
                          <FormControl>
                            <Input placeholder="P1234A-01" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
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
                              {['DHOANI', 'LAUNCH', 'YACHT', 'DINGHY', 'BARGE', 'OTHER'].map(
                                (type) => (
                                  <SelectItem key={type} value={type}>
                                    {type}
                                  </SelectItem>
                                ),
                              )}
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
                              {['Passenger', 'Fishing', 'Cargo', 'Diving', 'Excursion'].map(
                                (type) => (
                                  <SelectItem key={type} value={type}>
                                    {type}
                                  </SelectItem>
                                ),
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* FILE UPLOAD: VESSEL REG */}
                  {regType === 'permanent' ? (
                    <FormField
                      control={form.control}
                      name="vesselRegDoc"
                      render={({ field: { value, onChange, ...fieldProps } }) => (
                        <FormItem>
                          <FormLabel className="text-primary font-medium">
                            Upload Vessel Registration Document *
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...fieldProps}
                              type="file"
                              accept="application/pdf,image/*"
                              className="cursor-pointer file:text-primary border-primary/40 bg-primary/5"
                              onChange={(event) => {
                                onChange(event.target.files && event.target.files[0])
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ) : null}

                  {regType === 'permanent' ? (
                    <div className="p-4 border border-primary/20 rounded-lg bg-primary/5 dark:bg-primary/10">
                      <h4 className="flex items-center gap-2 mb-4 text-sm font-semibold text-primary">
                        <CheckCircle2 className="w-4 h-4" /> Technical Specifications Required
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="length"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Length (m)</FormLabel>
                              <FormControl>
                                <Input type="number" {...field} />
                              </FormControl>
                              <FormMessage />
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
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="fuelType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Fuel Type</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Diesel">Diesel</SelectItem>
                                  <SelectItem value="Petrol">Petrol</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-lg bg-secondary/30">
                      <p className="text-sm text-muted-foreground">
                        For <strong>Day-to-Day</strong> registration, specs are optional.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* ================= STEP 3: REVIEW ================= */}
              {step === 3 && (
                <div className="space-y-6 animate-in fade-in zoom-in-95">
                  <div className="rounded-lg border p-4 space-y-4 bg-secondary/10">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground block">Operator</span>
                        <span className="font-medium">{formValues.operatorName}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block">Contact</span>
                        <span className="font-medium">{formValues.operatorPhone}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block">Vessel</span>
                        <span className="font-medium">{formValues.vesselName}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block">Type</span>
                        <span className="font-medium uppercase text-primary">
                          {formValues.registrationType}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900 p-4 rounded-md text-sm text-yellow-800 dark:text-yellow-200">
                    <p className="font-semibold mb-1">Declaration</p>
                    <p>
                      I confirm that all information provided is accurate and I am authorized to
                      register this vessel.
                    </p>
                  </div>
                </div>
              )}

              {/* Footer Buttons */}
              <div className="flex justify-between pt-6">
                {step > 1 ? (
                  <Button type="button" variant="outline" onClick={prevStep}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                  </Button>
                ) : (
                  <div></div>
                )}

                {step < 3 ? (
                  <Button type="button" onClick={nextStep}>
                    Next Step <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...
                      </>
                    ) : (
                      <>Confirm & Submit Application</>
                    )}
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
