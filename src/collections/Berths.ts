import { CollectionConfig } from 'payload'

export const Berths: CollectionConfig = {
  slug: 'berths',
  labels: { singular: 'Berth Record', plural: 'Berth Records' },
  admin: {
    useAsTitle: 'id', // Will customize later
    defaultColumns: ['vessel', 'planType', 'status', 'startTime'],
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
      name: 'location',
      label: 'Assigned Slot / Area',
      type: 'text',
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
