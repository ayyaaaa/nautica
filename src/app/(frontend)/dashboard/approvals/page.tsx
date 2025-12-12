import { getPendingApplications } from './actions'
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
import { redirect } from 'next/navigation' // <--- Import redirect
import { ApprovalActions } from './approval-actions'

// --- SECURITY IMPORTS ---
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'

export default async function ApprovalsPage() {
  // 1. GET THE CURRENT USER
  const payload = await getPayload({ config: configPromise })
  const requestHeaders = await headers()
  const { user } = await payload.auth({ headers: requestHeaders })

  // 2. SECURITY CHECK
  // If no user, OR user is not an admin -> Redirect to Login
  // Note: Adjust 'admin' to match whatever role name your main admin user has (e.g. 'admin' or check if collection is 'users')
  if (!user || (user as any).role !== 'admin') {
    // If you are using the standard payload admin login:
    redirect('/admin/login')
  }

  // 3. If passed, fetch the data
  const applications = await getPendingApplications()

  return (
    <div className="container py-10 mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pending Approvals</h1>
          <p className="text-muted-foreground">Review and manage vessel registration requests.</p>
        </div>
        {/* Optional: Show who is logged in */}
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
                <TableHead>Operator</TableHead>
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
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{vessel.vesselType}</Badge>
                        <span className="text-xs text-muted-foreground capitalize">
                          {vessel.registrationType}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {typeof vessel.operator === 'object'
                        ? vessel.operator?.fullName || vessel.operator?.email
                        : 'Unknown'}
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
                    <TableCell className="text-right">
                      <ApprovalActions id={vessel.id} />
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
