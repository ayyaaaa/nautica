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
    // 1. DASHBOARD ACCESS: Only SUPERADMIN can access the /admin panel
    // 'admin' users will now be blocked from the CMS UI (must use your custom dashboard)
    admin: ({ req: { user } }) => {
      return Boolean(user && user.role === 'superadmin')
    },

    // 2. READ: Superadmin & Admin see everyone; Users see only themselves
    read: ({ req: { user } }) => {
      if (user && user.role === 'superadmin') return true
      return {
        id: {
          equals: user?.id,
        },
      }
    },

    // 3. CREATE: Allow anyone to register (public registration)
    create: () => true,

    // 4. UPDATE: Superadmin & Admin update anyone; Users update only themselves
    update: ({ req: { user } }) => {
      if (user && user.role === 'superadmin') return true
      return {
        id: {
          equals: user?.id,
        },
      }
    },

    // 5. DELETE: Only Superadmin & Admin can delete users
    delete: ({ req: { user } }) => Boolean(user && user.role === 'superadmin'),
  },

  fields: [
    {
      name: 'role',
      type: 'select',
      options: [
        { label: 'Super Admin', value: 'superadmin' }, // <--- New Role
        { label: 'Admin', value: 'admin' },
        { label: 'Vessel Operator', value: 'operator' },
        { label: 'Vessel Owner', value: 'owner' },
        { label: 'Business Representative', value: 'business_rep' },
      ],
      defaultValue: 'operator',
      required: true,

      // --- SECURITY LAYER 2: FIELD ACCESS ---
      access: {
        // Only a Superadmin (or Admin) can set a role
        // This prevents public users from registering as 'superadmin'
        create: ({ req: { user } }) => user?.role === 'superadmin' || user?.role === 'admin',

        // Only a Superadmin can change a role later (Higher security)
        update: ({ req: { user } }) => user?.role === 'superadmin',
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
