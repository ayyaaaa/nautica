import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Ship, Anchor, AlertTriangle } from 'lucide-react'

export function BerthGrid({ zoneMap }: { zoneMap: Record<string, any[]> }) {
  // Helper to make zone names readable
  const formatZone = (key: string) => {
    return key.replace(/_/g, ' ').toUpperCase()
  }

  return (
    <div className="space-y-8">
      {Object.entries(zoneMap).map(([zone, slots]) => (
        <Card key={zone} className="border-t-4 border-t-blue-600">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Anchor className="h-5 w-5 text-blue-600" />
              {formatZone(zone)}
              <Badge variant="secondary" className="ml-2">
                {slots.length} Slots
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {slots.map((slot) => (
                <div
                  key={slot.id}
                  className={`
                        relative p-4 rounded-lg border-2 flex flex-col justify-between h-32 transition-all
                        ${slot.status === 'available' ? 'border-green-100 bg-green-50 hover:border-green-300' : ''}
                        ${slot.status === 'occupied' ? 'border-red-100 bg-red-50 hover:border-red-300' : ''}
                        ${slot.status === 'maintenance' ? 'border-orange-100 bg-orange-50 hover:border-orange-300' : ''}
                    `}
                >
                  {/* Top Right Status Dot */}
                  <div
                    className={`absolute top-3 right-3 w-2 h-2 rounded-full 
                        ${slot.status === 'available' ? 'bg-green-500' : ''}
                        ${slot.status === 'occupied' ? 'bg-red-500' : ''}
                        ${slot.status === 'maintenance' ? 'bg-orange-500' : ''}
                    `}
                  />

                  <div>
                    <span className="text-xl font-bold text-slate-700">{slot.name}</span>
                    <p className="text-xs text-muted-foreground uppercase font-semibold mt-1">
                      {slot.type}
                    </p>
                  </div>

                  {/* Bottom Status Text */}
                  <div className="mt-2">
                    {slot.status === 'occupied' ? (
                      <div className="flex items-center text-red-700 font-medium text-sm truncate">
                        <Ship className="w-3 h-3 mr-1 shrink-0" />
                        <span className="truncate">
                          {slot.activeVesselName || 'Unknown Vessel'}
                        </span>
                      </div>
                    ) : slot.status === 'maintenance' ? (
                      <div className="flex items-center text-orange-700 font-medium text-sm">
                        <AlertTriangle className="w-3 h-3 mr-1" /> Maintenance
                      </div>
                    ) : (
                      <span className="text-green-600 text-sm font-medium">Available</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
