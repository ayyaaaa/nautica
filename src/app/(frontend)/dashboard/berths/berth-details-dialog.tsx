'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Ship, CalendarClock, Phone, Anchor, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'

interface BerthDetailsDialogProps {
  slot: any | null
  open: boolean
  onClose: () => void
}

export function BerthDetailsDialog({ slot, open, onClose }: BerthDetailsDialogProps) {
  if (!slot) return null

  const contract = slot.activeContract

  // Helper to format the expiry text
  const getExpiryDisplay = () => {
    if (!contract) return 'Unknown'

    // 1. If it's a Temporary plan, explicitly say so
    if (contract.planType === 'temporary') {
      return 'Temporary Vessel'
    }

    // 2. Otherwise, check for a date (for Daily/Monthly/Yearly)
    if (contract.endTime) {
      return format(new Date(contract.endTime), 'dd MMM yyyy')
    }

    // 3. If no date and not temporary (e.g. Permanent with no end date set yet)
    return 'Indefinite'
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md bg-background border-border">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-xl text-foreground">
              <span className="bg-muted text-foreground px-2 py-1 rounded-md font-mono text-base border border-border">
                {slot.name}
              </span>
              Slot Details
            </DialogTitle>
            <StatusBadge status={slot.status} />
          </div>
          <DialogDescription className="text-muted-foreground">
            Current status and occupancy information.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Scenario A: Occupied with Active Contract */}
          {slot.status === 'occupied' && contract ? (
            <div className="space-y-4">
              {/* Vessel Info */}
              <div className="p-4 rounded-lg bg-card border border-border space-y-3 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-muted rounded-full border border-border">
                    <Ship className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-foreground">{contract.vessel?.name}</p>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">
                      Reg: {contract.vessel?.registrationNumber}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
                        {contract.vessel?.vesselType}
                      </Badge>
                      <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
                        {contract.vessel?.useType}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timing & Plan */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg border border-border bg-card">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <CalendarClock className="w-4 h-4" />
                    <span className="text-xs font-medium">Expiry / Status</span>
                  </div>
                  <p className="font-semibold text-sm text-foreground">
                    {/* ✅ UPDATED LOGIC HERE */}
                    {getExpiryDisplay()}
                  </p>
                </div>
                <div className="p-3 rounded-lg border border-border bg-card">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Anchor className="w-4 h-4" />
                    <span className="text-xs font-medium">Plan Type</span>
                  </div>
                  <p className="font-semibold text-sm capitalize text-foreground">
                    {contract.planType}
                  </p>
                </div>
              </div>

              {/* Contact */}
              {contract.vessel?.owner?.phone && (
                <div className="flex items-center gap-3 p-3 rounded-md bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-sm dark:text-emerald-400">
                  <Phone className="w-4 h-4" />
                  <span className="font-medium">Owner: {contract.vessel.owner.phone}</span>
                </div>
              )}
            </div>
          ) : slot.status === 'occupied' ? (
            /* Scenario B: Data Mismatch */
            <div className="p-4 rounded-lg border border-dashed border-yellow-500/50 bg-yellow-500/5 text-center space-y-2">
              <AlertCircle className="w-8 h-8 text-yellow-500 mx-auto" />
              <p className="text-sm font-medium text-foreground">Data Mismatch</p>
              <p className="text-xs text-muted-foreground">
                Slot is marked occupied, but no active contract record was found.
              </p>
            </div>
          ) : (
            /* Scenario C: Empty Slot */
            <div className="flex flex-col items-center justify-center py-8 text-center space-y-2 text-muted-foreground">
              <div className="p-3 bg-muted rounded-full">
                <Anchor className="w-8 h-8 opacity-20" />
              </div>
              <p className="text-sm">This slot is currently empty.</p>
              <p className="text-xs">Available for assignment.</p>
            </div>
          )}
        </div>

        <DialogFooter className="sm:justify-between gap-2">
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            Close
          </Button>
          {slot.status === 'occupied' && contract && (
            <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
              <a href={`/dashboard/berth/${contract.id}`}>View Full Contract</a>
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
    occupied: 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/20',
    maintenance: 'bg-orange-500/15 text-orange-700 dark:text-orange-400 border-orange-500/20',
    available: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
  }

  const defaultClass = 'bg-muted text-muted-foreground border-border'

  return (
    <Badge className={`capitalize shadow-none border ${styles[status] || defaultClass}`}>
      {status}
    </Badge>
  )
}
