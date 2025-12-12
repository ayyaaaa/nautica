import { getPermitData } from './actions'
import { Button } from '@/components/ui/button'
import { Anchor, ArrowLeft, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { PrintButton } from './print-button' // <--- Import the new button

// Simple QR Code generator
const QRCode = ({ data }: { data: string }) => {
  const src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(data)}`
  return (
    <img src={src} alt="Permit QR" className="w-24 h-24 border-2 border-primary/20 rounded-md" />
  )
}

export default async function PermitPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  let data

  try {
    data = await getPermitData(id)
  } catch (e) {
    redirect('/portal')
  }

  // 1. Check if data exists
  if (!data || data.error || !data.vessel) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-xl font-bold text-destructive mb-4">Permit Unavailable</h1>
        <p className="mb-4">{data?.error || 'Vessel data not found.'}</p>
        <Button asChild>
          <Link href="/portal">Back to Portal</Link>
        </Button>
      </div>
    )
  }

  const { vessel } = data
  const issueDate = new Date().toLocaleDateString()
  const expiryDate = new Date()
  expiryDate.setFullYear(expiryDate.getFullYear() + 1)

  // 2. Safe Data Extraction
  const operator = vessel.operator as any
  const operatorName = operator?.fullName || 'N/A'
  const operatorPhone = operator?.phone || 'N/A'

  const permitId = String(vessel.id).substring(0, 8).toUpperCase()

  return (
    <div className="min-h-screen bg-muted/20 p-6 md:p-12 print:p-0 print:bg-white">
      {/* Controls (Hidden on Print) */}
      <div className="max-w-3xl mx-auto mb-6 flex justify-between items-center print:hidden">
        <Button variant="ghost" asChild>
          <Link href="/portal">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Fleet
          </Link>
        </Button>

        {/* REPLACED THE OLD BUTTON WITH THE CLIENT COMPONENT */}
        <PrintButton />
      </div>

      {/* Permit Certificate */}
      <div className="max-w-3xl mx-auto bg-white border-[10px] border-double border-primary/20 p-10 shadow-xl relative overflow-hidden print:shadow-none print:border-4 print:w-full print:max-w-none">
        {/* Watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
          <Anchor className="w-96 h-96 text-primary" />
        </div>

        {/* Header */}
        <div className="flex justify-between items-start border-b-2 border-primary/10 pb-6 mb-8 relative z-10">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center text-primary">
              <Anchor className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground uppercase tracking-widest">
                Berthing Permit
              </h1>
              <p className="text-sm text-muted-foreground uppercase tracking-wide">
                Nautica Harbor Authority
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="bg-green-100 text-green-800 border border-green-200 px-3 py-1 rounded-full text-xs font-bold uppercase inline-flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Active
            </div>
            <p className="text-xs text-muted-foreground mt-2">Permit #{permitId}</p>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-x-12 gap-y-8 relative z-10 mb-8">
          <div className="col-span-2 md:col-span-1">
            <Label>Vessel Name</Label>
            <Value>{vessel.name}</Value>
          </div>

          <div className="col-span-2 md:col-span-1">
            <Label>Registration Number</Label>
            <Value>{vessel.registrationNumber}</Value>
          </div>

          <div>
            <Label>Vessel Type</Label>
            <Value>{vessel.vesselType}</Value>
          </div>

          <div>
            <Label>Berthing Type</Label>
            <Value className="capitalize">{vessel.registrationType} Slot</Value>
          </div>

          {/* Check for specs existence explicitly */}
          {vessel.specs ? (
            <>
              <div>
                <Label>Dimensions</Label>
                <Value>
                  {vessel.specs.length || '-'}m x {vessel.specs.width || '-'}m
                </Value>
              </div>
              <div>
                <Label>Fuel Type</Label>
                <Value>{vessel.specs.fuelType || '-'}</Value>
              </div>
            </>
          ) : null}

          <div>
            <Label>Primary Operator</Label>
            <Value>{operatorName}</Value>
          </div>

          <div>
            <Label>Contact</Label>
            <Value>{operatorPhone}</Value>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-muted/10 rounded-xl p-6 border border-primary/10 flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <QRCode data={`PERMIT:${vessel.id}|REG:${vessel.registrationNumber}|STATUS:ACTIVE`} />
            <div>
              <p className="text-xs text-muted-foreground uppercase">Validity Period</p>
              <p className="font-bold text-sm">
                {issueDate} — {expiryDate.toLocaleDateString()}
              </p>
              <p className="text-[10px] text-muted-foreground mt-1 max-w-[200px]">
                This permit must be presented upon request by Harbor Officers.
              </p>
            </div>
          </div>

          <div className="text-center sm:text-right">
            <div className="h-16 w-32 border-b border-black/20 mb-1 mx-auto sm:ml-auto">
              <span
                className="font-script text-2xl text-primary opacity-80 block pt-6"
                style={{ fontFamily: 'serif', fontStyle: 'italic' }}
              >
                Authorized
              </span>
            </div>
            <p className="text-xs font-bold uppercase">Harbor Master</p>
          </div>
        </div>
      </div>

      <div className="text-center mt-8 text-sm text-muted-foreground print:hidden">
        &copy; 2024 Nautica Harbor Management System
      </div>
    </div>
  )
}

// Helper Components
function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1 font-semibold">
      {children}
    </p>
  )
}

function Value({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <p className={`text-lg font-bold text-foreground ${className}`}>{children}</p>
}
