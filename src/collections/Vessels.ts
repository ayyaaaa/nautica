import { CollectionConfig } from 'payload'

export const Vessels: CollectionConfig = {
  slug: 'vessels',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'registrationNumber', 'status', 'vesselType'],
  },
  access: {
    read: () => true,
    create: () => true,
    update: ({ req: { user } }) => {
      // Allow admins to update status/finance
      if (user && user.role === 'admin') return true
      // Allow users to update their own vessel (e.g. if we add an edit feature later)
      // For now, returning true is fine for MVP actions or you can restrict it:
      return Boolean(user)
    },
    delete: ({ req: { user } }) => Boolean(user && user.role === 'admin'),
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Vessel Name',
    },
    {
      name: 'registrationNumber',
      type: 'text',
      required: true,
      unique: true,
      label: 'Registration Number',
    },
    {
      name: 'registrationType',
      type: 'select',
      options: [
        { label: 'Permanent', value: 'permanent' },
        { label: 'Day-to-Day', value: 'temporary' },
        { label: 'Short Visit (Hourly)', value: 'hourly' }, // <--- NEW OPTION
      ],
      required: true,
    },

    // --- STATUS FIELD UPDATE ---
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Pending Review', value: 'pending' },
        { label: 'Awaiting Payment', value: 'payment_pending' }, // <--- NEW OPTION
        { label: 'Active / Permitted', value: 'active' },
        { label: 'Rejected', value: 'rejected' },
        { label: 'Blacklisted', value: 'blacklisted' },
      ],
      defaultValue: 'pending',
      required: true,
      admin: {
        position: 'sidebar',
      },
    },

    // --- NEW FINANCE GROUP ---
    {
      name: 'finance',
      type: 'group',
      label: 'Financials',
      admin: {
        position: 'sidebar',
      },
      fields: [
        {
          name: 'fee',
          type: 'number',
          label: 'Registration Fee (MVR)',
          defaultValue: 0,
        },
        {
          name: 'paymentStatus',
          type: 'select',
          options: [
            { label: 'Unpaid', value: 'unpaid' },
            { label: 'Paid', value: 'paid' },
          ],
          defaultValue: 'unpaid',
        },
        {
          name: 'paymentDate',
          type: 'date',
          label: 'Payment Date',
        },
        {
          name: 'transactionId',
          type: 'text',
          label: 'Transaction Ref ID',
        },
      ],
    },
    // -------------------------

    {
      name: 'vesselType',
      type: 'select',
      options: [
        'DHOANI',
        'LAUNCH',
        'BOAT',
        'BOKKURA',
        'BAHTHELI',
        'DINGHY',
        'BARGE',
        'YACHT',
        'TUG',
        'SUBMARINE',
        'PASSENGER FERRY',
        'OTHER',
      ],
      required: true,
    },
    {
      name: 'useType',
      type: 'select',
      options: ['Passenger', 'Fishing', 'Cargo', 'Diving', 'Excursion', 'Other'],
      required: true,
    },

    // RELATIONSHIPS
    {
      name: 'owner',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'operator',
      type: 'relationship',
      relationTo: 'users',
    },

    // DOCUMENTS
    {
      name: 'registrationDoc',
      type: 'upload',
      relationTo: 'media',
      required: false, // Set to false to allow Day-to-Day registration
      label: 'Vessel Registration Copy',
    },

    // SPECS
    {
      name: 'specs',
      type: 'group',
      fields: [
        { name: 'length', type: 'number' },
        { name: 'width', type: 'number' },
        { name: 'fuelType', type: 'select', options: ['Diesel', 'Petrol'] },
        { name: 'engineType', type: 'select', options: ['Inboard', 'Outboard'] },
      ],
    },
  ],
}
