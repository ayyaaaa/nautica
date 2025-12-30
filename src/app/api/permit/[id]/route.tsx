import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { renderToStream } from '@react-pdf/renderer' // <--- Changed import
import { PermitDocument } from '@/components/pdfs/PermitDocuments'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const payload = await getPayload({ config: configPromise })

  const { user } = await payload.auth({ headers: req.headers })
  if (!user || user.role !== 'admin') return new NextResponse('Unauthorized', { status: 401 })

  const vessel = await payload.findByID({ collection: 'vessels', id, depth: 1 })
  if (!vessel) return new NextResponse('Not Found', { status: 404 })

  const permitId = String(vessel.id).substring(0, 8).toUpperCase()

  // Use renderToStream directly
  const stream = await renderToStream(<PermitDocument vessel={vessel} permitId={permitId} />)

  return new NextResponse(stream as unknown as BodyInit, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="Permit-${vessel.registrationNumber}.pdf"`,
    },
  })
}
