import { getMyServices } from './actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Wrench, Plus, CreditCard, CheckCircle2, Clock } from 'lucide-react'
import Link from 'next/link'

export default async function ServicesPage() {
  const { services, vessels } = await getMyServices()

  return (
    <div className="container max-w-4xl py-10 mx-auto px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Service Requests</h1>
          <p className="text-muted-foreground">Manage cleaning, fuel, and maintenance requests.</p>
        </div>
        {vessels.length > 0 && (
          <Button asChild>
            <Link href="/portal/services/new">
              <Plus className="mr-2 h-4 w-4" /> New Request
            </Link>
          </Button>
        )}
      </div>

      <div className="grid gap-4">
        {services.length === 0 ? (
          <div className="text-center py-12 border rounded-lg bg-muted/10">
            <Wrench className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-4" />
            <h3 className="text-lg font-medium">No services found</h3>
            <p className="text-muted-foreground mb-4">
              Request a service for your vessel to get started.
            </p>
            <Button asChild variant="outline">
              <Link href="/portal/services/new">Create Request</Link>
            </Button>
          </div>
        ) : (
          services.map((service: any) => (
            <Card key={service.id} className="overflow-hidden">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 gap-4">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mt-1">
                    <Wrench className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold capitalize">{service.serviceType}</h4>
                      <StatusBadge status={service.status} />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Vessel:{' '}
                      <span className="font-medium text-foreground">{service.vessel.name}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(service.requestDate).toLocaleDateString()} • {service.quantity}{' '}
                      Units
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className="text-right flex-1 sm:flex-none">
                    <p className="text-xs text-muted-foreground uppercase">Total Cost</p>
                    <p className="text-lg font-bold">MVR {service.totalCost?.toLocaleString()}</p>
                  </div>

                  {/* ACTION BUTTONS BASED ON STATUS */}
                  {service.status === 'payment_pending' ? (
                    <Button
                      className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white animate-pulse"
                      size="sm"
                      asChild
                    >
                      {/* Reuse the pay page but maybe add logic to handle 'service' type payments later */}
                      <Link href={`/portal/pay-service/${service.id}`}>
                        <CreditCard className="mr-2 h-4 w-4" /> Pay Now
                      </Link>
                    </Button>
                  ) : service.status === 'completed' ? (
                    <Button variant="outline" size="sm" disabled>
                      <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" /> Done
                    </Button>
                  ) : (
                    <Button variant="secondary" size="sm" disabled>
                      <Clock className="mr-2 h-4 w-4" /> Processing
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    requested: 'bg-yellow-100 text-yellow-700',
    payment_pending: 'bg-blue-100 text-blue-700 animate-pulse',
    in_progress: 'bg-purple-100 text-purple-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  }
  const label = status.replace('_', ' ')
  return (
    <Badge className={`capitalize border-none shadow-none ${styles[status] || 'bg-gray-100'}`}>
      {label}
    </Badge>
  )
}
