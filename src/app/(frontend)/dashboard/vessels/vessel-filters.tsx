'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { useDebounce } from 'use-debounce'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

export function VesselFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Initialize state with URL params
  const [text, setText] = useState(searchParams.get('search') || '')
  const [query] = useDebounce(text, 500)
  const status = searchParams.get('status') || 'all'

  // Tabs Configuration
  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'active', label: 'Active' },
    { id: 'pending', label: 'Pending' },
    { id: 'payment_pending', label: 'Unpaid' },
    { id: 'departed', label: 'Departed' },
    { id: 'rejected', label: 'Rejected' },
  ]

  // Sync Search Text to URL
  useEffect(() => {
    const params = new URLSearchParams(searchParams)
    if (query) {
      params.set('search', query)
    } else {
      params.delete('search')
    }
    params.set('page', '1')
    router.push(`?${params.toString()}`)
  }, [query, router, searchParams])

  // Handle Tab Click
  const handleStatusChange = (val: string) => {
    const params = new URLSearchParams(searchParams)
    if (val && val !== 'all') {
      params.set('status', val)
    } else {
      params.delete('status')
    }
    params.set('page', '1')
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="space-y-4 mb-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {/* TABS ROW */}
        <div className="flex items-center gap-1 p-1 bg-muted/30 border rounded-lg overflow-x-auto no-scrollbar max-w-full">
          {tabs.map((tab) => {
            const isActive = status === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => handleStatusChange(tab.id)}
                className={cn(
                  'px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-200 whitespace-nowrap',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-md' // Brand Color (Teal)
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted',
                )}
              >
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* SEARCH INPUT */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search vessels..."
            className="pl-9 bg-background border-muted-foreground/20 focus-visible:ring-primary"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>
      </div>

      {/* Separator */}
      <div className="h-px bg-border/40" />
    </div>
  )
}
