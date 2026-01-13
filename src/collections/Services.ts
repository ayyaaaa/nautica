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
    beforeChange: [
      async ({ data, req, operation }) => {
        // Only run if service type is selected
        if (data.serviceType) {
          try {
            // 1. Fetch the Rate from the Linked Service Type
            const serviceTypeId =
              typeof data.serviceType === 'object' ? data.serviceType.id : data.serviceType

            const serviceDoc = await req.payload.findByID({
              collection: 'service-types',
              id: serviceTypeId,
            })

            const rate = serviceDoc.rate || 0

            // 2. Fetch Tax Percentage from Global Settings
            // We use try/catch specifically for this fetch to ensure it doesn't crash
            let taxPercent = 6 // DEFAULT FALLBACK
            try {
              const settings = await req.payload.findGlobal({
                slug: 'site-settings',
              })
              if (settings && typeof settings.taxPercentage === 'number') {
                taxPercent = settings.taxPercentage
              }
            } catch (err) {
              console.warn('⚠️ Could not fetch Site Settings, using default 6% tax.')
            }

            // If Tax is 0, assume it's unset and force 6 (since your frontend shows 6%)
            if (taxPercent === 0) taxPercent = 6

            const taxMultiplier = 1 + taxPercent / 100

            // --- DEBUG LOGS (Check your Terminal!) ---
            console.log(`\n🧮 CALCULATION DEBUG [${data.calculationMode}]`)
            console.log(`Rate: ${rate} | Tax: ${taxPercent}% | Multiplier: ${taxMultiplier}`)
            console.log(`Input -> Cost: ${data.totalCost}, Qty: ${data.quantity}`)

            // 3. Perform Calculation
            if (rate > 0) {
              if (data.calculationMode === 'budget' && data.totalCost) {
                // --- REVERSE MODE (Matches Frontend "By Budget") ---
                // Logic: 100 MVR Total -> Remove Tax -> Divide by Rate
                const subTotal = data.totalCost / taxMultiplier
                const calculatedQty = subTotal / rate

                data.quantity = parseFloat(calculatedQty.toFixed(2))
                console.log(`✅ Calculated Qty: ${data.quantity}`)
              } else if (data.quantity) {
                // --- STANDARD MODE (Matches Frontend "By Quantity") ---
                // Logic: 5.8 L * Rate -> Add Tax -> Total MVR
                const subTotal = data.quantity * rate
                const costWithTax = subTotal * taxMultiplier

                data.totalCost = parseFloat(costWithTax.toFixed(2))
                console.log(`✅ Calculated Cost: ${data.totalCost}`)
              }
            }
          } catch (error) {
            console.error('❌ Calculation Error:', error)
          }
        }
        return data
      },
    ],
  },
}
