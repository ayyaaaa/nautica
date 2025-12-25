// src/collections/Payments.ts
import type { CollectionConfig } from 'payload'

export const Payments: CollectionConfig = {
  slug: 'payments', // This matches the collection name used in actions
  admin: {
    useAsTitle: 'invoiceNumber',
    defaultColumns: ['invoiceNumber', 'description', 'amount', 'status', 'paidAt'],
  },
  access: {
    read: () => true,
    create: () => true,
  },
  fields: [
    {
      name: 'invoiceNumber',
      type: 'text',
      // We will generate this in the Server Action (e.g., INV-1002)
    },
    {
      name: 'vessel',
      type: 'relationship',
      relationTo: 'vessels',
      required: true,
    },
    {
      name: 'description', // <--- ADDED: Makes table display much easier
      type: 'text',
      required: true,
      label: 'Transaction Description',
    },
    // Polymorphic-style references
    {
      name: 'relatedBerth',
      type: 'relationship',
      relationTo: 'berths', // Ensure you have a 'berths' collection
      admin: {
        condition: (data) => !data.relatedService,
      },
    },
    {
      name: 'relatedService',
      type: 'relationship',
      relationTo: 'services',
      admin: {
        condition: (data) => !data.relatedBerth,
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
      options: ['paid', 'void'], // Simplified for a history log
      defaultValue: 'paid',
      required: true,
    },
    {
      name: 'method',
      type: 'select',
      options: ['cash', 'transfer'],
      required: true,
    },
    {
      name: 'paidAt',
      type: 'date',
      required: true,
    },
    {
      name: 'proofOfPayment',
      type: 'upload',
      relationTo: 'media',
    },
  ],
}
