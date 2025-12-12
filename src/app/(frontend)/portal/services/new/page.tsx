'use client'

import { useState, useEffect } from 'react'
import { getMyServices, submitServiceRequest } from '../actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewServiceRequest() {
  const [vessels, setVessels] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Load vessels so user can pick one
    getMyServices().then((res) => {
      setVessels(res.vessels)
      setLoading(false)
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    const formData = new FormData(e.currentTarget)

    const res = await submitServiceRequest(formData)
    if (res.success) {
      toast.success('Request Submitted', {
        description: 'We will notify you when the bill is ready.',
      })
      router.push('/portal/services')
    } else {
      toast.error('Error', { description: 'Could not submit request.' })
    }
    setSubmitting(false)
  }

  if (loading)
    return (
      <div className="flex justify-center p-10">
        <Loader2 className="animate-spin" />
      </div>
    )

  return (
    <div className="container max-w-lg py-10 mx-auto px-4">
      <Button variant="ghost" className="mb-4 pl-0" asChild>
        <Link href="/portal/services">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Services
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Request New Service</CardTitle>
          <CardDescription>Select a vessel and service type.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Select Vessel</Label>
              <Select name="vesselId" required>
                <SelectTrigger>
                  <SelectValue placeholder="Choose vessel..." />
                </SelectTrigger>
                <SelectContent>
                  {vessels.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.name} ({v.registrationNumber})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Service Type</Label>
              <Select name="serviceType" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select type..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cleaning">Cleaning</SelectItem>
                  <SelectItem value="water">Water Supply</SelectItem>
                  <SelectItem value="fuel">Fuel Supply</SelectItem>
                  <SelectItem value="waste">Waste Disposal</SelectItem>
                  <SelectItem value="electric">Electricity</SelectItem>
                  <SelectItem value="loading">Loading / Unloading</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Quantity (Hours / Liters / Tons)</Label>
              <Input type="number" name="quantity" min="1" defaultValue="1" required />
            </div>

            <div className="space-y-2">
              <Label>Notes / Special Instructions</Label>
              <Textarea name="notes" placeholder="E.g., Need it done before 5 PM..." />
            </div>

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Submit Request'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
