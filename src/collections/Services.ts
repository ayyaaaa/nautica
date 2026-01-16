import { CollectionConfig } from 'payload'
import { generateServiceInvoice } from '@/app/actions/billing' // Import the Server Action

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
          pickerAppearance: 'dayAndTime',
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
    {
      name: 'quantity',
      type: 'number',
      label: 'Quantity',
      defaultValue: 1,
      admin: {
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
    // 1. CALCULATION HOOK (Runs before saving to ensure cost is correct)
    beforeChange: [
      async ({ data, req, operation }) => {
        if (data.serviceType) {
          try {
            const serviceTypeId =
              typeof data.serviceType === 'object' ? data.serviceType.id : data.serviceType

            const serviceDoc = await req.payload.findByID({
              collection: 'service-types',
              id: serviceTypeId,
            })

            const rate = serviceDoc.rate || 0
            let taxPercent = 6
            try {
              const settings = await req.payload.findGlobal({ slug: 'site-settings' })
              if (settings && typeof settings.taxPercentage === 'number') {
                taxPercent = settings.taxPercentage
              }
            } catch (err) {}
            if (taxPercent === 0) taxPercent = 6

            const taxMultiplier = 1 + taxPercent / 100

            if (rate > 0) {
              if (data.calculationMode === 'budget' && data.totalCost) {
                const subTotal = data.totalCost / taxMultiplier
                const calculatedQty = subTotal / rate
                data.quantity = parseFloat(calculatedQty.toFixed(2))
              } else if (data.quantity) {
                const subTotal = data.quantity * rate
                const costWithTax = subTotal * taxMultiplier
                data.totalCost = parseFloat(costWithTax.toFixed(2))
              }
            }
          } catch (error) {
            console.error('❌ Calculation Error:', error)
          }
        }
        return data
      },
    ],
    // 2. INVOICE GENERATION HOOK (Runs after saving)
    afterChange: [
      async ({ doc, previousDoc }) => {
        // Trigger if status changes TO 'payment_pending'
        if (doc.status === 'payment_pending' && previousDoc?.status !== 'payment_pending') {
          try {
            console.log(`🧾 Generating service invoice for ${doc.id}...`)
            await generateServiceInvoice(doc.id)
          } catch (err) {
            console.error('❌ Service Invoice Generation Failed:', err)
          }
        }
      },
    ],
  },
}
