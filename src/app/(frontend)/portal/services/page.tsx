import { getMyServices } from './actions'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Plus, CreditCard, Clock, CheckCircle2, Wrench } from 'lucide-react'
import Link from 'next/link'
import { LiveRefresher } from '@/components/live-refresher'

export default async function PortalServicesPage() {
  const { services } = await getMyServices()

  return (
    <div className="space-y-6">
      <LiveRefresher />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Service Requests</h1>
          <p className="text-muted-foreground">Request fuel, water, and other harbor services.</p>
        </div>
        <Button asChild>
          <Link href="/portal/services/new">
            <Plus className="mr-2 h-4 w-4" /> New Request
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>History</CardTitle>
          <CardDescription>Track the status of your service jobs.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Vessel</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Est. Cost</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No service requests found.
                  </TableCell>
                </TableRow>
              ) : (
                services.map((s: any) => {
                  // --- FIX STARTS HERE ---
                  // Extract the name safely. If it's an object, get .name. If it's a string, use it.
                  const serviceName =
                    typeof s.serviceType === 'object' ? s.serviceType.name : s.serviceType
                  // --- FIX ENDS HERE ---

                  return (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium capitalize">
                        <div className="flex items-center gap-2">
                          <Wrench className="h-4 w-4 text-muted-foreground" />

                          {/* USE THE VARIABLE HERE */}
                          {serviceName}
                        </div>
                        <span className="text-xs text-muted-foreground ml-6 block mt-1">
                          {new Date(s.requestDate).toLocaleDateString()}
                        </span>
                      </TableCell>

                      {/* Safe check for vessel name as well */}
                      <TableCell>
                        {typeof s.vessel === 'object' ? s.vessel.name : s.vessel || 'Unknown'}
                      </TableCell>

                      <TableCell>
                        <StatusBadge status={s.status} />
                      </TableCell>
                      <TableCell>MVR {s.totalCost?.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        {s.status === 'payment_pending' && (
                          <Button
                            size="sm"
                            variant="default"
                            className="bg-blue-600 hover:bg-blue-700"
                            asChild
                          >
                            <Link href={`/portal/services/pay-service/${s.id}`}>
                              <CreditCard className="mr-2 h-3 w-3" /> Pay Now
                            </Link>
                          </Button>
                        )}
                        {s.status === 'in_progress' && (
                          <span className="text-xs text-blue-600 font-medium flex items-center justify-end">
                            <Clock className="w-3 h-3 mr-1 animate-pulse" /> In Progress
                          </span>
                        )}
                        {s.status === 'completed' && (
                          <span className="text-xs text-green-600 font-medium flex items-center justify-end">
                            <CheckCircle2 className="w-3 h-3 mr-1" /> Done
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    requested: 'bg-yellow-100 text-yellow-700',
    payment_pending: 'bg-blue-100 text-blue-700 border-blue-200 animate-pulse',
    in_progress: 'bg-purple-100 text-purple-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  }
  return (
    <Badge className={`capitalize shadow-none border-0 ${styles[status]}`}>
      {status.replace('_', ' ')}
    </Badge>
  )
}
