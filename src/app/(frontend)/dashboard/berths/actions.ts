'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'

export async function getBerthData() {
  const payload = await getPayload({ config: configPromise })

  // 1. Fetch All Physical Slots
  const { docs: slots } = await payload.find({
    collection: 'berthing-slots',
    limit: 1000,
    sort: 'name',
    depth: 1,
  })

  // 2. Fetch Active Contracts
  const { docs: activeContracts } = await payload.find({
    collection: 'berths',
    where: {
      status: { equals: 'active' },
    },
    limit: 1000,
    depth: 1, // Ensure nested fields like 'vessel' and 'assignedSlot' are populated
  })

  // 3. Fetch Recent History (for the table)
  const { docs: historyContracts } = await payload.find({
    collection: 'berths',
    where: {
      status: { not_equals: 'active' },
    },
    sort: '-startTime',
    limit: 50,
    depth: 1,
  })

  const contracts = [...activeContracts, ...historyContracts]

  // 4. Calculate Stats
  const stats = {
    total: slots.length,
    occupied: slots.filter((s) => s.status === 'occupied').length,
    available: slots.filter((s) => s.status === 'available').length,
    maintenance: slots.filter((s) => s.status === 'maintenance').length,
  }

  // 5. Group Slots by Zone & Match Active Contracts
  const zoneMap: Record<string, any[]> = {}

  slots.forEach((slot: any) => {
    const zoneKey = slot.zone || 'Unassigned'
    if (!zoneMap[zoneKey]) zoneMap[zoneKey] = []

    // --- THE FIX: ROBUST MATCHING LOGIC ---
    const activeContract = contracts.find((c: any) => {
      // Must be active
      if (c.status !== 'active') return false

      // Safely extract the ID from the contract
      // (Handle cases where it is an object OR just an ID)
      const contractSlotId =
        c.assignedSlot && typeof c.assignedSlot === 'object' ? c.assignedSlot.id : c.assignedSlot

      // Compare as STRINGS to avoid number vs string mismatches
      return String(contractSlotId) === String(slot.id)
    })

    zoneMap[zoneKey].push({
      ...slot,
      activeVesselName: activeContract ? (activeContract.vessel as any)?.name : null,
      // Pass the found contract ID to the frontend so it knows which one to open
      activeContractId: activeContract?.id,
    })
  })

  return { stats, zoneMap, contracts }
}
