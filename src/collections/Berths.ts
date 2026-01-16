import { CollectionConfig } from 'payload'
import { generateBerthInvoice } from '@/app/actions/billing' // Import the Server Action

export const Berths: CollectionConfig = {
  slug: 'berths',
  labels: { singular: 'Berth Record', plural: 'Berth Records' },
  admin: {
    useAsTitle: 'id', // Will customize later
    defaultColumns: ['vessel', 'planType', 'status', 'startTime'],
  },
  // --- AUTOMATION HOOKS ---
  hooks: {
    afterChange: [
      async ({ doc, operation }) => {
        // Trigger Invoice ONLY when a new Berth Record is created (Upfront billing)
        if (operation === 'create') {
          try {
            console.log(`🧾 Creating upfront invoice for Berth ${doc.id}...`)
            await generateBerthInvoice(doc.id)
          } catch (err) {
            console.error('❌ Berth Invoice Generation Failed:', err)
          }
        }
      },
    ],
  },
  fields: [
    {
      name: 'vessel',
      type: 'relationship',
      relationTo: 'vessels',
      required: true,
    },
    {
      name: 'planType',
      type: 'select',
      options: [
        { label: 'Hourly', value: 'hourly' },
        { label: 'Daily', value: 'daily' },
        { label: 'Monthly Contract', value: 'monthly' },
        { label: 'Yearly Contract', value: 'yearly' },
      ],
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      options: ['active', 'completed', 'cancelled'],
      defaultValue: 'active',
    },

    // --- Time & Location ---
    {
      type: 'row',
      fields: [
        {
          name: 'startTime',
          type: 'date',
          required: true,
          admin: { date: { pickerAppearance: 'dayAndTime' } },
        },
        { name: 'endTime', type: 'date', admin: { date: { pickerAppearance: 'dayAndTime' } } },
      ],
    },
    {
      name: 'assignedSlot',
      type: 'relationship',
      relationTo: 'berthing-slots', // Links to our new collection
      required: true,
      label: 'Assigned Physical Slot',
    },

    // --- Financials ---
    {
      type: 'group',
      name: 'billing',
      fields: [
        {
          name: 'rateApplied',
          type: 'number',
          label: 'Rate per Unit (MVR)',
          admin: { description: 'The rate at the time of booking' },
        },
        {
          name: 'totalCalculated',
          type: 'number',
          admin: { readOnly: true },
        },
        {
          name: 'isPaid',
          type: 'checkbox',
          defaultValue: false,
        },
      ],
    },
  ],
}
