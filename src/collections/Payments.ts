import type { CollectionConfig } from 'payload'

export const Payments: CollectionConfig = {
  slug: 'payments',
  admin: {
    useAsTitle: 'invoiceNumber',
    defaultColumns: ['invoiceNumber', 'amount', 'status', 'method'],
  },
  fields: [
    {
      name: 'invoiceNumber',
      type: 'text',
      unique: true,
      // You can add a hook here later to auto-generate "INV-001"
    },
    {
      name: 'vessel',
      type: 'relationship',
      relationTo: 'vessels',
      required: true,
    },
    // Polymorphic-style references (Link to Berth OR Service)
    {
      name: 'relatedBerth',
      type: 'relationship',
      relationTo: 'berths',
      label: 'Related Berth Booking',
      admin: {
        condition: (data) => !data.relatedService, // Hide if service is selected
      },
    },
    {
      name: 'relatedService',
      type: 'relationship',
      relationTo: 'services',
      label: 'Related Service Request',
      admin: {
        condition: (data) => !data.relatedBerth, // Hide if berth is selected
      },
    },
    {
      name: 'amount',
      type: 'number',
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      options: ['unpaid', 'paid', 'overdue', 'cancelled'],
      defaultValue: 'unpaid',
      required: true,
    },
    {
      name: 'method',
      type: 'select',
      options: ['cash', 'bank_transfer', 'online', 'cheque'],
    },
    {
      name: 'paidAt',
      type: 'date',
      admin: {
        condition: (data) => data.status === 'paid',
      },
    },
    {
      name: 'proofOfPayment',
      type: 'upload',
      relationTo: 'media',
      label: 'Receipt / Transfer Slip',
    },
  ],
}
