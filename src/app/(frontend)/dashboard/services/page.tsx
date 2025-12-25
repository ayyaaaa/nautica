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
import { Wrench } from 'lucide-react'
import { LiveRefresher } from '@/components/live-refresher'

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
                <TableHead>Service Type</TableHead>
                <TableHead>Vessel</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((req: any) => (
                <TableRow key={req.id}>
                  <TableCell className="font-medium capitalize flex items-center gap-2">
                    <div className="p-2 bg-muted rounded-md">
                      <Wrench className="h-4 w-4" />
                    </div>
                    {req.serviceType}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{req.vessel?.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {req.vessel?.registrationNumber}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>Qty: {req.quantity}</p>
                      {req.notes && (
                        <p className="text-xs text-muted-foreground italic truncate max-w-[150px]">
                          ${req.notes}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={req.status} />
                  </TableCell>
                  <TableCell className="font-mono">MVR {req.totalCost?.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <ServiceActions id={req.id} status={req.status} />
                  </TableCell>
                </TableRow>
              ))}
              {requests.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
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
    requested: 'bg-yellow-100 text-yellow-700',
    payment_pending: 'bg-blue-100 text-blue-700 animate-pulse',
    in_progress: 'bg-purple-100 text-purple-700',
    completed: 'bg-green-100 text-green-700',
  }
  return (
    <Badge className={`capitalize border-none shadow-none ${styles[status] || 'bg-gray-100'}`}>
      {status.replace('_', ' ')}
    </Badge>
  )
}
