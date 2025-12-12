import { getDashboardStats } from './actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Ship, Anchor, AlertTriangle, Banknote, CalendarClock, MoreHorizontal } from 'lucide-react'
import Link from 'next/link'
import { RevenueChart } from './charts/revenue-chart'
import { VesselPieChart } from './charts/vessel-pie-chart'

// IMPORT NEW CHART COMPONENTS

export default async function DashboardPage() {
  const { stats, typeBreakdown, revenueHistory, recentActivity, user } = await getDashboardStats()

  // Transform Data for Charts
  const pieData = Object.entries(typeBreakdown).map(([name, value]) => ({ name, value }))

  // (Optional) Group revenue by Month if needed, currently passing raw
  const lineData = revenueHistory

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
          <p className="text-muted-foreground">
            Welcome back, {user.fullName}. System status at a glance.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Download Report</Button>
          <Button asChild>
            <Link href="/dashboard/vessels">Manage Fleet</Link>
          </Button>
        </div>
      </div>

      {/* --- SECTION A: TOP SUMMARY CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <SummaryCard
          label="Active Vessels"
          value={`${stats.activeVessels}`}
          subtext={`${stats.pendingApproval} Pending Approval`}
          icon={<Ship className="text-blue-600" />}
        />
        <SummaryCard
          label="Berths in Use"
          value={`${stats.berthsOccupied}/${stats.totalBerths}`}
          subtext={`${Math.round((stats.berthsOccupied / stats.totalBerths) * 100)}% Occupancy`}
          icon={<Anchor className="text-purple-600" />}
        />
        <SummaryCard
          label="Unpaid Invoices"
          value={`MVR ${stats.unpaidAmount.toLocaleString()}`}
          subtext={`${stats.unpaidCount} Invoices Due`}
          icon={<AlertTriangle className="text-red-600" />}
          alert
        />
        <SummaryCard
          label="Today's Revenue"
          value={`MVR ${stats.revenueToday.toLocaleString()}`}
          subtext="Collected today"
          icon={<Banknote className="text-green-600" />}
        />
        <SummaryCard
          label="Monthly Revenue"
          value={`MVR ${stats.revenueMonth.toLocaleString()}`}
          subtext="+12% vs last month"
          icon={<Banknote className="text-green-600" />}
        />
        <SummaryCard
          label="Pending Services"
          value={`${stats.pendingServices}`}
          subtext="Requests waiting"
          icon={<CalendarClock className="text-orange-600" />}
        />
      </div>

      {/* --- SECTION B: RECHARTS GRAPHS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Line Chart */}
        <RevenueChart data={lineData} />

        {/* Vessel Type Pie Chart */}
        <VesselPieChart data={pieData} />
      </div>

      {/* --- SECTION C: TABLES --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Vessel Activity</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/vessels">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((vessel: any) => (
                <div
                  key={vessel.id}
                  className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="font-medium text-sm">{vessel.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {vessel.registrationType} • {vessel.vesselType}
                    </p>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={vessel.status} />
                  </div>
                </div>
              ))}
              {recentActivity.length === 0 && (
                <p className="text-sm text-muted-foreground">No recent activity.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Unpaid Invoices */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Pending Payments</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/payments">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity
                .filter((v: any) => v.status === 'payment_pending')
                .map((vessel: any) => (
                  <div
                    key={vessel.id}
                    className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                  >
                    <div>
                      <p className="font-medium text-sm text-red-600">
                        Invoice #{vessel.id.substring(0, 6).toUpperCase()}
                      </p>
                      <p className="text-xs text-muted-foreground">{vessel.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm">
                        MVR {vessel.finance?.fee?.toLocaleString()}
                      </p>
                      <p className="text-xs text-red-500">Unpaid</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              {recentActivity.filter((v: any) => v.status === 'payment_pending').length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-6">
                  No pending payments.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// --- HELPER COMPONENTS ---

function SummaryCard({
  label,
  value,
  subtext,
  icon,
  alert,
}: {
  label: string
  value: string
  subtext: string
  icon: any
  alert?: boolean
}) {
  return (
    <Card className={alert ? 'border-red-200 bg-red-50/50' : ''}>
      <CardContent className="p-5">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {label}
            </p>
            <h3 className="text-2xl font-bold mt-1">{value}</h3>
          </div>
          <div className="p-2 bg-background rounded-md shadow-sm">{icon}</div>
        </div>
        <p
          className={`text-xs mt-2 ${alert ? 'text-red-600 font-medium' : 'text-muted-foreground'}`}
        >
          {subtext}
        </p>
      </CardContent>
    </Card>
  )
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'active')
    return (
      <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none">Active</Badge>
    )
  if (status === 'payment_pending')
    return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none">Unpaid</Badge>
  if (status === 'pending')
    return (
      <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-none">
        Pending
      </Badge>
    )
  return <Badge variant="secondary">{status}</Badge>
}
