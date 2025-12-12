import { getVessels } from './actions'
import { VesselFilters } from './vessel-filters'
import { Button } from '@/components/ui/button'
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
import { MoreHorizontal, FileText, Ship, Download } from 'lucide-react'
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

  const { docs, totalPages, totalDocs } = await getVessels({ search, status, page })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vessel Fleet</h1>
          <p className="text-muted-foreground">Manage and monitor all registered vessels.</p>
        </div>
        <Button asChild>
          <Link href="/admin/collections/vessels/create">
            <Ship className="mr-2 h-4 w-4" /> Register Manual Vessel
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Database</CardTitle>
          <CardDescription>
            Showing {docs.length} of {totalDocs} vessels
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* FILTERS & SEARCH */}
          <VesselFilters />

          {/* TABLE */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
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
                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                      No vessels found matching your filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  docs.map((vessel: any) => (
                    <TableRow key={vessel.id}>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span className="text-base">{vessel.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {vessel.registrationNumber}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">
                        <Badge variant="outline">{vessel.vesselType}</Badge>
                      </TableCell>
                      <TableCell>
                        {vessel.owner ? (
                          <div className="flex flex-col">
                            <span className="text-sm">
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
                        <span className="capitalize text-sm">{vessel.registrationType}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
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
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* PAGINATION (Simple Next/Prev) */}
          <div className="flex items-center justify-end space-x-2 py-4">
            <Button variant="outline" size="sm" disabled={page <= 1} asChild>
              <Link href={`/dashboard/vessels?page=${page - 1}&search=${search}&status=${status}`}>
                Previous
              </Link>
            </Button>
            <div className="text-sm font-medium">
              Page {page} of {totalPages}
            </div>
            <Button variant="outline" size="sm" disabled={page >= totalPages} asChild>
              <Link href={`/dashboard/vessels?page=${page + 1}&search=${search}&status=${status}`}>
                Next
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: 'bg-green-100 text-green-700 hover:bg-green-100',
    pending: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100',
    payment_pending: 'bg-blue-100 text-blue-700 hover:bg-blue-100',
    rejected: 'bg-red-100 text-red-700 hover:bg-red-100',
    blacklisted: 'bg-gray-800 text-white hover:bg-gray-700',
  }
  return (
    <Badge className={`capitalize border-none shadow-none ${styles[status] || 'bg-gray-100'}`}>
      {status.replace('_', ' ')}
    </Badge>
  )
}
