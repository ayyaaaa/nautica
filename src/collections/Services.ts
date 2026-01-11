import { CollectionConfig } from 'payload'

export const Services: CollectionConfig = {
  slug: 'services',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['serviceType', 'vessel', 'status', 'totalCost', 'requestDate'],
  },
  access: {
    read: ({ req: { user } }) => {
      if (user && (user.role === 'admin' || user.role === 'superadmin')) return true
      return Boolean(user)
    },
    create: () => true,
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user && user.role === 'superadmin'),
  },
  fields: [
    // 1. Link to the Menu (Dynamic Service Types)
    {
      name: 'serviceType',
      type: 'relationship',
      relationTo: 'service-types',
      required: true,
      hasMany: false,
    },
    {
      name: 'vessel',
      type: 'relationship',
      relationTo: 'vessels',
      required: true,
      hasMany: false,
    },
    // 2. Calculation Mode (The Magic Switch)
    {
      name: 'calculationMode',
      type: 'radio',
      options: [
        { label: 'By Quantity (e.g. 10 Tons)', value: 'quantity' },
        { label: 'By Budget (e.g. 500 MVR)', value: 'budget' },
      ],
      defaultValue: 'quantity',
      admin: {
        layout: 'horizontal',
        description: 'Choose how to calculate the order.',
      },
    },
    {
      name: 'serviceLocation',
      type: 'text',
      label: 'Service Location / Slot',
      admin: {
        description: 'The berthing slot of the vessel at the time of request.',
      },
    },
    {
      name: 'preferredTime',
      type: 'date',
      label: 'Preferred Service Time',
      required: true,
      admin: {
        date: {
          pickerAppearance: 'dayAndTime', // Allows picking time in Admin UI too
        },
      },
    },
    {
      name: 'contactNumber',
      type: 'text',
      label: 'Contact Number',
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
    // 3. Inputs (Quantity & Cost)
    {
      name: 'quantity',
      type: 'number',
      label: 'Quantity',
      defaultValue: 1,
      admin: {
        // Show the unit dynamically (This is a visual helper label)
        description: 'If "By Budget" is selected, this is auto-calculated.',
      },
    },
    {
      name: 'totalCost',
      type: 'number',
      label: 'Total Cost (MVR)',
      admin: {
        description: 'If "By Quantity" is selected, this is auto-calculated.',
      },
    },
    // ... Status fields
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Requested', value: 'requested' },
        { label: 'Awaiting Payment', value: 'payment_pending' },
        { label: 'In Progress', value: 'in_progress' },
        { label: 'Completed', value: 'completed' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
      defaultValue: 'requested',
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
    },
    {
      name: 'requestDate',
      type: 'date',
      defaultValue: () => new Date().toISOString(),
    },
    {
      name: 'notes',
      type: 'textarea',
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, req, operation }) => {
        // Only run if service type is selected
        if (data.serviceType) {
          try {
            // A. Fetch the Rate from the Linked Document
            // (Payload relations are sometimes IDs, sometimes objects, safe check needed)
            const serviceTypeId =
              typeof data.serviceType === 'object' ? data.serviceType.id : data.serviceType

            const serviceDoc = await req.payload.findByID({
              collection: 'service-types',
              id: serviceTypeId,
            })

            const rate = serviceDoc.rate || 0

            // B. Perform Calculation
            if (rate > 0) {
              if (data.calculationMode === 'budget' && data.totalCost) {
                // REVERSE: 1000 MVR / 50 Rate = 20 Units
                const calculatedQty = data.totalCost / rate
                data.quantity = parseFloat(calculatedQty.toFixed(2))
              } else if (data.quantity) {
                // STANDARD: 20 Units * 50 Rate = 1000 MVR
                // Default to standard if mode is quantity OR undefined
                data.totalCost = data.quantity * rate
              }
            }
          } catch (error) {
            console.error('Calculation Error:', error)
          }
        }
        return data
      },
    ],
  },
}
