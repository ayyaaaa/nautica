'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, CheckCircle2, ChevronDown, Banknote, CreditCard } from 'lucide-react'
import { markAsPaid } from './actions'
import { toast } from 'sonner'

export function MarkPaidButton({
  id,
  type,
  amount,
}: {
  id: string | number
  type: 'vessel' | 'service'
  amount: number
}) {
  const [loading, setLoading] = useState(false)
  const [showTransferDialog, setShowTransferDialog] = useState(false)

  // State for the file upload
  const [transferSlip, setTransferSlip] = useState<File | null>(null)

  // 1. Handle Cash Payment (Same as your original logic)
  const handleCashPay = async () => {
    if (!confirm(`Confirm CASH receipt of MVR ${amount.toLocaleString()}?`)) return

    setLoading(true)
    try {
      // Assuming your action handles simple state changes
      const res = await markAsPaid(id, type, { method: 'cash' })

      if (res.success) {
        toast.success('Payment Recorded', { description: 'Marked as paid via Cash.' })
      } else {
        toast.error('Error', { description: 'Failed to update record.' })
      }
    } catch (error) {
      toast.error('Error', { description: 'Something went wrong.' })
    } finally {
      setLoading(false)
    }
  }

  // 2. Handle Transfer Payment with File Upload
  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!transferSlip) {
      toast.error('Missing File', { description: 'Please upload the transfer slip.' })
      return
    }

    setLoading(true)

    try {
      // Create FormData to send the file to the server
      const formData = new FormData()
      formData.append('file', transferSlip)
      formData.append('id', String(id))
      formData.append('type', type)
      formData.append('method', 'transfer')

      // You will need to update your server action to accept FormData or a specific file arg
      // Example: const res = await markAsPaidWithSlip(formData)
      const res = await markAsPaid(id, type, formData)

      if (res.success) {
        toast.success('Transfer Verified', { description: 'Slip uploaded and marked as paid.' })
        setShowTransferDialog(false) // Close modal
        setTransferSlip(null) // Reset file
      } else {
        toast.error('Error', { description: 'Failed to process transfer.' })
      }
    } catch (error) {
      toast.error('Error', { description: 'Upload failed.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* --- The Dropdown Trigger --- */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="sm"
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white gap-2"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            Mark Paid
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleCashPay} className="cursor-pointer">
            <Banknote className="mr-2 h-4 w-4" />
            Cash Payment
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowTransferDialog(true)} className="cursor-pointer">
            <CreditCard className="mr-2 h-4 w-4" />
            Bank Transfer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* --- The Transfer Popup (Dialog) --- */}
      <Dialog open={showTransferDialog} onOpenChange={setShowTransferDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Upload Transfer Slip</DialogTitle>
            <DialogDescription>
              Upload the proof of payment for MVR {amount.toLocaleString()}.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleTransferSubmit} className="grid gap-4 py-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="slip">Transfer Slip (Image/PDF)</Label>
              <Input
                id="slip"
                type="file"
                accept="image/*,application/pdf"
                onChange={(e) => setTransferSlip(e.target.files?.[0] || null)}
                required
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowTransferDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading || !transferSlip}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirm Transfer
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
