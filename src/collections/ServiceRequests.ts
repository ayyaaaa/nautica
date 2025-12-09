import type { CollectionConfig } from 'payload'

export const ServiceRequests: CollectionConfig = {
  slug: 'service-requests',
  admin: {
    useAsTitle: 'serviceType',
    defaultColumns: ['serviceType', 'vessel', 'status', 'totalPrice'],
  },
  fields: [
    {
      name: 'vessel',
      type: 'relationship',
      relationTo: 'vessels',
      required: true,
    },
    {
      name: 'serviceType',
      type: 'select',
      options: [
        'Cleaning',
        'Passenger Pickup',
        'Cargo Loading',
        'Fresh Water',
        'Fuel Supply',
        'Waste Disposal',
        'Vehicle Support',
      ],
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      options: ['requested', 'in_progress', 'completed', 'cancelled'],
      defaultValue: 'requested',
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Additional Instructions',
    },
    {
      name: 'requestDate',
      type: 'date',
      defaultValue: () => new Date(),
    },
    // Financials
    {
      type: 'row',
      fields: [
        { name: 'unitPrice', type: 'number', required: true },
        { name: 'quantity', type: 'number', defaultValue: 1 },
        {
          name: 'totalPrice',
          type: 'number',
          admin: { description: 'Unit Price × Quantity' },
          hooks: {
            // Auto-calculate total before saving
            beforeChange: [
              ({ siblingData }) => {
                if (siblingData.unitPrice && siblingData.quantity) {
                  return siblingData.unitPrice * siblingData.quantity
                }
                return 0
              },
            ],
          },
        },
      ],
    },
  ],
}
