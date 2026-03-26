import { CollectionConfig } from 'payload'

export const Elections: CollectionConfig = {
  slug: 'elections',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'startDate', 'endDate'],
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) =>
      Boolean(user && (user.role === 'superadmin' || user.role === 'admin')),
    update: ({ req: { user } }) =>
      Boolean(user && (user.role === 'superadmin' || user.role === 'admin')),
    delete: ({ req: { user } }) => Boolean(user && user.role === 'superadmin'),
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Election Title',
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Active', value: 'active' },
        { label: 'Closed', value: 'closed' },
      ],
      defaultValue: 'draft',
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'startDate',
      type: 'date',
      required: true,
      label: 'Start Date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'endDate',
      type: 'date',
      required: true,
      label: 'End Date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'candidates',
      type: 'array',
      required: true,
      minRows: 2,
      label: 'Candidates / Options',
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
          label: 'Candidate Name',
        },
      ],
    },
  ],
}
