'use client'

import { useState } from 'react'
import { processDeparture } from './actions'
import { Button } from '@/components/ui/button'
import { Anchor, Loader2, LogOut } from 'lucide-react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

export function DepartButton({ id, name }: { id: number; name: string }) {
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  const handleDepart = async () => {
    setLoading(true)
    try {
      const res = await processDeparture(id)

      if (res.success) {
        toast.success('Departure Successful', {
          description: res.message, // Shows: "Bill: MVR 1,500"
          duration: 5000,
        })
        setOpen(false)
      } else {
        toast.error('Action Failed', { description: res.error })
      }
    } catch (error) {
      toast.error('System Error', { description: 'Could not connect to server.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="h-8 border-amber-200 text-amber-700 hover:bg-amber-50 hover:text-amber-800 transition-colors"
        >
          <LogOut className="mr-1.5 h-3.5 w-3.5" />
          Depart & Bill
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2 text-amber-600 mb-2">
            <div className="p-2 bg-amber-100 rounded-full">
              <Anchor className="h-5 w-5" />
            </div>
            <AlertDialogTitle>Confirm Departure</AlertDialogTitle>
          </div>

          <AlertDialogDescription className="space-y-3">
            <p>
              Are you sure you want to process the departure for{' '}
              <span className="font-semibold text-foreground">{name}</span>?
            </p>
            <ul className="list-disc pl-5 space-y-1 text-sm bg-muted/50 p-3 rounded-md border">
              <li>The berthing timer will stop immediately.</li>
              <li>
                The berth slot will be marked as{' '}
                <span className="text-green-600 font-medium">Available</span>.
              </li>
              <li>A final bill will be calculated and assigned to the owner.</li>
            </ul>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="mt-4">
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              handleDepart()
            }}
            className="bg-amber-600 hover:bg-amber-700 text-white shadow-sm"
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm Departure
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
