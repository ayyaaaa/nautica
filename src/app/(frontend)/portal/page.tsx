import { getMyVessels } from './actions'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card'
import { Ship, CheckCircle2, Clock, Wrench, Plus, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { RenewButton } from './renew-button'

export default async function UserPortal() {
  const { vessels, user } = await getMyVessels()

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome, {user.fullName || 'Captain'}
          </h1>
          <p className="text-muted-foreground">Manage your fleet and harbor services.</p>
        </div>
        <div className="flex gap-2">
          {/* THE MAIN NEW BUTTON */}
          <Button asChild>
            <Link href="/portal/services/new">
              <Wrench className="mr-2 h-4 w-4" /> Request Service
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/register">
              <Plus className="mr-2 h-4 w-4" /> New Vessel
            </Link>
          </Button>
        </div>
      </div>

      {/* Quick Stats / Summary can go here later */}

      {/* Vessel Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">My Vessels</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {vessels.length === 0 ? (
            <Card className="col-span-full py-16 flex flex-col items-center justify-center text-center bg-muted/20 border-dashed">
              <Ship className="w-16 h-16 text-muted-foreground mb-4 opacity-20" />
              <CardTitle className="text-xl">No Vessels Found</CardTitle>
              <CardDescription className="max-w-xs mt-2">
                You {"haven't"} registered any vessels yet.
              </CardDescription>
              <Button asChild className="mt-4">
                <Link href="/register">Register Now</Link>
              </Button>
            </Card>
          ) : (
            vessels.map((vessel: any) => {
              const now = new Date()
              const dueDate = vessel.finance?.nextPaymentDue
                ? new Date(vessel.finance.nextPaymentDue)
                : null
              const isExpired = dueDate && now > dueDate

              return (
                <Card
                  key={vessel.id}
                  className="flex flex-col overflow-hidden transition-all hover:shadow-lg border-muted group"
                >
                  <div className={`h-2 w-full ${getStatusColor(vessel.status, isExpired)}`} />

                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="outline" className="text-xs font-normal">
                        {vessel.vesselType}
                      </Badge>
                      <StatusBadge status={vessel.status} isExpired={isExpired} />
                    </div>
                    <CardTitle className="text-xl font-bold">{vessel.name}</CardTitle>
                    <CardDescription className="font-mono text-xs tracking-wider">
                      {vessel.registrationNumber}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="text-sm space-y-3 flex-1 pt-4">
                    <div className="flex justify-between py-1 border-b border-border/50">
                      <span className="text-muted-foreground">Type</span>
                      <span className="font-medium capitalize">{vessel.registrationType}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      {vessel.status === 'active' && dueDate ? (
                        <>
                          <span
                            className={
                              isExpired ? 'text-red-500 font-bold' : 'text-muted-foreground'
                            }
                          >
                            Expires
                          </span>
                          <span className={`font-medium ${isExpired ? 'text-red-600' : ''}`}>
                            {dueDate.toLocaleDateString()}
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="text-muted-foreground">Submitted</span>
                          <span className="font-medium">
                            {new Date(vessel.createdAt).toLocaleDateString()}
                          </span>
                        </>
                      )}
                    </div>
                  </CardContent>

                  <CardFooter className="bg-muted/30 pt-4 mt-auto gap-2">
                    {/* Action Buttons Logic */}
                    {vessel.status === 'active' && isExpired ? (
                      <RenewButton id={vessel.id} />
                    ) : vessel.status === 'active' ? (
                      <Button
                        asChild
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                        size="sm"
                      >
                        <Link href={`/portal/permit/${vessel.id}`}>
                          <CheckCircle2 className="w-4 h-4 mr-2" /> Permit
                        </Link>
                      </Button>
                    ) : vessel.status === 'payment_pending' ? (
                      <Button
                        asChild
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white animate-pulse"
                        size="sm"
                      >
                        <Link href={`/portal/pay/${vessel.id}`}>Pay Now</Link>
                      </Button>
                    ) : (
                      <Button
                        variant="secondary"
                        className="w-full text-muted-foreground opacity-80"
                        disabled
                        size="sm"
                      >
                        <Clock className="w-4 h-4 mr-2" /> Pending
                      </Button>
                    )}

                    {/* Service Shortcut for Active Vessels */}
                    {vessel.status === 'active' && (
                      <Button variant="outline" size="icon" asChild title="Request Service">
                        <Link href="/portal/services/new">
                          <Wrench className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </Link>
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

// Helper Functions
function StatusBadge({ status, isExpired }: { status: string; isExpired?: boolean | null }) {
  if (status === 'active') {
    if (isExpired)
      return <Badge className="bg-red-500/15 text-red-700 border-red-200">Expired</Badge>
    return <Badge className="bg-green-500/15 text-green-700 border-green-200">Active</Badge>
  }
  if (status === 'payment_pending')
    return (
      <Badge className="bg-blue-500/15 text-blue-700 border-blue-200 animate-pulse">Pay Bill</Badge>
    )
  if (status === 'rejected')
    return <Badge className="bg-red-500/15 text-red-700 border-red-200">Rejected</Badge>
  return <Badge className="bg-yellow-500/15 text-yellow-700 border-yellow-200">Pending</Badge>
}

function getStatusColor(status: string, isExpired?: boolean | null) {
  if (status === 'active') return isExpired ? 'bg-red-500' : 'bg-green-500'
  if (status === 'payment_pending') return 'bg-blue-500'
  if (status === 'rejected') return 'bg-red-500'
  return 'bg-yellow-500'
}
