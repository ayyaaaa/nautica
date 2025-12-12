import { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true, // Enables login
  admin: {
    useAsTitle: 'fullName',
    defaultColumns: ['fullName', 'role', 'email', 'phone'],
  },

  // --- SECURITY LAYER 1: COLLECTION ACCESS ---
  access: {
    // 1. DASHBOARD ACCESS: Only admins can access the /admin panel
    admin: ({ req: { user } }) => {
      return Boolean(user && user.role === 'admin')
    },

    // 2. READ: Admins see everyone; Users see only themselves
    read: ({ req: { user } }) => {
      if (user && user.role === 'admin') return true
      return {
        id: {
          equals: user?.id,
        },
      }
    },

    // 3. CREATE: Allow anyone to register (public registration)
    create: () => true,

    // 4. UPDATE: Admins update anyone; Users update only themselves
    update: ({ req: { user } }) => {
      if (user && user.role === 'admin') return true
      return {
        id: {
          equals: user?.id,
        },
      }
    },

    // 5. DELETE: Only admins can delete users
    delete: ({ req: { user } }) => Boolean(user && user.role === 'admin'),
  },

  fields: [
    {
      name: 'role',
      type: 'select',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Vessel Operator', value: 'operator' },
        { label: 'Vessel Owner', value: 'owner' },
        { label: 'Business Representative', value: 'business_rep' },
      ],
      defaultValue: 'operator',
      required: true,

      // --- SECURITY LAYER 2: FIELD ACCESS ---
      access: {
        // Only an existing Admin can set the role to 'admin' (or anything else)
        // If a public user registers, this check fails, so Payload ignores their input
        // and falls back to defaultValue: 'operator'
        create: ({ req: { user } }) => user?.role === 'admin',

        // Only an Admin can change a role later
        update: ({ req: { user } }) => user?.role === 'admin',
      },
    },
    {
      name: 'fullName',
      label: 'Full Name',
      type: 'text',
      required: true,
    },
    {
      name: 'idNumber',
      label: 'ID Card / Passport Number',
      type: 'text',
      required: true,
    },
    {
      name: 'phone',
      label: 'Contact Number',
      type: 'text',
      required: true,
    },
    {
      name: 'address',
      type: 'group',
      fields: [
        { name: 'houseName', type: 'text' },
        { name: 'street', type: 'text' },
        { name: 'island', type: 'text', label: 'Island / Atoll' },
        { name: 'zip', type: 'text' },
      ],
    },
    {
      name: 'photo',
      label: 'Passport Photo',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'idCardCopy',
      label: 'ID Card / Passport Copy',
      type: 'upload',
      relationTo: 'media',
    },
  ],
}
