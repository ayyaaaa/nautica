'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Wifi } from 'lucide-react'

export function LiveRefresher({ intervalMs = 5000 }: { intervalMs?: number }) {
  const router = useRouter()
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setIsRefreshing(true)
      router.refresh()

      // Turn off the "refreshing" animation after 1 sec
      setTimeout(() => setIsRefreshing(false), 1000)
    }, intervalMs)

    return () => clearInterval(interval)
  }, [router, intervalMs])

  // Optional: Visual Indicator (Bottom Right)
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div
        className={`
        flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium shadow-sm transition-all duration-500
        ${
          isRefreshing
            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
            : 'bg-white/80 text-muted-foreground border border-transparent hover:border-border backdrop-blur-sm'
        }
      `}
      >
        <div className={`relative flex h-2 w-2`}>
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 ${isRefreshing ? 'duration-500' : 'duration-[2000ms]'}`}
          ></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </div>
        <span>Live</span>
        {isRefreshing && <Wifi className="w-3 h-3 animate-pulse" />}
      </div>
    </div>
  )
}
