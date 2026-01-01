import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CheckCircle2 } from 'lucide-react'

export function AssignBerthModal({
  vesselId,
}: {
  vesselId: number
  vesselName: string // Props kept to prevent TypeScript errors in parent
  availableSlots: any[]
}) {
  return (
    <Button
      asChild
      size="sm"
      variant="outline"
      className="h-8 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 transition-colors"
    >
      {/* Redirects to approvals page. Added ID query param for convenience. */}
      <Link href={`/dashboard/approvals?id=${vesselId}`}>
        <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
        Approve & Dock
      </Link>
    </Button>
  )
}
