import { getBerthData } from './actions'
import { BerthGrid } from './berth-grid'
import { BerthFilters } from './berth-filters'
import { ContractFilters } from './contract-filters' // Import the new component
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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
import { Anchor, CheckCircle2, XCircle, Clock, Map, FileText, Activity } from 'lucide-react'

export const dynamic = 'force-dynamic'

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function BerthsPage(props: PageProps) {
  const searchParams = await props.searchParams

  // Map Filters
  const mapSearch = typeof searchParams?.search === 'string' ? searchParams.search : undefined
  const mapStatus = typeof searchParams?.status === 'string' ? searchParams.status : undefined

  // Contract Filters
  const contractSearch =
    typeof searchParams?.cSearch === 'string' ? searchParams.cSearch : undefined
  const contractStatus =
    typeof searchParams?.cStatus === 'string' ? searchParams.cStatus : undefined

  // Pass all filters to the backend
  const { stats, zoneMap, tableContracts, mapContracts } = await getBerthData({
    search: mapSearch,
    status: mapStatus,
    contractSearch: contractSearch,
    contractStatus: contractStatus,
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Harbor Map & Contracts
          </h1>
          <p className="text-muted-foreground">Manage physical slot inventory and occupancy.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          label="Total Slots"
          value={stats.total}
          icon={<Anchor className="w-5 h-5 text-primary" />}
          className="border-l-4 border-l-primary"
        />
        <StatsCard
          label="Occupied"
          value={stats.occupied}
          icon={<XCircle className="w-5 h-5 text-red-500" />}
          color="text-red-600"
          className="border-l-4 border-l-red-500"
        />
        <StatsCard
          label="Available"
          value={stats.available}
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-500" />}
          color="text-emerald-600"
          className="border-l-4 border-l-emerald-500"
        />
        <StatsCard
          label="Maintenance"
          value={stats.maintenance}
          icon={<Clock className="w-5 h-5 text-orange-500" />}
          color="text-orange-600"
          className="border-l-4 border-l-orange-500"
        />
      </div>

      <Tabs defaultValue="map" className="w-full">
        <div className="flex items-center justify-between pb-4">
          <TabsList className="grid w-full max-w-[400px] grid-cols-2">
            <TabsTrigger
              value="map"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Map className="w-4 h-4 mr-2" /> Live Map
            </TabsTrigger>
            <TabsTrigger
              value="contracts"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <FileText className="w-4 h-4 mr-2" /> Contract History
            </TabsTrigger>
          </TabsList>
        </div>

        {/* TAB 1: LIVE MAP */}
        <TabsContent value="map" className="mt-0">
          <Card className="border shadow-sm">
            <CardHeader className="border-b bg-muted/10 pb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg">Real-Time Occupancy</CardTitle>
              </div>
              <CardDescription>Visual representation of all berthing zones.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {/* Map Filters */}
              <div className="p-6 pb-2">
                <BerthFilters />
              </div>
              <div className="px-6 pb-6">
                {/* We pass 'mapContracts' here so dots work regardless of table filters */}
                <BerthGrid zoneMap={zoneMap} contracts={mapContracts} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: CONTRACTS TABLE */}
        <TabsContent value="contracts" className="mt-0">
          <Card className="border shadow-sm">
            <CardHeader className="border-b bg-muted/10 pb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg">Recent Berthing Contracts</CardTitle>
              </div>
              <CardDescription>History of vessel stays and billing statuses.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {/* NEW Contract Filters */}
              <div className="p-6 pb-2 border-b bg-muted/5">
                <ContractFilters />
              </div>

              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead className="pl-6">Slot</TableHead>
                    <TableHead>Vessel</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Start Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right pr-6">Billing</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tableContracts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No contracts found matching your filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    tableContracts.map((c: any) => (
                      <TableRow key={c.id} className="hover:bg-muted/5">
                        <TableCell className="font-medium pl-6">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded border">
                              {c.assignedSlot?.name || '---'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium text-foreground">{c.vessel?.name}</span>
                            <span className="text-xs text-muted-foreground font-mono">
                              {c.vessel?.registrationNumber}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="capitalize font-normal text-muted-foreground"
                          >
                            {c.planType}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(c.startTime).toLocaleDateString()}
                          <span className="text-xs ml-1 opacity-70">
                            {new Date(c.startTime).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={c.status} />
                        </TableCell>
                        <TableCell className="text-right font-medium pr-6">
                          {c.billing?.totalCalculated ? (
                            `MVR ${c.billing.totalCalculated.toLocaleString()}`
                          ) : (
                            <span className="text-muted-foreground text-xs italic">
                              Calculating...
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function StatsCard({ label, value, icon, color, className }: any) {
  return (
    <Card className={`shadow-sm overflow-hidden ${className}`}>
      <CardContent className="p-5 flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            {label}
          </p>
          <p className={`text-2xl font-bold tracking-tight ${color || 'text-foreground'}`}>
            {value}
          </p>
        </div>
        <div className="p-3 bg-muted/30 rounded-full border border-muted-foreground/10 shadow-sm">
          {icon}
        </div>
      </CardContent>
    </Card>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    completed: 'bg-slate-100 text-slate-600 border-slate-200',
    cancelled: 'bg-red-50 text-red-600 border-red-100',
  }
  return (
    <Badge
      className={`capitalize shadow-none font-medium ${styles[status] || 'bg-gray-100 text-gray-600'}`}
    >
      {status}
    </Badge>
  )
}
