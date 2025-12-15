import { getPaymentsData } from './actions'
import { MarkPaidButton } from './payment-actions'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Banknote, Ship, Wrench } from 'lucide-react'

export default async function PaymentsPage() {
  const { invoices, totalPending } = await getPaymentsData()

  return (
    <div className="container py-10 mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financial Overview</h1>
          <p className="text-muted-foreground">Manage pending invoices and record payments.</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground uppercase font-semibold">Total Outstanding</p>
          <p className="text-3xl font-bold text-red-600">MVR {totalPending.toLocaleString()}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Invoices</CardTitle>
          <CardDescription>Requests awaiting payment confirmation.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reference</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                    No pending payments found. Good job!
                  </TableCell>
                </TableRow>
              ) : (
                invoices.map((inv) => (
                  <TableRow key={`${inv.type}-${inv.id}`}>
                    <TableCell className="font-medium">{inv.reference}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {inv.type === 'vessel' ? (
                          <Badge
                            variant="outline"
                            className="border-blue-200 text-blue-700 bg-blue-50"
                          >
                            <Ship className="w-3 h-3 mr-1" /> Vessel
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="border-orange-200 text-orange-700 bg-orange-50"
                          >
                            <Wrench className="w-3 h-3 mr-1" /> Service
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{inv.description}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(inv.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="font-bold font-mono">
                      MVR {inv.amount.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <MarkPaidButton id={inv.id} type={inv.type} amount={inv.amount} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
