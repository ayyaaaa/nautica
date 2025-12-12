'use client'

import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Search } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useDebouncedCallback } from 'use-debounce'

export function VesselFilters() {
  const searchParams = useSearchParams()
  const { replace } = useRouter()

  // Debounce search so we don't reload on every keystroke
  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams)
    if (term) {
      params.set('search', term)
    } else {
      params.delete('search')
    }
    params.set('page', '1') // Reset to page 1
    replace(`/dashboard/vessels?${params.toString()}`)
  }, 300)

  const handleStatusChange = (status: string) => {
    const params = new URLSearchParams(searchParams)
    if (status && status !== 'all') {
      params.set('status', status)
    } else {
      params.delete('status')
    }
    params.set('page', '1')
    replace(`/dashboard/vessels?${params.toString()}`)
  }

  return (
    <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
      {/* Status Tabs */}
      <Tabs
        defaultValue={searchParams.get('status') || 'all'}
        onValueChange={handleStatusChange}
        className="w-full md:w-auto"
      >
        <TabsList>
          <TabsTrigger value="all">All Vessels</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="payment_pending">Unpaid</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Search Input */}
      <div className="relative w-full md:w-72">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or reg no..."
          className="pl-8 bg-background"
          onChange={(e) => handleSearch(e.target.value)}
          defaultValue={searchParams.get('search')?.toString()}
        />
      </div>
    </div>
  )
}
