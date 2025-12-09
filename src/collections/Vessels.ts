import { CollectionConfig } from 'payload'

export const Vessels: CollectionConfig = {
  slug: 'vessels',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'registrationNumber', 'vesselType', 'status'],
  },
  fields: [
    {
      name: 'name',
      label: 'Vessel Name',
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
      name: 'registrationType',
      type: 'select',
      options: [
        { label: 'Permanent (Contract)', value: 'permanent' },
        { label: 'Day-to-Day (Temporary)', value: 'temporary' },
      ],
      defaultValue: 'temporary',
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Pending Approval', value: 'pending' },
        { label: 'Active', value: 'active' },
        { label: 'Rejected', value: 'rejected' },
        { label: 'Blacklisted', value: 'blacklisted' },
      ],
      defaultValue: 'pending',
    },

    // --- Classification ---
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
      label: 'Use of Vessel',
      type: 'select',
      options: ['Passenger', 'Fishing', 'Cargo', 'Diving', 'Excursion', 'Other'],
      required: true,
    },

    // --- Technical Specs (Required for Permanent) ---
    {
      type: 'group',
      name: 'specs',
      label: 'Technical Specifications',
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'length', type: 'number', label: 'Length (m)' },
            { name: 'width', type: 'number', label: 'Width (m)' },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'engineType', type: 'select', options: ['Inboard', 'Outboard'] },
            { name: 'fuelType', type: 'select', options: ['Diesel', 'Petrol'] },
            { name: 'numberOfEngines', type: 'number' },
          ],
        },
      ],
    },

    // --- Ownership & Operation ---
    {
      name: 'owner',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      label: 'Vessel Owner',
    },
    {
      name: 'operator',
      type: 'relationship',
      relationTo: 'users',
      label: 'Vessel Operator (if different)',
    },
    {
      name: 'business',
      type: 'relationship',
      relationTo: 'businesses',
      label: 'Operating Business (if applicable)',
    },

    // --- Documents ---
    {
      name: 'registrationDoc',
      label: 'Vessel Registration Copy',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
  ],
}
