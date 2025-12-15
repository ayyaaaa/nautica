import { CollectionConfig } from 'payload'

export const Services: CollectionConfig = {
  slug: 'services',
  admin: {
    useAsTitle: 'serviceType',
    defaultColumns: ['serviceType', 'vessel', 'status', 'totalCost', 'requestDate'],
  },
  access: {
    read: ({ req: { user } }) => {
      if (user && user.role === 'admin') return true
      return Boolean(user)
    },
    create: () => true,
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user && user.role === 'admin'),
  },
  fields: [
    {
      name: 'serviceType',
      type: 'select',
      options: [
        { label: 'Cleaning', value: 'cleaning' },
        { label: 'Water Supply', value: 'water' },
        { label: 'Fuel Supply', value: 'fuel' },
        { label: 'Waste Disposal', value: 'waste' },
        { label: 'Electric Supply', value: 'electric' },
        { label: 'Loading / Unloading', value: 'loading' },
      ],
      required: true,
    },
    {
      name: 'vessel',
      type: 'relationship',
      relationTo: 'vessels',
      required: true,
      hasMany: false,
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Requested', value: 'requested' },
        { label: 'Awaiting Payment', value: 'payment_pending' }, // <--- ADDED THIS
        { label: 'In Progress', value: 'in_progress' },
        { label: 'Completed', value: 'completed' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
      defaultValue: 'requested',
      required: true,
    },
    {
      name: 'quantity',
      type: 'number',
      label: 'Quantity (Hours/Liters/Tons)',
      defaultValue: 1,
      required: true,
    },
    {
      name: 'totalCost',
      type: 'number',
      label: 'Total Cost (MVR)',
      admin: {
        description: 'Calculated based on Site Settings rates.',
      },
    },
    {
      name: 'paymentStatus',
      type: 'select',
      defaultValue: 'unpaid',
      options: [
        { label: 'Unpaid', value: 'unpaid' },
        { label: 'Paid', value: 'paid' },
        { label: 'Waived', value: 'waived' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'requestDate',
      type: 'date',
      defaultValue: () => new Date().toISOString(),
      required: true,
    },
    {
      name: 'notes',
      type: 'textarea',
      label: 'Operator Notes / Instructions',
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, req }) => {
        if (data.serviceType && data.quantity) {
          const settings = await req.payload.findGlobal({ slug: 'site-settings' })
          let rate = 0

          switch (data.serviceType) {
            case 'cleaning':
              rate = settings.cleaningRate || 150
              break
            case 'water':
              rate = settings.waterRate || 50
              break
            case 'fuel':
              rate = settings.fuelRate || 25
              break
            case 'waste':
              rate = settings.wasteRate || 200
              break
            case 'electric':
              rate = settings.electricRate || 5
              break
            case 'loading':
              rate = settings.loadingRate || 100
              break
          }

          if (!data.totalCost) {
            data.totalCost = rate * data.quantity
          }
        }
        return data
      },
    ],
  },
}
