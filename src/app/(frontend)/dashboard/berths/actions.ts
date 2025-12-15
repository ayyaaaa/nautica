'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'

export async function getBerthData() {
  const payload = await getPayload({ config: configPromise })

  // 1. Fetch All Physical Slots (The Map)
  const { docs: slots } = await payload.find({
    collection: 'berthing-slots',
    limit: 1000,
    sort: 'name',
    depth: 1, // Populate current vessel if linked (optional in your schema)
  })

  // 2. Fetch History Log (Contracts)
  // We want to see who is currently in a berth based on the history log too
  const { docs: contracts } = await payload.find({
    collection: 'berths',
    sort: '-startTime',
    limit: 50,
    depth: 1, // Populate vessel and slot details
  })

  // 3. Calculate Stats
  const stats = {
    total: slots.length,
    occupied: slots.filter((s) => s.status === 'occupied').length,
    available: slots.filter((s) => s.status === 'available').length,
    maintenance: slots.filter((s) => s.status === 'maintenance').length,
  }

  // 4. Group Slots by Zone (for the Grid View)
  // Map internal values (block_a_zone_a) to readable titles
  const zoneMap: Record<string, any[]> = {}

  slots.forEach((slot: any) => {
    const zoneKey = slot.zone || 'Unassigned'
    if (!zoneMap[zoneKey]) zoneMap[zoneKey] = []

    // Attempt to find the Active Vessel Name for this slot
    // We look for an active contract for this slot ID
    const activeContract = contracts.find(
      (c: any) =>
        c.status === 'active' &&
        (typeof c.assignedSlot === 'object'
          ? c.assignedSlot.id === slot.id
          : c.assignedSlot === slot.id),
    )

    zoneMap[zoneKey].push({
      ...slot,
      activeVesselName: activeContract ? (activeContract.vessel as any)?.name : null,
    })
  })

  return { stats, zoneMap, contracts }
}
