import { CollectionConfig } from 'payload'

export const Votes: CollectionConfig = {
  slug: 'votes',
  admin: {
    useAsTitle: 'candidate',
    defaultColumns: ['election', 'voter', 'candidate', 'votedAt'],
  },
  access: {
    read: ({ req: { user } }) => {
      if (user && (user.role === 'superadmin' || user.role === 'admin')) return true
      return {
        voter: {
          equals: user?.id,
        },
      }
    },
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) =>
      Boolean(user && (user.role === 'superadmin' || user.role === 'admin')),
    delete: ({ req: { user } }) => Boolean(user && user.role === 'superadmin'),
  },
  indexes: [
    {
      fields: ['election', 'voter'],
      unique: true,
    },
  ],
  fields: [
    {
      name: 'election',
      type: 'relationship',
      relationTo: 'elections',
      required: true,
      hasMany: false,
    },
    {
      name: 'voter',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      hasMany: false,
    },
    {
      name: 'candidate',
      type: 'text',
      required: true,
      label: 'Selected Candidate',
    },
    {
      name: 'votedAt',
      type: 'date',
      defaultValue: () => new Date().toISOString(),
      admin: {
        readOnly: true,
      },
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, req, operation }) => {
        if (operation === 'create') {
          // Validate that the election is active
          if (data.election) {
            const electionId =
              typeof data.election === 'object' ? data.election.id : data.election
            const election = await req.payload.findByID({
              collection: 'elections',
              id: electionId,
            })
            if (election.status !== 'active') {
              throw new Error('Votes can only be cast for active elections.')
            }

            // Validate that the candidate is a valid option in the election
            const validCandidates = (election.candidates || []).map(
              (c: { name: string }) => c.name,
            )
            if (!validCandidates.includes(data.candidate)) {
              throw new Error(
                `Invalid candidate "${data.candidate}". Valid options: ${validCandidates.join(', ')}`,
              )
            }
          }
        }
        return data
      },
    ],
  },
}
