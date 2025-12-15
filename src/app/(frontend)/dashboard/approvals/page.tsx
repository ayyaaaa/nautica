import { getPendingVessels } from './actions' // Updated function name
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
import { FileText } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

// --- SECURITY IMPORTS ---
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'

// --- NEW COMPONENT IMPORTS ---
import { ApproveDialog } from './approve-dialog'
import { RejectButton } from './approval-actions'

export default async function ApprovalsPage() {
  // 1. GET THE CURRENT USER
  const payload = await getPayload({ config: configPromise })
  const requestHeaders = await headers()
  const { user } = await payload.auth({ headers: requestHeaders })

  // 2. SECURITY CHECK
  if (!user || (user as any).role !== 'admin') {
    redirect('/admin/login')
  }

  // 3. FETCH DATA (Using the new action that supports the Berthing flow)
  const applications = await getPendingVessels()

  return (
    <div className="container py-10 mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pending Approvals</h1>
          <p className="text-muted-foreground">Review requests and assign berthing slots.</p>
        </div>
        <div className="text-sm text-right text-muted-foreground">
          Logged in as: <span className="font-medium text-foreground">{user.email}</span>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Applications Queue</CardTitle>
          <CardDescription>You have {applications.length} pending requests.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vessel Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Owner / Operator</TableHead>
                <TableHead>Documents</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No pending applications found.
                  </TableCell>
                </TableRow>
              ) : (
                applications.map((vessel: any) => (
                  <TableRow key={vessel.id}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{vessel.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {vessel.registrationNumber}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge variant="outline" className="w-fit">
                          {vessel.vesselType}
                        </Badge>
                        <span className="text-xs text-muted-foreground capitalize">
                          {vessel.registrationType}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {/* Display Owner (Fallback to Operator if needed) */}
                      {vessel.owner ? (
                        <div className="flex flex-col">
                          <span className="text-sm">
                            {vessel.owner.fullName || vessel.owner.email}
                          </span>
                          <span className="text-xs text-muted-foreground">Owner</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground italic">Manual Reg.</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {vessel.registrationDoc ? (
                          <Button variant="ghost" size="sm" asChild>
                            <Link
                              href={
                                typeof vessel.registrationDoc === 'object'
                                  ? vessel.registrationDoc.url
                                  : '#'
                              }
                              target="_blank"
                            >
                              <FileText className="w-4 h-4 mr-1 text-blue-500" /> Reg
                            </Link>
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-yellow-500/15 text-yellow-600 hover:bg-yellow-500/25 border-yellow-200">
                        {vessel.status}
                      </Badge>
                    </TableCell>

                    {/* --- UPDATED ACTIONS COLUMN --- */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* 1. APPROVE (Opens Berthing Popup) */}
                        <ApproveDialog
                          vesselId={vessel.id}
                          vesselName={vessel.name}
                          regType={vessel.registrationType}
                        />

                        {/* 2. REJECT (Standard Button) */}
                        <RejectButton id={vessel.id} />
                      </div>
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
