import { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true, // Enables login
  admin: {
    useAsTitle: 'fullName',
    defaultColumns: ['fullName', 'role', 'email', 'phone'],
  },
  access: {
    // Only admins or the user themselves can read their data
    read: ({ req: { user } }) => {
      if (user?.role === 'admin') return true
      return { id: { equals: user?.id } }
    },
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
      relationTo: 'media', // You need a 'media' collection for this
    },
    {
      name: 'idCardCopy',
      label: 'ID Card / Passport Copy',
      type: 'upload',
      relationTo: 'media',
    },
  ],
}
