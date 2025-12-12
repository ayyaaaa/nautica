import { getDashboardStats } from './actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users, DollarSign, FileClock, Ship, ArrowUpRight, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
  const { stats, user } = await getDashboardStats()

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user.fullName || 'Admin'}. Here is {"today's"} overview.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/approvals">
            Review Applications <ArrowUpRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value={`MVR ${stats.totalRevenue.toLocaleString()}`}
          icon={<DollarSign className="text-green-600" />}
          desc="+12% from last month"
        />
        <StatCard
          title="Active Fleet"
          value={stats.activeFleet.toString()}
          icon={<Ship className="text-blue-600" />}
          desc="Currently permitted"
        />
        <StatCard
          title="Pending Reviews"
          value={stats.pendingReviews.toString()}
          icon={<FileClock className="text-yellow-600" />}
          desc="Requires attention"
        />
        <StatCard
          title="Projected Revenue"
          value={`MVR ${stats.pendingRevenue.toLocaleString()}`}
          icon={<AlertCircle className="text-orange-600" />}
          desc="Awaiting payment"
        />
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Table */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {stats.recentActivity.map((vessel: any) => (
                  <div
                    key={vessel.id}
                    className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                        <Ship className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{vessel.name}</p>
                        <p className="text-xs text-muted-foreground">{vessel.registrationNumber}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <StatusBadge status={vessel.status} />
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(vessel.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions / Side Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              <Button variant="outline" className="justify-start" asChild>
                <Link href="/admin/collections/users/create">
                  <Users className="mr-2 h-4 w-4" /> Create New Operator
                </Link>
              </Button>
              <Button variant="outline" className="justify-start" asChild>
                <Link href="/admin/collections/vessels">
                  <Ship className="mr-2 h-4 w-4" /> View Full Vessel Database
                </Link>
              </Button>
            </CardContent>
          </Card>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-900">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">System Status</h4>
            <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
              </span>
              Operational
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// --- Helper Components ---

function StatCard({
  title,
  value,
  icon,
  desc,
}: {
  title: string
  value: string
  icon: any
  desc: string
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-y-0 pb-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          {icon}
        </div>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{desc}</p>
      </CardContent>
    </Card>
  )
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'active')
    return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Active</Badge>
  if (status === 'payment_pending')
    return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Bill Sent</Badge>
  if (status === 'pending')
    return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">Pending</Badge>
  return (
    <Badge variant="secondary" className="capitalize">
      {status}
    </Badge>
  )
}
