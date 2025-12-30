'use client'

import { PDFViewer } from '@react-pdf/renderer'
import { PermitDocument } from '@/components/pdfs/PermitDocuments'

interface PermitPDFViewerProps {
  vessel: any
  permitId: string
  qrCodeBase64: string // <--- Added this prop
}

export function PermitPDFViewer({ vessel, permitId, qrCodeBase64 }: PermitPDFViewerProps) {
  return (
    <div className="w-full h-[calc(100vh-100px)]">
      <PDFViewer width="100%" height="100%" className="border-none">
        <PermitDocument
          vessel={vessel}
          permitId={permitId}
          qrCodeBase64={qrCodeBase64} // <--- Pass it down to the document
        />
      </PDFViewer>
    </div>
  )
}
