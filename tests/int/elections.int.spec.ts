import { getPayload, Payload } from 'payload'
import config from '@/payload.config'

import { describe, it, beforeAll, expect } from 'vitest'

let payload: Payload

describe('Elections & Vote Counting', () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
  })

  it('fetches elections', async () => {
    const elections = await payload.find({
      collection: 'elections',
    })
    expect(elections).toBeDefined()
    expect(elections.docs).toBeDefined()
  })

  it('fetches votes', async () => {
    const votes = await payload.find({
      collection: 'votes',
      overrideAccess: true,
    })
    expect(votes).toBeDefined()
    expect(votes.docs).toBeDefined()
  })

  it('creates an election and counts votes', async () => {
    // Create an election
    const election = await payload.create({
      collection: 'elections',
      data: {
        title: 'Test Election',
        description: 'A test election for vote counting',
        status: 'active',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 86400000).toISOString(),
        candidates: [{ name: 'Alice' }, { name: 'Bob' }, { name: 'Charlie' }],
      },
      overrideAccess: true,
    })

    expect(election).toBeDefined()
    expect(election.id).toBeDefined()
    expect(election.title).toBe('Test Election')
    expect(election.candidates).toHaveLength(3)

    // Create test voters
    const voter1 = await payload.create({
      collection: 'users',
      data: {
        email: `voter1-${Date.now()}@test.com`,
        password: 'test1234',
        fullName: 'Voter One',
        idNumber: 'V001',
        phone: '1234567',
        role: 'operator',
      },
      overrideAccess: true,
    })

    const voter2 = await payload.create({
      collection: 'users',
      data: {
        email: `voter2-${Date.now()}@test.com`,
        password: 'test1234',
        fullName: 'Voter Two',
        idNumber: 'V002',
        phone: '1234568',
        role: 'operator',
      },
      overrideAccess: true,
    })

    const voter3 = await payload.create({
      collection: 'users',
      data: {
        email: `voter3-${Date.now()}@test.com`,
        password: 'test1234',
        fullName: 'Voter Three',
        idNumber: 'V003',
        phone: '1234569',
        role: 'operator',
      },
      overrideAccess: true,
    })

    // Cast votes: 2 for Alice, 1 for Bob, 0 for Charlie
    await payload.create({
      collection: 'votes',
      data: {
        election: election.id,
        voter: voter1.id,
        candidate: 'Alice',
      },
      overrideAccess: true,
    })

    await payload.create({
      collection: 'votes',
      data: {
        election: election.id,
        voter: voter2.id,
        candidate: 'Alice',
      },
      overrideAccess: true,
    })

    await payload.create({
      collection: 'votes',
      data: {
        election: election.id,
        voter: voter3.id,
        candidate: 'Bob',
      },
      overrideAccess: true,
    })

    // Verify vote counting by querying votes
    const allVotes = await payload.find({
      collection: 'votes',
      where: {
        election: { equals: election.id },
      },
      overrideAccess: true,
    })

    expect(allVotes.totalDocs).toBe(3)

    // Count votes by candidate
    const voteCounts = new Map<string, number>()
    for (const vote of allVotes.docs) {
      const current = voteCounts.get(vote.candidate) || 0
      voteCounts.set(vote.candidate, current + 1)
    }

    expect(voteCounts.get('Alice')).toBe(2)
    expect(voteCounts.get('Bob')).toBe(1)
    expect(voteCounts.get('Charlie')).toBeUndefined() // No votes for Charlie

    // Clean up
    for (const vote of allVotes.docs) {
      await payload.delete({ collection: 'votes', id: vote.id, overrideAccess: true })
    }
    await payload.delete({ collection: 'elections', id: election.id, overrideAccess: true })
    await payload.delete({ collection: 'users', id: voter1.id, overrideAccess: true })
    await payload.delete({ collection: 'users', id: voter2.id, overrideAccess: true })
    await payload.delete({ collection: 'users', id: voter3.id, overrideAccess: true })
  })
})
