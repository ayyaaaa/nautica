'use server'

import { getPayload } from 'payload'
import configPromise from '@/payload.config'

export type VoteTally = {
  candidate: string
  count: number
}

export type ElectionResults = {
  electionId: string | number
  title: string
  status: string
  totalVotes: number
  tally: VoteTally[]
}

/**
 * Count votes for a specific election.
 *
 * Vote counting method: Simple plurality (first-past-the-post).
 * Each voter casts exactly one vote per election. The votes are grouped
 * by candidate name and counted. The candidate with the most votes wins.
 *
 * Steps:
 *  1. Fetch all votes for the given election from the `votes` collection.
 *  2. Group votes by the `candidate` field.
 *  3. Count the number of votes per candidate.
 *  4. Sort candidates by vote count in descending order.
 *  5. Return the tally along with the total vote count.
 */
export async function countVotes(electionId: string | number): Promise<ElectionResults> {
  const payload = await getPayload({ config: configPromise })

  const election = await payload.findByID({
    collection: 'elections',
    id: electionId,
  })

  // Fetch all votes for this election (paginate to get all results)
  const allVotes: { candidate: string }[] = []
  let page = 1
  let hasMore = true

  while (hasMore) {
    const result = await payload.find({
      collection: 'votes',
      where: {
        election: { equals: electionId },
      },
      limit: 100,
      page,
      overrideAccess: true,
    })

    allVotes.push(...result.docs.map((doc) => ({ candidate: doc.candidate })))
    hasMore = result.hasNextPage
    page++
  }

  // Group and count votes by candidate
  const voteCounts = new Map<string, number>()

  // Initialize all candidates with zero votes
  for (const candidate of election.candidates || []) {
    voteCounts.set(candidate.name, 0)
  }

  // Tally votes
  for (const vote of allVotes) {
    const current = voteCounts.get(vote.candidate) || 0
    voteCounts.set(vote.candidate, current + 1)
  }

  // Convert to sorted array (highest votes first)
  const tally: VoteTally[] = Array.from(voteCounts.entries())
    .map(([candidate, count]) => ({ candidate, count }))
    .sort((a, b) => b.count - a.count)

  return {
    electionId: election.id,
    title: election.title,
    status: election.status,
    totalVotes: allVotes.length,
    tally,
  }
}

/**
 * Get results for all elections.
 */
export async function getAllElectionResults(): Promise<ElectionResults[]> {
  const payload = await getPayload({ config: configPromise })

  const elections = await payload.find({
    collection: 'elections',
    limit: 100,
    sort: '-createdAt',
  })

  const results: ElectionResults[] = []
  for (const election of elections.docs) {
    const result = await countVotes(election.id)
    results.push(result)
  }

  return results
}
