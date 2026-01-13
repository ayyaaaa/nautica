'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'

type BerthFilters = {
  // Map Filters
  search?: string
  status?: string

  // Contract Filters
  contractSearch?: string
  contractStatus?: string
}

export async function getBerthData(filters?: BerthFilters) {
  const payload = await getPayload({ config: configPromise })

  // =========================================================
  // 1. DATA FOR THE MAP (Physical Slots)
  // =========================================================
  const slotQuery: any = {}

  // A. Map Status Filter
  if (filters?.status && filters.status !== 'all') {
    slotQuery.status = { equals: filters.status }
  }

  // B. Map Search Filter (Slot by Vessel Name)
  if (filters?.search) {
    const { docs: matchingVessels } = await payload.find({
      collection: 'vessels',
      where: { name: { like: filters.search } },
      limit: 50,
    })
    const vesselIds = matchingVessels.map((v) => v.id)

    const { docs: matchingContracts } = await payload.find({
      collection: 'berths',
      where: {
        and: [{ status: { equals: 'active' } }, { vessel: { in: vesselIds } }],
      },
      limit: 100,
    })

    const targetSlotIds = matchingContracts.map((c) =>
      typeof c.assignedSlot === 'object' ? c.assignedSlot.id : c.assignedSlot,
    )

    if (targetSlotIds.length > 0) {
      slotQuery.id = { in: targetSlotIds }
    } else {
      slotQuery.id = { equals: 'no-match' }
    }
  }

  // Fetch Slots (Filtered)
  const { docs: slots } = await payload.find({
    collection: 'berthing-slots',
    where: slotQuery,
    limit: 1000,
    sort: 'name',
    depth: 1,
  })

  // Fetch Active Contracts (For Map Dots)
  const { docs: activeContracts } = await payload.find({
    collection: 'berths',
    where: { status: { equals: 'active' } },
    limit: 1000,
    depth: 1,
  })

  // =========================================================
  // 2. DATA FOR THE TABLE (Filtered Contracts)
  // =========================================================
  const contractQuery: any = {}

  // A. Contract Status Filter (active/completed/cancelled)
  if (filters?.contractStatus && filters.contractStatus !== 'all') {
    contractQuery.status = { equals: filters.contractStatus }
  }

  // B. Contract Search Filter (By Vessel Name)
  if (filters?.contractSearch) {
    const { docs: matchingVessels } = await payload.find({
      collection: 'vessels',
      where: { name: { like: filters.contractSearch } },
      limit: 100,
    })
    const vesselIds = matchingVessels.map((v) => v.id)

    if (vesselIds.length > 0) {
      contractQuery.vessel = { in: vesselIds }
    } else {
      contractQuery.id = { equals: 'no-match' }
    }
  }

  // Fetch Filtered History
  const { docs: tableContracts } = await payload.find({
    collection: 'berths',
    where: contractQuery,
    sort: '-startTime',
    limit: 50,
    depth: 1,
  })

  // =========================================================
  // 3. COMPILE RESULTS
  // =========================================================
  const stats = {
    total: slots.length,
    occupied: slots.filter((s) => s.status === 'occupied').length,
    available: slots.filter((s) => s.status === 'available').length,
    maintenance: slots.filter((s) => s.status === 'maintenance').length,
  }

  const zoneMap: Record<string, any[]> = {}

  slots.forEach((slot: any) => {
    const zoneKey = slot.zone || 'Unassigned'
    if (!zoneMap[zoneKey]) zoneMap[zoneKey] = []

    const activeContract = activeContracts.find((c: any) => {
      const contractSlotId =
        c.assignedSlot && typeof c.assignedSlot === 'object' ? c.assignedSlot.id : c.assignedSlot
      return String(contractSlotId) === String(slot.id)
    })

    zoneMap[zoneKey].push({
      ...slot,
      activeVesselName: activeContract ? (activeContract.vessel as any)?.name : null,
      activeContractId: activeContract?.id,
    })
  })

  return { stats, zoneMap, tableContracts, mapContracts: activeContracts }
}
