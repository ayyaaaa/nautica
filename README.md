# Payload Blank Template

This template comes configured with the bare minimum to get started on anything you need.

## Quick start

This template can be deployed directly from our Cloud hosting and it will setup MongoDB and cloud S3 object storage for media.

## Quick Start - local setup

To spin up this template locally, follow these steps:

### Clone

After you click the `Deploy` button above, you'll want to have standalone copy of this repo on your machine. If you've already cloned this repo, skip to [Development](#development).

### Development

1. First [clone the repo](#clone) if you have not done so already
2. `cd my-project && cp .env.example .env` to copy the example environment variables. You'll need to add the `MONGODB_URI` from your Cloud project to your `.env` if you want to use S3 storage and the MongoDB database that was created for you.

3. `pnpm install && pnpm dev` to install dependencies and start the dev server
4. open `http://localhost:3000` to open the app in your browser

That's it! Changes made in `./src` will be reflected in your app. Follow the on-screen instructions to login and create your first admin user. Then check out [Production](#production) once you're ready to build and serve your app, and [Deployment](#deployment) when you're ready to go live.

#### Docker (Optional)

If you prefer to use Docker for local development instead of a local MongoDB instance, the provided docker-compose.yml file can be used.

To do so, follow these steps:

- Modify the `MONGODB_URI` in your `.env` file to `mongodb://127.0.0.1/<dbname>`
- Modify the `docker-compose.yml` file's `MONGODB_URI` to match the above `<dbname>`
- Run `docker-compose up` to start the database, optionally pass `-d` to run in the background.

## How it works

The Payload config is tailored specifically to the needs of most websites. It is pre-configured in the following ways:

### Collections

See the [Collections](https://payloadcms.com/docs/configuration/collections) docs for details on how to extend this functionality.

- #### Users (Authentication)

  Users are auth-enabled collections that have access to the admin panel.

  For additional help, see the official [Auth Example](https://github.com/payloadcms/payload/tree/main/examples/auth) or the [Authentication](https://payloadcms.com/docs/authentication/overview#authentication-overview) docs.

- #### Media

  This is the uploads enabled collection. It features pre-configured sizes, focal point and manual resizing to help you manage your pictures.

### Docker

Alternatively, you can use [Docker](https://www.docker.com) to spin up this template locally. To do so, follow these steps:

1. Follow [steps 1 and 2 from above](#development), the docker-compose file will automatically use the `.env` file in your project root
1. Next run `docker-compose up`
1. Follow [steps 4 and 5 from above](#development) to login and create your first admin user

That's it! The Docker instance will help you get up and running quickly while also standardizing the development environment across your teams.

## Elections & Vote Counting

The system includes an elections module that allows administrators to create elections and for users to cast votes.

### How Votes Are Counted

Votes are counted using **simple plurality (first-past-the-post)**:

1. Each authenticated user can cast **exactly one vote per election** (enforced by a unique compound index on `election` + `voter`).
2. Votes can only be cast while an election's status is **"active"**.
3. The selected candidate must match one of the candidates defined in the election.
4. When vote results are displayed on the `/elections` page, all votes for the election are fetched from the `votes` collection and grouped by the `candidate` field.
5. The count of votes per candidate is calculated and sorted in descending order (most votes first).
6. The candidate with the highest vote count is the winner.

The vote counting logic is implemented in `src/app/actions/elections.ts` via the `countVotes()` server action.

### How to Change Vote Data at the Database Level

Since this project uses **PostgreSQL** via Payload CMS, vote data can be modified directly using SQL queries.

#### View all votes for an election

```sql
SELECT v.id, v.candidate, v.voter, v.voted_at
FROM votes v
WHERE v.election = <election_id>
ORDER BY v.voted_at;
```

#### Update a specific vote's candidate selection

```sql
UPDATE votes
SET candidate = 'New Candidate Name'
WHERE id = <vote_id>;
```

#### Delete a specific vote

```sql
DELETE FROM votes WHERE id = <vote_id>;
```

#### Insert a new vote directly

```sql
INSERT INTO votes (election, voter, candidate, voted_at, created_at, updated_at)
VALUES (<election_id>, <user_id>, 'Candidate Name', NOW(), NOW(), NOW());
```

#### Count votes per candidate for an election

```sql
SELECT candidate, COUNT(*) as vote_count
FROM votes
WHERE election = <election_id>
GROUP BY candidate
ORDER BY vote_count DESC;
```

#### Using the Payload CMS API (programmatic access)

You can also modify vote data using the Payload Local API (e.g., in scripts or server actions):

```typescript
import { getPayload } from 'payload'
import config from './src/payload.config'

const payload = await getPayload({ config })

// Find all votes for an election
const votes = await payload.find({
  collection: 'votes',
  where: { election: { equals: electionId } },
  overrideAccess: true,
})

// Update a vote
await payload.update({
  collection: 'votes',
  id: voteId,
  data: { candidate: 'New Candidate Name' },
  overrideAccess: true,
})

// Delete a vote
await payload.delete({
  collection: 'votes',
  id: voteId,
  overrideAccess: true,
})

// Create a vote
await payload.create({
  collection: 'votes',
  data: {
    election: electionId,
    voter: userId,
    candidate: 'Candidate Name',
  },
  overrideAccess: true,
})
```

> **Note:** When using `overrideAccess: true`, all access control checks are bypassed, allowing administrators to directly manipulate vote data regardless of the configured access rules.

### Collections

- **Elections** (`elections`): Election definitions with title, description, status (draft/active/closed), start/end dates, and candidate list.
- **Votes** (`votes`): Individual vote records linking an election, voter (user), and selected candidate.

## Questions

If you have any issues or questions, reach out to us on [Discord](https://discord.com/invite/payload) or start a [GitHub discussion](https://github.com/payloadcms/payload/discussions).
