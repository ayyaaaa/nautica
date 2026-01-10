import { NextResponse } from 'next/server'
import { renderToStream } from '@react-pdf/renderer'
import { PermitDocument } from '@/components/pdfs/PermitDocuments' // Adjust path as needed
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import QRCode from 'qrcode' // <--- 1. Import this

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }, // Next.js 15 params are async
) {
  const { id } = await params
  const payload = await getPayload({ config: configPromise })

  // 1. Fetch the data
  const vessel = await payload.findByID({
    collection: 'vessels',
    id,
  })

  if (!vessel) {
    return new NextResponse('Vessel not found', { status: 404 })
  }

  // 2. Generate QR Code Data
  // This creates a Base64 string that the PDF renderer can display as an image
  const verificationUrl = `${process.env.NEXT_PUBLIC_SERVER_URL}/verify/permit/${id}`
  const qrCodeBase64 = await QRCode.toDataURL(verificationUrl)

  // 3. Render PDF with the new prop
  const stream = await renderToStream(
    <PermitDocument
      vessel={vessel}
      permitId={id}
      qrCodeBase64={qrCodeBase64} // <--- 3. Pass the missing prop here
    />,
  )

  return new NextResponse(stream as unknown as BodyInit, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="permit-${vessel.registrationNumber}.pdf"`,
    },
  })
}
