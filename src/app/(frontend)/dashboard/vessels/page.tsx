import { getPayload } from 'payload'
import configPromise from '@payload-config'

// 1. Actions & Data Fetching
import { getVessels, reAdmitVessel, getAvailableBerths } from './actions'

// 2. Components
import { VesselFilters } from './vessel-filters'
import { CreateVesselDialog } from './create-vessel-dialog'
import { DepartButton } from './depart-button'
import { AssignBerthModal } from './assign-berth-modal'
import { LiveRefresher } from '@/components/live-refresher' // <--- IMPORT THIS
// 3. UI Elements
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { MoreHorizontal, FileText, Download, RotateCw } from 'lucide-react'
import Link from 'next/link'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default async function VesselsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string; page?: string }>
}) {
  const params = await searchParams
  const page = Number(params.page) || 1
  const search = params.search || ''
  const status = params.status || 'all'

  // Fetch Data: Vessels list & Empty slots for the approval modal
  const { docs, totalPages, totalDocs } = await getVessels({ search, status, page })
  const availableSlots = await getAvailableBerths()

  return (
    <div className="space-y-6">
      <LiveRefresher intervalMs={5000} />
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Vessel Fleet</h1>
          <p className="text-muted-foreground">
            Manage approvals, departures, and active subscriptions.
          </p>
        </div>
        <CreateVesselDialog />
      </div>

      <Card className="border shadow-sm">
        {/* Simplified Header showing total count */}
        <CardHeader className="pb-2 border-b bg-muted/10">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">Fleet Database</CardTitle>
            <Badge variant="outline" className="bg-background font-mono">
              {totalDocs} Records
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          {/* TABS & SEARCH */}
          <VesselFilters />

          {/* TABLE */}
          <div className="rounded-md border mt-4 overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead>Vessel Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Registration</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {docs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <p className="text-lg font-medium">No vessels found</p>
                        <p className="text-sm">Try adjusting your status tab or search query.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  docs.map((vessel: any) => (
                    <TableRow key={vessel.id} className="hover:bg-muted/5 transition-colors">
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span className="text-base text-foreground">{vessel.name}</span>
                          <span className="text-xs text-muted-foreground font-mono">
                            {vessel.registrationNumber}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="capitalize">
                        <Badge variant="outline" className="font-normal">
                          {vessel.vesselType}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        {vessel.owner ? (
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">
                              {vessel.owner.fullName || vessel.owner.email}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {vessel.owner.phone}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs italic">Unassigned</span>
                        )}
                      </TableCell>

                      <TableCell>
                        <StatusBadge status={vessel.status} />
                      </TableCell>

                      <TableCell>
                        <span className="capitalize text-sm text-muted-foreground">
                          {vessel.registrationType}
                        </span>
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex justify-end items-center gap-2">
                          {/* 1. APPROVE & DOCK (Pending) */}
                          {vessel.status === 'pending' && (
                            <AssignBerthModal
                              vesselId={vessel.id}
                              vesselName={vessel.name}
                              availableSlots={availableSlots}
                            />
                          )}

                          {/* 2. DEPART (Active & Temporary) */}
                          {vessel.status === 'active' &&
                            vessel.registrationType !== 'permanent' && (
                              <DepartButton id={vessel.id} name={vessel.name} />
                            )}

                          {/* 3. RE-ADMIT (Departed) */}
                          {vessel.status === 'departed' && (
                            <form action={reAdmitVessel.bind(null, vessel.id)}>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 border-dashed text-muted-foreground hover:text-primary hover:border-primary"
                              >
                                <RotateCw className="mr-1 h-3 w-3" /> Re-Admit
                              </Button>
                            </form>
                          )}

                          {/* 4. MORE ACTIONS */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0 text-muted-foreground">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/collections/vessels/${vessel.id}`}>
                                  <FileText className="mr-2 h-4 w-4" /> View Details
                                </Link>
                              </DropdownMenuItem>
                              {vessel.status === 'active' && (
                                <DropdownMenuItem asChild>
                                  <Link href={`/portal/permit/${vessel.id}`} target="_blank">
                                    <Download className="mr-2 h-4 w-4" /> Download Permit
                                  </Link>
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* PAGINATION */}
          <div className="flex items-center justify-between border-t pt-4 mt-4">
            <div className="text-sm text-muted-foreground">
              Page <span className="font-medium text-foreground">{page}</span> of{' '}
              <span className="font-medium text-foreground">{totalPages}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" disabled={page <= 1} asChild>
                <Link
                  href={`/dashboard/vessels?page=${page - 1}&search=${search}&status=${status}`}
                >
                  Previous
                </Link>
              </Button>
              <Button variant="outline" size="sm" disabled={page >= totalPages} asChild>
                <Link
                  href={`/dashboard/vessels?page=${page + 1}&search=${search}&status=${status}`}
                >
                  Next
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  // Styles updated to be cleaner and match general ShadCN vibes
  const styles: Record<string, string> = {
    active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    pending: 'bg-amber-100 text-amber-700 border-amber-200',
    payment_pending: 'bg-blue-100 text-blue-700 border-blue-200 animate-pulse', // Pulse for urgent attention
    rejected: 'bg-red-100 text-red-700 border-red-200',
    departed: 'bg-slate-100 text-slate-500 border-slate-200',
    blacklisted: 'bg-gray-900 text-gray-100 border-gray-700',
  }
  return (
    <Badge
      className={`capitalize shadow-none font-medium ${styles[status] || 'bg-gray-100 text-gray-600'}`}
    >
      {status.replace('_', ' ')}
    </Badge>
  )
}
