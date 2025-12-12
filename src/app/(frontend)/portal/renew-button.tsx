'use client'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'
import { renewSubscription } from './actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export function RenewButton({ id }: { id: string }) {
  const router = useRouter()

  const handleRenew = async () => {
    const res = await renewSubscription(id)
    if (res.success) {
      toast.info('Subscription Reset', { description: 'Please proceed to payment.' })
      router.refresh()
    }
  }

  return (
    <Button
      onClick={handleRenew}
      className="w-full bg-orange-600 hover:bg-orange-700 text-white"
      size="sm"
    >
      <RefreshCw className="w-4 h-4 mr-2" /> Renew Subscription
    </Button>
  )
}
