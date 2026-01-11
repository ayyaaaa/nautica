'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Ship, Anchor, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { BerthDetailsDialog } from './berth-details-dialog'

interface BerthGridProps {
  zoneMap: Record<string, any[]>
  contracts: any[]
}

export function BerthGrid({ zoneMap, contracts = [] }: BerthGridProps) {
  const [selectedSlot, setSelectedSlot] = useState<any | null>(null)

  // Helper to make zone names readable
  const formatZone = (key: string) => {
    return key.replace(/_/g, ' ').toUpperCase()
  }

  // --- ROBUST FINDER FUNCTION ---
  // This replaces the simple .find() to avoid "Data Mismatch" errors
  const findActiveContract = (slotId: any) => {
    if (!contracts) return undefined

    return contracts.find((c) => {
      // 1. Must be active
      if (c.status !== 'active') return false

      // 2. Safely get the Slot ID from the contract
      // (Handles cases where Payload returns an object OR just an ID string)
      const contractSlotId =
        c.assignedSlot && typeof c.assignedSlot === 'object' ? c.assignedSlot.id : c.assignedSlot

      // 3. Compare as Strings (Fixes 15 vs "15" mismatch)
      return String(contractSlotId) === String(slotId)
    })
  }

  // Handle slot click
  const handleSlotClick = (slot: any) => {
    const activeContract = findActiveContract(slot.id)
    setSelectedSlot({ ...slot, activeContract })
  }

  return (
    <div className="space-y-8">
      {Object.entries(zoneMap).map(([zone, slots]) => (
        <Card key={zone} className="border-t-4 border-t-primary shadow-sm">
          <CardHeader className="border-b bg-muted/10 pb-4">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <div className="p-1.5 bg-primary/10 rounded-md">
                <Anchor className="h-5 w-5 text-primary" />
              </div>
              {formatZone(zone)}
              <Badge
                variant="outline"
                className="ml-2 bg-background font-normal text-muted-foreground"
              >
                {slots.length} Slots
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
              {slots.map((slot) => {
                const isAvailable = slot.status === 'available'
                const isOccupied = slot.status === 'occupied'
                const isMaintenance = slot.status === 'maintenance'

                // Use the new safe finder here too
                const activeContract = findActiveContract(slot.id)
                const vesselName = activeContract?.vessel?.name || 'Unknown Vessel'

                return (
                  <div
                    key={slot.id}
                    onClick={() => handleSlotClick(slot)}
                    className={`
                        relative p-4 rounded-lg border flex flex-col justify-between h-36 transition-all duration-200 group cursor-pointer hover:scale-[1.02]
                        ${isAvailable ? 'bg-emerald-50/50 border-emerald-100 hover:border-emerald-300 hover:shadow-md' : ''}
                        ${isOccupied ? 'bg-white border-rose-100 hover:border-rose-300 shadow-sm' : ''}
                        ${isMaintenance ? 'bg-orange-50/50 border-orange-100 hover:border-orange-300' : ''}
                    `}
                  >
                    {/* Top Right Status Dot */}
                    <div className="flex justify-between items-start">
                      <span
                        className={`text-xl font-bold font-mono tracking-tight ${isOccupied ? 'text-foreground' : 'text-foreground/80'}`}
                      >
                        {slot.name.slice(-2)}
                      </span>

                      <div
                        className={`w-2.5 h-2.5 rounded-full shadow-sm
                                ${isAvailable ? 'bg-emerald-500' : ''}
                                ${isOccupied ? 'bg-rose-500 animate-pulse' : ''}
                                ${isMaintenance ? 'bg-orange-500' : ''}
                            `}
                      />
                    </div>

                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">
                        {slot.type || 'Standard'}
                      </p>
                    </div>

                    {/* Bottom Status Text */}
                    <div className="mt-auto pt-3 border-t border-black/5">
                      {isOccupied ? (
                        <div
                          className="flex items-center text-rose-700 font-medium text-xs truncate"
                          title={vesselName}
                        >
                          <Ship className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                          <span className="truncate">{vesselName}</span>
                        </div>
                      ) : isMaintenance ? (
                        <div className="flex items-center text-orange-700 font-medium text-xs">
                          <AlertTriangle className="w-3.5 h-3.5 mr-1.5" /> Maintenance
                        </div>
                      ) : (
                        <div className="flex items-center text-emerald-700 font-medium text-xs">
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Available
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Popup Component */}
      <BerthDetailsDialog
        slot={selectedSlot}
        open={!!selectedSlot}
        onClose={() => setSelectedSlot(null)}
      />
    </div>
  )
}
