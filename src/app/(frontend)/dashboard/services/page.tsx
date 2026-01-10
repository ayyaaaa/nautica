import { getServiceRequests } from './actions'
import { ServiceActions } from './service-button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Wrench, MapPin, Calendar, Phone } from 'lucide-react'
import { LiveRefresher } from '@/components/live-refresher'
import { format } from 'date-fns'

export default async function ServiceManagementPage() {
  const requests = await getServiceRequests()

  return (
    <div className="space-y-6">
      <LiveRefresher />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Service Operations</h1>
          <p className="text-muted-foreground">Manage incoming requests and active jobs.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Request Queue</CardTitle>
          <CardDescription>Requests requiring approval or action.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Vessel</TableHead>
                <TableHead>Location & Time</TableHead>
                <TableHead>Qty / Notes</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((req: any) => {
                // --- FIX 1: Safely Extract Service Name ---
                // If it's an object, use .name. If it's missing, show 'Unknown'.
                const serviceName =
                  typeof req.serviceType === 'object' ? req.serviceType.name : 'Unknown Service'

                // --- FIX 2: Safely Extract Unit ---
                const serviceUnit =
                  typeof req.serviceType === 'object' ? req.serviceType.unit : 'Units'

                // --- FIX 3: Safely Extract Vessel Name ---
                const vesselName =
                  typeof req.vessel === 'object' ? req.vessel.name : 'Unknown Vessel'

                const vesselReg =
                  typeof req.vessel === 'object' ? req.vessel.registrationNumber : '---'

                return (
                  <TableRow key={req.id}>
                    {/* Service Column */}
                    <TableCell className="font-medium capitalize">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-muted rounded-md">
                          <Wrench className="h-4 w-4" />
                        </div>
                        {/* We render the string variable, NOT the object */}
                        {serviceName}
                      </div>
                    </TableCell>

                    {/* Vessel Column */}
                    <TableCell>
                      <div>
                        <p className="font-medium">{vesselName}</p>
                        <p className="text-xs text-muted-foreground">{vesselReg}</p>
                      </div>
                    </TableCell>

                    {/* Logistics Column */}
                    <TableCell>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-1.5" title="Service Location">
                          <MapPin className="w-3.5 h-3.5 text-blue-500" />
                          <span className="font-medium">{req.serviceLocation || 'Unassigned'}</span>
                        </div>
                        {req.preferredTime && (
                          <div
                            className="flex items-center gap-1.5 text-muted-foreground"
                            title="Preferred Time"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                            <span className="text-xs">
                              {format(new Date(req.preferredTime), 'MMM d, HH:mm')}
                            </span>
                          </div>
                        )}
                        {req.contactNumber && (
                          <div
                            className="flex items-center gap-1.5 text-muted-foreground"
                            title="Contact Number"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span className="text-xs">{req.contactNumber}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>

                    {/* Quantity & Notes */}
                    <TableCell>
                      <div className="text-sm">
                        <p className="font-medium">
                          {req.quantity}{' '}
                          <span className="text-xs text-muted-foreground">{serviceUnit}</span>
                        </p>
                        {req.notes && (
                          <p
                            className="text-xs text-muted-foreground italic truncate max-w-[150px]"
                            title={req.notes}
                          >
                            {req.notes}
                          </p>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <StatusBadge status={req.status} />
                    </TableCell>

                    <TableCell className="font-mono text-sm">
                      MVR {req.totalCost?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </TableCell>

                    <TableCell className="text-right">
                      <ServiceActions id={req.id} status={req.status} />
                    </TableCell>
                  </TableRow>
                )
              })}

              {requests.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                    No active requests found.
                  </TableCell>
                </TableRow>
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
    requested: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100',
    payment_pending: 'bg-blue-100 text-blue-700 animate-pulse hover:bg-blue-100',
    in_progress: 'bg-purple-100 text-purple-700 hover:bg-purple-100',
    completed: 'bg-green-100 text-green-700 hover:bg-green-100',
    cancelled: 'bg-red-100 text-red-700 hover:bg-red-100',
  }
  return (
    <Badge
      className={`capitalize border-none shadow-none whitespace-nowrap ${styles[status] || 'bg-gray-100 text-gray-700'}`}
    >
      {status.replace(/_/g, ' ')}
    </Badge>
  )
}
