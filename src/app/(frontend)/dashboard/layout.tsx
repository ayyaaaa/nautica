import Link from 'next/link'
import {
  LayoutDashboard,
  Ship,
  Anchor,
  Wrench,
  CreditCard,
  Users,
  Building2,
  FileBarChart,
  Settings,
  LogOut,
  Menu,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-muted/20 flex flex-col md:flex-row">
      {/* SIDEBAR */}
      <aside className="w-64 bg-background border-r hidden md:flex flex-col fixed h-full z-20 shadow-sm">
        <div className="p-6 border-b flex items-center gap-2 font-bold text-xl text-primary">
          <Anchor className="h-6 w-6" />
          <span>Nautica Admin</span>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <p className="px-4 text-xs font-semibold text-muted-foreground mb-2 mt-2 uppercase tracking-wider">
            Operations
          </p>
          <SidebarItem href="/dashboard" icon={<LayoutDashboard />} label="Dashboard" />
          <SidebarItem href="/dashboard/vessels" icon={<Ship />} label="Vessels" />
          <SidebarItem href="/dashboard/berths" icon={<Anchor />} label="Berths & Contracts" />
          <SidebarItem href="/dashboard/services" icon={<Wrench />} label="Services" />

          <p className="px-4 text-xs font-semibold text-muted-foreground mb-2 mt-4 uppercase tracking-wider">
            Finance & CRM
          </p>
          <SidebarItem
            href="/dashboard/payments"
            icon={<CreditCard />}
            label="Payments & Invoices"
          />
          <SidebarItem href="/dashboard/owners" icon={<Users />} label="Owners & Operators" />
          <SidebarItem href="/dashboard/businesses" icon={<Building2 />} label="Businesses" />

          <p className="px-4 text-xs font-semibold text-muted-foreground mb-2 mt-4 uppercase tracking-wider">
            System
          </p>
          <SidebarItem href="/dashboard/reports" icon={<FileBarChart />} label="Reports" />
          <SidebarItem href="/admin/globals/site-settings" icon={<Settings />} label="Settings" />
        </nav>

        <div className="p-4 border-t bg-muted/10">
          <Button
            variant="ghost"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            asChild
          >
            <Link href="/logout">
              <LogOut className="mr-2 h-4 w-4" /> Log Out
            </Link>
          </Button>
        </div>
      </aside>

      {/* MOBILE HEADER */}
      <div className="md:hidden bg-background border-b p-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2 font-bold text-lg text-primary">
          <Anchor className="h-5 w-5" /> Nautica
        </div>
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard">
            <Menu />
          </Link>
        </Button>
      </div>

      {/* MAIN CONTENT */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 overflow-x-hidden">{children}</main>
    </div>
  )
}

function SidebarItem({
  href,
  icon,
  label,
}: {
  href: string
  icon: React.ReactNode
  label: string
}) {
  return (
    <Button
      variant="ghost"
      className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-muted mb-1 font-medium"
      asChild
    >
      <Link href={href}>
        <span className="mr-3 h-4 w-4 opacity-70">{icon}</span> {label}
      </Link>
    </Button>
  )
}
