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
import { Ship, Anchor, CheckCircle2, Clock, CreditCard } from 'lucide-react'
import Link from 'next/link'
import { ModeToggle } from '@/components/mode-toggle'
import { RenewButton } from './renew-button' // Import the client component for renewals

export default async function UserPortal() {
  const { vessels, user } = await getMyVessels()

  return (
    <div className="min-h-screen bg-muted/40">
      {/* Navbar */}
      <header className="bg-background border-b px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-2 text-primary font-bold text-xl">
          <Anchor className="w-6 h-6" />
          <span>Harbor Portal</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground hidden sm:inline-block">
            {user?.email}
          </span>
          <ModeToggle />
        </div>
      </header>

      <main className="container max-w-5xl py-10 mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Vessels</h1>
            <p className="text-muted-foreground">
              Track registration status and manage your fleet.
            </p>
          </div>
          <Button asChild>
            <Link href="/register">Register New Vessel</Link>
          </Button>
        </div>

        {/* Vessel Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vessels.length === 0 ? (
            <Card className="col-span-full py-16 flex flex-col items-center justify-center text-center bg-muted/20 border-dashed">
              <Ship className="w-16 h-16 text-muted-foreground mb-4 opacity-20" />
              <CardTitle className="text-xl">No Vessels Found</CardTitle>
              <CardDescription className="max-w-xs mt-2">
                You {"haven't"} registered any vessels yet. Click the button above to get started.
              </CardDescription>
            </Card>
          ) : (
            vessels.map((vessel: any) => {
              // --- RENEWAL LOGIC ---
              const now = new Date()
              const dueDate = vessel.finance?.nextPaymentDue
                ? new Date(vessel.finance.nextPaymentDue)
                : null
              const isExpired = dueDate && now > dueDate

              return (
                <Card
                  key={vessel.id}
                  className="flex flex-col overflow-hidden transition-all hover:shadow-lg border-muted"
                >
                  {/* Status Bar Indicator */}
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
                      <span className="text-muted-foreground">Registration</span>
                      <span className="font-medium capitalize">{vessel.registrationType}</span>
                    </div>
                    {vessel.specs && (
                      <div className="flex justify-between py-1 border-b border-border/50">
                        <span className="text-muted-foreground">Dimensions</span>
                        <span className="font-medium">
                          {vessel.specs.length}m x {vessel.specs.width}m
                        </span>
                      </div>
                    )}
                    {/* Show Expiry if Active, otherwise show Submitted date */}
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

                  <CardFooter className="bg-muted/30 pt-4 mt-auto">
                    {/* CASE 1: EXPIRED (Active but past due) */}
                    {vessel.status === 'active' && isExpired ? (
                      <RenewButton id={vessel.id} />
                    ) : /* CASE 2: ACTIVE (Paid & Valid) */
                    vessel.status === 'active' ? (
                      <Button
                        asChild
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                        size="sm"
                      >
                        <Link href={`/portal/permit/${vessel.id}`}>
                          <CheckCircle2 className="w-4 h-4 mr-2" /> Download Permit
                        </Link>
                      </Button>
                    ) : /* CASE 3: PAYMENT PENDING (Approved but Unpaid) */
                    vessel.status === 'payment_pending' ? (
                      <Button
                        asChild
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground animate-pulse"
                        size="sm"
                      >
                        <Link href={`/portal/pay/${vessel.id}`}>
                          <CreditCard className="w-4 h-4 mr-2" /> Pay Registration Fee
                        </Link>
                      </Button>
                    ) : /* CASE 4: REJECTED */
                    vessel.status === 'rejected' ? (
                      <Button variant="destructive" className="w-full" size="sm">
                        Contact Office
                      </Button>
                    ) : (
                      /* CASE 5: PENDING (Review) */
                      <Button
                        variant="secondary"
                        className="w-full text-muted-foreground cursor-not-allowed opacity-80"
                        disabled
                        size="sm"
                      >
                        <Clock className="w-4 h-4 mr-2" /> Awaiting Approval
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              )
            })
          )}
        </div>
      </main>
    </div>
  )
}

// --- HELPER COMPONENTS ---

function StatusBadge({ status, isExpired }: { status: string; isExpired?: boolean | null }) {
  if (status === 'active') {
    if (isExpired) {
      return <Badge className="bg-red-500/15 text-red-700 border-red-200">Expired</Badge>
    }
    return (
      <Badge className="bg-green-500/15 text-green-700 hover:bg-green-500/25 border-green-200">
        Active
      </Badge>
    )
  }
  if (status === 'payment_pending') {
    return (
      <Badge className="bg-blue-500/15 text-blue-700 border-blue-200 animate-pulse">
        Payment Due
      </Badge>
    )
  }
  if (status === 'rejected') {
    return (
      <Badge className="bg-red-500/15 text-red-700 hover:bg-red-500/25 border-red-200">
        Rejected
      </Badge>
    )
  }
  return (
    <Badge className="bg-yellow-500/15 text-yellow-700 hover:bg-yellow-500/25 border-yellow-200">
      Pending
    </Badge>
  )
}

function getStatusColor(status: string, isExpired?: boolean | null) {
  if (status === 'active') return isExpired ? 'bg-red-500' : 'bg-green-500'
  if (status === 'payment_pending') return 'bg-blue-500'
  if (status === 'rejected') return 'bg-red-500'
  return 'bg-yellow-500'
}
