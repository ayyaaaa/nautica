import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Ship, Anchor, AlertTriangle, CheckCircle2 } from 'lucide-react'

export function BerthGrid({ zoneMap }: { zoneMap: Record<string, any[]> }) {
  // Helper to make zone names readable
  const formatZone = (key: string) => {
    return key.replace(/_/g, ' ').toUpperCase()
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

                return (
                  <div
                    key={slot.id}
                    className={`
                        relative p-4 rounded-lg border flex flex-col justify-between h-36 transition-all duration-200 group
                        ${isAvailable ? 'bg-emerald-50/50 border-emerald-100 hover:border-emerald-300 hover:shadow-md cursor-pointer' : ''}
                        ${isOccupied ? 'bg-white border-rose-100 hover:border-rose-300 shadow-sm' : ''}
                        ${isMaintenance ? 'bg-orange-50/50 border-orange-100' : ''}
                    `}
                  >
                    {/* Top Right Status Dot */}
                    <div className="flex justify-between items-start">
                      <span
                        className={`text-xl font-bold font-mono tracking-tight ${isOccupied ? 'text-foreground' : 'text-foreground/80'}`}
                      >
                        {slot.name}
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
                        {slot.size}ft • {slot.type}
                      </p>
                    </div>

                    {/* Bottom Status Text */}
                    <div className="mt-auto pt-3 border-t border-black/5">
                      {isOccupied ? (
                        <div
                          className="flex items-center text-rose-700 font-medium text-xs truncate"
                          title={slot.activeVesselName}
                        >
                          <Ship className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                          <span className="truncate">{slot.activeVesselName || 'Unknown'}</span>
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
    </div>
  )
}
