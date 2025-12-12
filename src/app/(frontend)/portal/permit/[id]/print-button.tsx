'use client' // <--- This marks it as a Client Component

import { Button } from '@/components/ui/button'
import { Printer } from 'lucide-react'

export function PrintButton() {
  return (
    <Button onClick={() => window.print()} className="bg-primary hover:bg-primary/90 text-white">
      <Printer className="mr-2 h-4 w-4" /> Print Permit
    </Button>
  )
}
