'use client'

import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useDebouncedCallback } from 'use-debounce'

export function BerthFilters() {
  const searchParams = useSearchParams()
  const router = useRouter()

  // Get current active status (default to 'all')
  const currentStatus = searchParams.get('status') || 'all'

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams)
    if (term) params.set('search', term)
    else params.delete('search')
    router.replace(`?${params.toString()}`)
  }, 300)

  const handleStatusChange = (status: string) => {
    const params = new URLSearchParams(searchParams)
    if (status && status !== 'all') params.set('status', status)
    else params.delete('status')
    router.replace(`?${params.toString()}`)
  }

  // The options for the Live Map
  const filters = [
    { label: 'All', value: 'all' },
    { label: 'Available', value: 'available' },
    { label: 'Occupied', value: 'occupied' },
    { label: 'Maintenance', value: 'maintenance' },
  ]

  return (
    <div className="flex flex-col gap-4">
      {/* 1. Search Bar */}
      <div className="relative w-full sm:max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Find slot by vessel name..."
          className="pl-9 bg-background border-muted"
          onChange={(e) => handleSearch(e.target.value)}
          defaultValue={searchParams.get('search')?.toString()}
        />
      </div>

      {/* 2. Styled Filter Buttons (Pills) */}
      <div className="flex flex-wrap items-center gap-2">
        {filters.map((filter) => {
          const isActive = currentStatus === filter.value
          return (
            <button
              key={filter.value}
              onClick={() => handleStatusChange(filter.value)}
              className={`
                px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200
                ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm' // Active State (Teal)
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50' // Inactive State (Ghost)
                }
              `}
            >
              {filter.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
