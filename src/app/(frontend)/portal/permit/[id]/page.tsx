import { getPermitData } from './actions'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { PermitPDFViewer } from './pdf-viewer-client'
import QRCode from 'qrcode' // <--- Import QRCode

export default async function PermitPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const data = await getPermitData(id)

  if (!data || data.error || !data.vessel) {
    redirect('/portal')
  }

  const { vessel } = data
  const permitId = String(vessel.id).substring(0, 8).toUpperCase()

  // 1. GENERATE QR CODE
  const qrData = `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/portal/permit/${vessel.id}`
  const qrCodeBase64 = await QRCode.toDataURL(qrData)

  return (
    <div className="min-h-screen bg-muted/10 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <Button variant="ghost" asChild>
            <Link href="/portal">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Fleet
            </Link>
          </Button>
          <div className="text-sm text-muted-foreground">Official Document Preview</div>
        </div>

        {/* 2. PASS TO VIEWER */}
        <PermitPDFViewer vessel={vessel} permitId={permitId} qrCodeBase64={qrCodeBase64} />
      </div>
    </div>
  )
}
