import { CollectionConfig } from 'payload'

export const ServiceTypes: CollectionConfig = {
  slug: 'service-types',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'rate', 'unit'],
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => user?.role === 'superadmin',
    update: ({ req: { user } }) => user?.role === 'superadmin',
    delete: ({ req: { user } }) => user?.role === 'superadmin',
  },
  fields: [
    {
      name: 'name', // e.g., "Water Supply"
      type: 'text',
      required: true,
    },
    {
      name: 'rate', // e.g., 50
      type: 'number',
      required: true,
      label: 'Rate (MVR)',
    },
    {
      name: 'unit', // e.g., "Ton", "Hour", "Liter"
      type: 'text',
      required: true,
    },
  ],
}
