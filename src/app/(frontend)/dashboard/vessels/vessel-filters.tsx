'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useDebounce } from 'use-debounce'
import { useEffect, useState } from 'react'

export function VesselFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Initialize state with URL params
  const [text, setText] = useState(searchParams.get('search') || '')
  const [query] = useDebounce(text, 500)
  const status = searchParams.get('status') || 'all'

  // Sync Search Text to URL
  useEffect(() => {
    const params = new URLSearchParams(searchParams)
    if (query) {
      params.set('search', query)
    } else {
      params.delete('search')
    }
    params.set('page', '1') // Reset to page 1 on new search
    router.push(`?${params.toString()}`)
  }, [query, router, searchParams])

  // Sync Dropdown to URL
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
    <div className="flex flex-col sm:flex-row gap-4 mb-4">
      <Input
        placeholder="Search by name or reg number..."
        className="max-w-sm"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <Select value={status} onValueChange={handleStatusChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="active">Active (In Harbor)</SelectItem>
          <SelectItem value="pending">Pending Approval</SelectItem>
          <SelectItem value="payment_pending">Unpaid Bills</SelectItem>
          <SelectItem value="departed">Departed (History)</SelectItem>
          <SelectItem value="rejected">Rejected</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
