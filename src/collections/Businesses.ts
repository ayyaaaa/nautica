import { CollectionConfig } from 'payload'

export const Businesses: CollectionConfig = {
  slug: 'businesses',
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'name',
      label: 'Business Name',
      type: 'text',
      required: true,
    },
    {
      name: 'registrationNumber',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'email',
      type: 'email',
    },
    {
      name: 'phone',
      type: 'text',
    },
    {
      name: 'registrationDoc',
      label: 'Business Registration Document',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'owner',
      label: 'Representative / Owner',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
  ],
}
