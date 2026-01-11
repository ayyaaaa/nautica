import { CollectionConfig } from 'payload'

export const BerthingSlots: CollectionConfig = {
  slug: 'berthing-slots',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'zone', 'type', 'status'],
    group: 'Harbor Management',
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => Boolean(user && user.role === 'superadmin'),
    update: ({ req: { user } }) => Boolean(user && user.role === 'superadmin'),
    delete: ({ req: { user } }) =>
      Boolean((user && user.role === 'superadmin') || user?.role === 'admin'),
  },
  hooks: {
    beforeChange: [
      async ({ data, req, operation }) => {
        if (operation === 'create') {
          const payload = req.payload

          const prefixMap: Record<string, string> = {
            block_a_zone_a: 'BAZA',
            block_a_zone_b: 'BAZB',
            block_a_zone_c: 'BAZC',
            block_a_zone_d: 'BAZD',
            block_a_zone_e: 'BAZE',
            zone_t: 'BTZT',
          }

          const prefix = prefixMap[data.zone] || 'UNK'

          const { docs } = await payload.find({
            collection: 'berthing-slots',
            where: {
              name: { like: prefix },
            },
            sort: '-name',
            limit: 1,
          })

          let nextNum = 1

          // FIX: Added explicit check "&& docs[0].name" to satisfy TypeScript
          if (docs.length > 0 && docs[0].name) {
            const lastId = docs[0].name as string // Cast to string to be safe

            const numPart = lastId.replace(prefix, '')
            const lastNum = parseInt(numPart, 10)
            if (!isNaN(lastNum)) {
              nextNum = lastNum + 1
            }
          }

          const formattedNum = nextNum.toString().padStart(2, '0')
          data.name = `${prefix}${formattedNum}`
        }

        return data
      },
    ],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Slot Number / Name',
      admin: {
        readOnly: true,
        description: 'Auto-generated (e.g., BAZA01)',
      },
      unique: true,
    },
    {
      name: 'zone',
      type: 'select',
      required: true,
      options: [
        { label: 'Block A - Zone A', value: 'block_a_zone_a' },
        { label: 'Block A - Zone B', value: 'block_a_zone_b' },
        { label: 'Block A - Zone C', value: 'block_a_zone_c' },
        { label: 'Block A - Zone D', value: 'block_a_zone_d' },
        { label: 'Block A - Zone E', value: 'block_a_zone_e' },
        { label: 'T-Jetty (Temporary Zone)', value: 'zone_t' },
      ],
    },
    {
      name: 'type',
      type: 'select',
      label: 'Designation',
      required: true,
      options: [
        { label: 'Permanent (Monthly/Yearly)', value: 'permanent' },
        { label: 'Temporary (Daily/Hourly)', value: 'temporary' },
      ],
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'available',
      options: [
        { label: 'Available', value: 'available' },
        { label: 'Occupied', value: 'occupied' },
        { label: 'Maintenance', value: 'maintenance' },
      ],
    },
  ],
}
