import { getRunningBills } from './actions'
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
import { Clock, Anchor, Wrench } from 'lucide-react'

export async function RunningBillsWidget() {
  const bills = await getRunningBills()

  const totalValue = bills.reduce((acc, curr) => acc + curr.totalPending, 0)

  return (
    <Card className="col-span-1 lg:col-span-2 border-orange-200 shadow-sm">
      <CardHeader className="bg-orange-50/30 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl text-orange-950">Running Tabs (Held Bills)</CardTitle>
            <CardDescription>Live cost accumulation for active temporary vessels.</CardDescription>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
              Total Pending Value
            </p>
            <p className="text-2xl font-bold text-orange-600">MVR {totalValue.toLocaleString()}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-6">Vessel</TableHead>
              <TableHead>Arrival</TableHead>
              <TableHead>Berthing</TableHead>
              <TableHead>Services</TableHead>
              <TableHead className="text-right pr-6">Current Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bills.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                  No active temporary vessels.
                </TableCell>
              </TableRow>
            ) : (
              bills.map((bill) => (
                <TableRow key={bill.id}>
                  <TableCell className="pl-6 font-medium">
                    <div className="flex flex-col">
                      <span>{bill.name}</span>
                      <span className="text-xs text-muted-foreground">{bill.regNo}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="w-3 h-3 mr-1" />
                      {new Date(bill.arrivalTime).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-normal">
                        MVR {bill.berthingCost.toLocaleString()}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground uppercase">
                        {bill.type}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Wrench className="w-3 h-3 text-muted-foreground" />
                      <span>MVR {bill.servicesCost.toLocaleString()}</span>
                      {bill.serviceCount > 0 && (
                        <span className="text-xs text-muted-foreground">({bill.serviceCount})</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right pr-6 font-bold text-orange-700">
                    MVR {bill.totalPending.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
