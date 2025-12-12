import Link from 'next/link'
import { LayoutDashboard, FileCheck, Settings, LogOut, Anchor, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-muted/20 flex flex-col md:flex-row">
      {/* SIDEBAR (Desktop) */}
      <aside className="w-64 bg-background border-r hidden md:flex flex-col fixed h-full z-20">
        <div className="p-6 border-b flex items-center gap-2 font-bold text-xl text-primary">
          <Anchor className="h-6 w-6" />
          <span>Harbor Admin</span>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <SidebarItem href="/dashboard" icon={<LayoutDashboard />} label="Overview" />
          <SidebarItem href="/dashboard/approvals" icon={<FileCheck />} label="Approvals" />
          {/* Link to Payload CMS for settings */}
          <SidebarItem href="/admin/globals/settings" icon={<Settings />} label="Site Settings" />
        </nav>

        <div className="p-4 border-t">
          <Button
            variant="ghost"
            className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
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
          <Anchor className="h-5 w-5" /> Harbor Admin
        </div>
        {/* Simple mobile menu trigger - links to overview for now */}
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard">
            <Menu />
          </Link>
        </Button>
      </div>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 md:ml-64 p-4 md:p-8">{children}</main>
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
      className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-muted"
      asChild
    >
      <Link href={href}>
        <span className="mr-3 h-4 w-4 opacity-70">{icon}</span> {label}
      </Link>
    </Button>
  )
}
