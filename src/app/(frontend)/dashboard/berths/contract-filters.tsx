'use client'

import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useDebouncedCallback } from 'use-debounce'

export function ContractFilters() {
  const searchParams = useSearchParams()
  const router = useRouter()

  // We use specific keys 'cStatus' and 'cSearch' to avoid conflict with the Map filters
  const currentStatus = searchParams.get('cStatus') || 'all'

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams)
    if (term) params.set('cSearch', term)
    else params.delete('cSearch')
    router.replace(`?${params.toString()}`)
  }, 300)

  const handleStatusChange = (status: string) => {
    const params = new URLSearchParams(searchParams)
    if (status && status !== 'all') params.set('cStatus', status)
    else params.delete('cStatus')
    router.replace(`?${params.toString()}`)
  }

  const filters = [
    { label: 'All', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Completed', value: 'completed' },
    { label: 'Cancelled', value: 'cancelled' },
  ]

  return (
    <div className="flex flex-col gap-4">
      {/* Search Bar */}
      <div className="relative w-full sm:max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search contracts by vessel name..."
          className="pl-9 bg-background border-muted"
          onChange={(e) => handleSearch(e.target.value)}
          defaultValue={searchParams.get('cSearch')?.toString()}
        />
      </div>

      {/* Pill Filters */}
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
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
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
