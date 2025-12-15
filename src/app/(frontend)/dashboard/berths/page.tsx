import { getBerthData } from './actions'
import { BerthGrid } from './berth-grid'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Anchor, CheckCircle2, XCircle, Clock } from 'lucide-react'

export default async function BerthsPage() {
  const { stats, zoneMap, contracts } = await getBerthData()

  return (
    <div className="container py-8 mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Harbor Map & Contracts</h1>
          <p className="text-muted-foreground">Manage physical slot inventory and occupancy.</p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard
          label="Total Slots"
          value={stats.total}
          icon={<Anchor className="text-slate-500" />}
        />
        <StatsCard
          label="Occupied"
          value={stats.occupied}
          icon={<XCircle className="text-red-500" />}
          color="text-red-600"
        />
        <StatsCard
          label="Available"
          value={stats.available}
          icon={<CheckCircle2 className="text-green-500" />}
          color="text-green-600"
        />
        <StatsCard
          label="Maintenance"
          value={stats.maintenance}
          icon={<Clock className="text-orange-500" />}
          color="text-orange-600"
        />
      </div>

      <Tabs defaultValue="map" className="w-full">
        <TabsList>
          <TabsTrigger value="map">Live Map</TabsTrigger>
          <TabsTrigger value="contracts">Contract History</TabsTrigger>
        </TabsList>

        {/* TAB 1: LIVE MAP (The Visual Grid) */}
        <TabsContent value="map" className="mt-6">
          <BerthGrid zoneMap={zoneMap} />
        </TabsContent>

        {/* TAB 2: CONTRACTS TABLE */}
        <TabsContent value="contracts" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Berthing Contracts</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Slot</TableHead>
                    <TableHead>Vessel</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Start Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Billing</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contracts.map((c: any) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">
                        {c.assignedSlot?.name || 'Unknown'}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{c.vessel?.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {c.vessel?.registrationNumber}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">{c.planType}</TableCell>
                      <TableCell>{new Date(c.startTime).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge
                          variant={c.status === 'active' ? 'default' : 'secondary'}
                          className={c.status === 'active' ? 'bg-green-600' : ''}
                        >
                          {c.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        MVR {(c.billing?.totalCalculated || 0).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function StatsCard({ label, value, icon, color }: any) {
  return (
    <Card>
      <CardContent className="p-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase">{label}</p>
          <p className={`text-2xl font-bold ${color || 'text-foreground'}`}>{value}</p>
        </div>
        <div className="p-2 bg-slate-50 rounded-full">{icon}</div>
      </CardContent>
    </Card>
  )
}
