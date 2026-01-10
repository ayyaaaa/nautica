import { getMyServices, getServiceCatalog, getSiteSettings } from '../actions' // Ensure getSiteSettings is imported
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ServiceRequestForm } from './service-request-form'
import { Ship } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function NewServicePage() {
  // 1. Fetch Vessels, Services, AND Settings in parallel
  const [servicesData, serviceTypes, settings] = await Promise.all([
    getMyServices(),
    getServiceCatalog(),
    getSiteSettings(),
  ])

  const vessels = servicesData.vessels

  // 2. Extract & Normalize Tax Rate
  // Your DB field is 'taxPercentage' (e.g. 6). We need 0.06 for math.
  // We default to 6 if the field is empty.
  const rawTax = (settings as any).taxPercentage ?? 6
  const gstRate = rawTax / 100

  // --- No Vessels State ---
  if (!vessels || vessels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8 space-y-4">
        <div className="bg-muted p-4 rounded-full">
          <Ship className="w-10 h-10 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-bold">No Vessels Found</h2>
        <p className="text-muted-foreground max-w-sm">
          You need to register and have an active vessel approved before you can request services.
        </p>
        <Button asChild>
          <Link href="/portal">Register a Vessel</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto py-10">
      <Card className="shadow-lg border-t-4 border-t-primary">
        <CardHeader>
          <CardTitle>New Service Request</CardTitle>
          <CardDescription>Select a service from our catalog.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* 3. Pass the dynamic rate to the form */}
          <ServiceRequestForm vessels={vessels} serviceTypes={serviceTypes} gstRate={gstRate} />
        </CardContent>
      </Card>
    </div>
  )
}
