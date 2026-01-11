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
    // Basic permissions: Admins or Users for their own vessels
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user && user.role === 'superadmin'),
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
        { label: 'Permanent (Monthly)', value: 'permanent' },
        { label: 'Day-to-Day (Temporary)', value: 'temporary' },
        { label: 'Short Visit (Hourly)', value: 'hourly' },
      ],
      required: true,
    },
    {
      name: 'currentBerth',
      type: 'relationship',
      relationTo: 'berthing-slots',
      admin: {
        position: 'sidebar',
        readOnly: true, // System managed
        description: 'Currently assigned slot',
      },
    },

    // --- STATUS FIELD ---
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Pending Review', value: 'pending' },
        { label: 'Awaiting Payment', value: 'payment_pending' },
        { label: 'Active / Permitted', value: 'active' },
        { label: 'Departed', value: 'departed' },
        { label: 'Rejected', value: 'rejected' },
        { label: 'Blacklisted', value: 'blacklisted' },
      ],
      defaultValue: 'pending',
      required: true,
      admin: {
        position: 'sidebar',
      },
    },

    // --- FINANCE GROUP ---
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
          label: 'Outstanding Fee (MVR)',
          defaultValue: 0,
          admin: {
            description: 'Calculated upon departure or registration.',
          },
        },
        {
          name: 'lastPaidAmount',
          type: 'number',
          admin: {
            description: 'Snapshots the fee amount just before payment',
          },
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
          name: 'nextPaymentDue',
          type: 'date',
          label: 'Subscription Expiry Date',
          admin: {
            description: 'For Permanent vessels.',
          },
        },
        {
          name: 'transactionId',
          type: 'text',
          label: 'Transaction Ref ID',
        },
      ],
    },

    // --- VESSEL DETAILS ---
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

    // --- RELATIONSHIPS ---
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

    // --- DOCUMENTS ---
    {
      name: 'registrationDoc',
      type: 'upload',
      relationTo: 'media',
      required: false,
      label: 'Vessel Registration Copy',
    },

    // --- SPECS ---
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
