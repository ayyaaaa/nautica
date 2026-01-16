import { CollectionConfig } from 'payload'

export const Invoices: CollectionConfig = {
  slug: 'invoices',
  admin: {
    useAsTitle: 'invoiceNumber',
    defaultColumns: ['invoiceNumber', 'vessel', 'grandTotal', 'status', 'issueDate'],
    group: 'Finance',
  },
  access: {
    read: () => true,
    create: () => true,
    update: ({ req: { user } }) => Boolean(user && user.role === 'superadmin'),
    delete: ({ req: { user } }) => Boolean(user && user.role === 'superadmin'),
  },
  fields: [
    {
      name: 'invoiceNumber',
      type: 'text',
      unique: true,
      required: true,
      admin: { readOnly: true },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'issued',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Issued / Pending', value: 'issued' },
        { label: 'Paid', value: 'paid' },
        { label: 'Void', value: 'void' },
      ],
    },
    {
      name: 'vessel',
      type: 'relationship',
      relationTo: 'vessels',
      required: true,
    },
    // --- SOURCE LINKS ---
    {
      name: 'sourceType',
      type: 'select',
      options: ['berth', 'service', 'manual'],
      defaultValue: 'manual',
      admin: { readOnly: true },
    },
    {
      name: 'relatedBerth',
      type: 'relationship',
      relationTo: 'berths',
      admin: { condition: (data) => data.sourceType === 'berth' },
    },
    {
      name: 'relatedService',
      type: 'relationship',
      relationTo: 'services',
      admin: { condition: (data) => data.sourceType === 'service' },
    },
    // --- LINE ITEMS ---
    {
      name: 'lineItems',
      type: 'array',
      fields: [
        { name: 'description', type: 'text', required: true },
        { name: 'quantity', type: 'number', defaultValue: 1, required: true },
        { name: 'unitPrice', type: 'number', required: true },
        {
          name: 'total',
          type: 'number',
          admin: { readOnly: true },
          hooks: {
            // Auto-calc line total
            beforeChange: [
              ({ siblingData }) => (siblingData.quantity || 0) * (siblingData.unitPrice || 0),
            ],
          },
        },
      ],
    },
    // --- TOTALS ---
    {
      name: 'subTotal',
      type: 'number',
      admin: { readOnly: true },
    },
    {
      name: 'taxAmount',
      type: 'number',
      label: 'GST Amount',
      admin: { readOnly: true },
    },
    {
      name: 'grandTotal',
      type: 'number',
      label: 'Total Payable (MVR)',
      admin: { readOnly: true },
    },
    {
      name: 'issueDate',
      type: 'date',
      defaultValue: () => new Date().toISOString(),
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, req }) => {
        // 1. Calculate Subtotal from Line Items
        const items = data.lineItems || []
        const subTotal = items.reduce((sum: number, item: any) => {
          const lineTotal = (item.quantity || 0) * (item.unitPrice || 0)
          // Ensure line item total is set correctly in data
          item.total = lineTotal
          return sum + lineTotal
        }, 0)

        // 2. Fetch Tax Rate from SiteSettings
        let taxPercent = 6
        try {
          const settings = await req.payload.findGlobal({
            slug: 'site-settings',
          })
          if (settings.taxPercentage !== undefined) {
            taxPercent = settings.taxPercentage
          }
        } catch (e) {
          // Fallback to 6 if fetch fails
        }

        // 3. Apply Tax
        const taxAmount = subTotal * (taxPercent / 100)
        const grandTotal = subTotal + taxAmount

        // 4. Save Final Values
        data.subTotal = parseFloat(subTotal.toFixed(2))
        data.taxAmount = parseFloat(taxAmount.toFixed(2))
        data.grandTotal = parseFloat(grandTotal.toFixed(2))

        return data
      },
    ],
  },
}
