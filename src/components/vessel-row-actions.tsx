'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, FileText, Download, RotateCw } from 'lucide-react'
import { ViewVesselDialog } from '../app/(frontend)/dashboard/vessels/view-vessel-dialog'
import { AssignBerthModal } from '../app/(frontend)/dashboard/vessels/assign-berth-modal'
import { DepartButton } from '../app/(frontend)/dashboard/vessels/depart-button'
import { reAdmitVessel } from '@/app/(frontend)/dashboard/vessels/actions'

export function VesselRowActions({
  vessel,
  availableSlots,
}: {
  vessel: any
  availableSlots: any[]
}) {
  const [showViewModal, setShowViewModal] = useState(false)

  return (
    <>
      <div className="flex justify-end items-center gap-2">
        {/* 1. APPROVE & DOCK */}
        {vessel.status === 'pending' && (
          <AssignBerthModal
            vesselId={vessel.id}
            vesselName={vessel.name}
            availableSlots={availableSlots}
          />
        )}

        {/* 2. DEPART */}
        {vessel.status === 'active' && vessel.registrationType !== 'permanent' && (
          <DepartButton id={vessel.id} name={vessel.name} />
        )}

        {/* 3. RE-ADMIT */}
        {vessel.status === 'departed' && (
          <form action={() => reAdmitVessel(vessel.id)}>
            <Button
              size="sm"
              variant="outline"
              className="h-8 border-dashed text-muted-foreground hover:text-primary hover:border-primary"
            >
              <RotateCw className="mr-1 h-3 w-3" /> Re-Admit
            </Button>
          </form>
        )}

        {/* 4. DROPDOWN MENU */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0 text-muted-foreground">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>

            {/* VIEW DETAILS TRIGGER */}
            <DropdownMenuItem onSelect={() => setShowViewModal(true)}>
              <FileText className="mr-2 h-4 w-4" /> View Details
            </DropdownMenuItem>
            {/* DOWNLOAD PERMIT */}
            {vessel.status === 'active' && (
              <DropdownMenuItem asChild>
                {/* OLD LINK: href={`/portal/permit/${vessel.id}`} */}

                {/* NEW LINK: Points to API for direct download */}
                <a href={`/api/permit/${vessel.id}`} target="_blank" download>
                  <Download className="mr-2 h-4 w-4" /> Download Permit
                </a>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* THE POPUP DIALOG */}
      <ViewVesselDialog vessel={vessel} open={showViewModal} onOpenChange={setShowViewModal} />
    </>
  )
}
