import { getMyServices, submitServiceRequest } from '../actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import { redirect } from 'next/navigation'

export default async function NewServicePage() {
  const { vessels } = await getMyServices()

  if (vessels.length === 0) {
    return (
      <div className="p-10 text-center">
        <h2 className="text-xl font-bold">No Vessels Found</h2>
        <p className="text-muted-foreground">
          You need to register a vessel before requesting services.
        </p>
      </div>
    )
  }

  async function submitAction(formData: FormData) {
    'use server'
    const res = await submitServiceRequest(formData)
    if (res.success) {
      redirect('/portal/services')
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>New Service Request</CardTitle>
          <CardDescription>Submit a request for harbor services.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={submitAction} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="vessel">Select Vessel</Label>
              <Select name="vesselId" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a vessel" />
                </SelectTrigger>
                <SelectContent>
                  {vessels.map((v: any) => (
                    <SelectItem key={v.id} value={v.id.toString()}>
                      {v.name} ({v.registrationNumber})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Service Type</Label>
                <Select name="serviceType" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="water">Water Supply</SelectItem>
                    <SelectItem value="fuel">Fuel Supply</SelectItem>
                    <SelectItem value="cleaning">Cleaning</SelectItem>
                    <SelectItem value="waste">Waste Disposal</SelectItem>
                    <SelectItem value="electric">Electricity</SelectItem>
                    <SelectItem value="loading">Loading / Unloading</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity (Units/Hours)</Label>
                <Input type="number" name="quantity" min="1" defaultValue="1" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes / Instructions</Label>
              <Textarea
                name="notes"
                placeholder="Specific time preference or location details..."
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" asChild>
                <a href="/portal/services">Cancel</a>
              </Button>
              <Button type="submit">Submit Request</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
