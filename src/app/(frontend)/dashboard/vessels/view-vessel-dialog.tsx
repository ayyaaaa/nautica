'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Ship, User, Calendar, DollarSign, FileText, Ruler } from 'lucide-react'

interface ViewVesselDialogProps {
  vessel: any
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ViewVesselDialog({ vessel, open, onOpenChange }: ViewVesselDialogProps) {
  if (!vessel) return null

  const formatMoney = (amount: number) =>
    new Intl.NumberFormat('en-MV', { style: 'currency', currency: 'MVR' }).format(amount)

  const formatDate = (dateString?: string) =>
    dateString ? new Date(dateString).toLocaleDateString() : 'N/A'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 overflow-hidden flex flex-col">
        {/* HEADER */}
        <DialogHeader className="px-6 py-4 border-b bg-muted/10">
          <div className="flex justify-between items-start pr-8">
            {/* Added pr-8 to prevent Badge from overlapping the Close X button */}
            <div>
              <div className="flex items-center gap-3">
                <DialogTitle className="text-xl flex items-center gap-2">
                  <Ship className="h-5 w-5 text-blue-600" />
                  {vessel.name}
                </DialogTitle>
                <Badge variant="outline" className="capitalize">
                  {vessel.status?.replace('_', ' ')}
                </Badge>
              </div>
              <DialogDescription className="font-mono mt-1 text-xs">
                {vessel.registrationNumber}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1">
          <div className="p-6 space-y-6">
            {' '}
            {/* Unified padding and spacing */}
            {/* 1. OVERVIEW */}
            <section className="grid grid-cols-2 gap-y-4 gap-x-8">
              <div className="space-y-1">
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Vessel Type
                </h4>
                <p className="text-sm font-semibold">{vessel.vesselType}</p>
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Registration Plan
                </h4>
                <p className="text-sm font-semibold capitalize">{vessel.registrationType}</p>
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Usage Type
                </h4>
                <p className="text-sm">{vessel.useType}</p>
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Berth Status
                </h4>
                {vessel.currentBerth ? (
                  <Badge variant="secondary" className="rounded-sm">
                    Docked
                  </Badge>
                ) : (
                  <span className="text-sm text-muted-foreground">-</span>
                )}
              </div>
            </section>
            <Separator />
            {/* 2. OWNER INFO */}
            <section>
              <h3 className="text-sm font-semibold flex items-center gap-2 mb-3 text-foreground">
                <User className="h-4 w-4 text-primary" /> Owner Information
              </h3>
              <div className="grid grid-cols-2 gap-4 bg-muted/30 p-4 rounded-lg border border-border/50">
                <div>
                  <span className="text-xs text-muted-foreground">Name</span>
                  <p className="text-sm font-medium">
                    {vessel.owner?.fullName || vessel.owner?.email || 'N/A'}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Phone</span>
                  <p className="text-sm font-medium">{vessel.owner?.phone || 'N/A'}</p>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <span className="text-xs text-muted-foreground">Email</span>
                  <p className="text-sm font-medium break-all">{vessel.owner?.email || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Identity Card</span>
                  <p className="text-sm font-medium">{vessel.owner?.identityCard || 'N/A'}</p>
                </div>
              </div>
            </section>
            <Separator />
            {/* 3. FINANCIALS */}
            <section>
              <h3 className="text-sm font-semibold flex items-center gap-2 mb-3 text-foreground">
                <DollarSign className="h-4 w-4 text-primary" /> Financials
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {/* Outstanding - Red accent if debt exists */}
                <div
                  className={`p-3 border rounded-md shadow-sm ${vessel.finance?.fee > 0 ? 'bg-red-50/50 dark:bg-red-900/20 border-red-200 dark:border-red-900' : 'bg-card'}`}
                >
                  <span className="text-[10px] uppercase tracking-wide text-muted-foreground block mb-1">
                    Outstanding
                  </span>
                  <span
                    className={`text-lg font-bold ${vessel.finance?.fee > 0 ? 'text-red-600 dark:text-red-400' : 'text-foreground'}`}
                  >
                    {formatMoney(vessel.finance?.fee || 0)}
                  </span>
                </div>

                <div className="p-3 border rounded-md bg-card shadow-sm">
                  <span className="text-[10px] uppercase tracking-wide text-muted-foreground block mb-1">
                    Last Paid
                  </span>
                  <span className="text-sm font-medium block mt-1">
                    {formatMoney(vessel.finance?.lastPaidAmount || 0)}
                  </span>
                </div>

                <div className="p-3 border rounded-md bg-card shadow-sm flex flex-col justify-between">
                  <span className="text-[10px] uppercase tracking-wide text-muted-foreground block">
                    Status
                  </span>
                  <Badge
                    variant={vessel.finance?.paymentStatus === 'paid' ? 'default' : 'destructive'}
                    className="w-fit mt-1 capitalize"
                  >
                    {vessel.finance?.paymentStatus || 'unpaid'}
                  </Badge>
                </div>

                <div className="p-3 border rounded-md bg-card shadow-sm">
                  <span className="text-[10px] uppercase tracking-wide text-muted-foreground block mb-1">
                    Next Due
                  </span>
                  <span className="text-sm font-medium block mt-1">
                    {formatDate(vessel.finance?.nextPaymentDue)}
                  </span>
                </div>
              </div>
            </section>
            <Separator />
            {/* 4. SPECS */}
            <section>
              <h3 className="text-sm font-semibold flex items-center gap-2 mb-3 text-foreground">
                <Ruler className="h-4 w-4 text-primary" /> Specifications
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm bg-muted/10 p-4 rounded-md">
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Length</span>
                  <span className="font-medium">
                    {vessel.specs?.length ? `${vessel.specs.length} ft` : '-'}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Width</span>
                  <span className="font-medium">
                    {vessel.specs?.width ? `${vessel.specs.width} ft` : '-'}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Engine</span>
                  <span className="font-medium">{vessel.specs?.engineType || '-'}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Fuel</span>
                  <span className="font-medium">{vessel.specs?.fuelType || '-'}</span>
                </div>
              </div>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
