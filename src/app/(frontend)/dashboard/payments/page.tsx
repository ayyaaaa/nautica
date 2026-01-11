import { getPendingPayments, getAllTransactions } from './actions'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Banknote, Ship, Wrench, History, Clock, CreditCard } from 'lucide-react'
import { LiveRefresher } from '@/components/live-refresher'

export const dynamic = 'force-dynamic'

export default async function PaymentsPage() {
  const pending = await getPendingPayments()
  const history = await getAllTransactions()

  const totalPending = pending.reduce((sum, item) => sum + item.amount, 0)

  return (
    <div className="container py-10 mx-auto space-y-8">
      <LiveRefresher />
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financial Overview</h1>
          <p className="text-muted-foreground">Manage invoices and view transaction history.</p>
        </div>
        <div className="text-right bg-red-50 px-4 py-2 rounded-lg border border-red-100">
          <p className="text-xs text-red-600 uppercase font-semibold">Total Outstanding</p>
          <p className="text-2xl font-bold text-red-700">MVR {totalPending.toLocaleString()}</p>
        </div>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full max-w-[400px] grid-cols-2">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="w-4 h-4" /> Pending ({pending.length})
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="w-4 h-4" /> Payment Log
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: PENDING PAYMENTS */}
        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Invoices</CardTitle>
              <CardDescription>Requests awaiting payment.</CardDescription>
            </CardHeader>
            <CardContent>
              <InvoiceTable data={pending} showAction={true} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: HISTORY LOG */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>Recent payments and settled bills.</CardDescription>
            </CardHeader>
            <CardContent>
              <InvoiceTable data={history} showAction={false} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Reusable Table Component
function InvoiceTable({ data, showAction }: { data: any[]; showAction: boolean }) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Reference</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Date & Time</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            {showAction && <TableHead className="text-right">Action</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                No records found.
              </TableCell>
            </TableRow>
          ) : (
            data.map((inv) => (
              <TableRow key={`${inv.type}-${inv.id}`}>
                {/* 1. Reference & Invoice ID */}
                <TableCell className="font-medium">
                  <div className="flex flex-col">
                    <span>{inv.reference}</span>
                    {inv.transactionId && (
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {inv.transactionId}
                      </span>
                    )}
                  </div>
                </TableCell>

                {/* 2. Type Badge */}
                <TableCell>
                  <div className="flex items-center gap-2">
                    {inv.type === 'vessel' ? (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        <Ship className="w-3 h-3 mr-1" /> Vessel
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="bg-orange-50 text-orange-700 border-orange-200"
                      >
                        <Wrench className="w-3 h-3 mr-1" /> Service
                      </Badge>
                    )}
                  </div>
                </TableCell>

                {/* 3. Description */}
                <TableCell>{inv.description}</TableCell>

                {/* 4. Date & Time */}
                <TableCell className="text-sm">
                  <div className="flex flex-col">
                    <span className="font-medium">{new Date(inv.date).toLocaleDateString()}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(inv.date).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </TableCell>

                {/* 5. Payment Method */}
                <TableCell>
                  {inv.method === 'transfer' ? (
                    <Badge variant="secondary" className="gap-1 font-normal">
                      <CreditCard className="w-3 h-3" /> Transfer
                    </Badge>
                  ) : inv.method === 'cash' ? (
                    <Badge
                      variant="outline"
                      className="gap-1 border-green-200 text-green-700 bg-green-50 font-normal"
                    >
                      <Banknote className="w-3 h-3" /> Cash
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground text-xs">-</span>
                  )}
                </TableCell>

                {/* 6. Status */}
                <TableCell>
                  <Badge
                    variant={inv.status === 'paid' ? 'default' : 'destructive'}
                    className="capitalize shadow-none"
                  >
                    {inv.status}
                  </Badge>
                </TableCell>

                {/* 7. Amount */}
                <TableCell className="font-bold font-mono text-right">
                  MVR {inv.amount.toLocaleString()}
                </TableCell>

                {/* 8. Action (Only for Pending) */}
                {showAction && (
                  <TableCell className="text-right">
                    <MarkPaidButton id={inv.id} type={inv.type} amount={inv.amount} />
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
