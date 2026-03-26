import { getAllElectionResults, ElectionResults } from '@/app/actions/elections'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

function statusBadgeVariant(status: string) {
  switch (status) {
    case 'active':
      return 'default'
    case 'closed':
      return 'secondary'
    case 'draft':
      return 'outline'
    default:
      return 'outline'
  }
}

function ElectionCard({ election }: { election: ElectionResults }) {
  const leader = election.tally[0]

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">{election.title}</CardTitle>
        <Badge variant={statusBadgeVariant(election.status)}>
          {election.status.charAt(0).toUpperCase() + election.status.slice(1)}
        </Badge>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Total votes cast: <span className="font-medium">{election.totalVotes}</span>
        </p>

        {/* Vote tally */}
        <div className="space-y-3">
          {election.tally.map((entry, index) => {
            const percentage =
              election.totalVotes > 0
                ? ((entry.count / election.totalVotes) * 100).toFixed(1)
                : '0.0'
            const isLeader = index === 0 && entry.count > 0

            return (
              <div key={entry.candidate} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className={isLeader ? 'font-semibold' : ''}>{entry.candidate}</span>
                  <span className="text-muted-foreground">
                    {entry.count} vote{entry.count !== 1 ? 's' : ''} ({percentage}%)
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full ${isLeader ? 'bg-primary' : 'bg-primary/40'}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        {election.status === 'closed' && leader && leader.count > 0 && (
          <p className="mt-4 text-sm font-medium text-primary">
            Winner: {leader.candidate} with {leader.count} vote{leader.count !== 1 ? 's' : ''}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

export default async function ElectionsPage() {
  const results = await getAllElectionResults()

  return (
    <div className="container mx-auto py-10 px-4 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Elections</h1>
        <p className="text-muted-foreground">
          View election results and vote tallies. Votes are counted using simple plurality
          (first-past-the-post) — each voter casts one vote and the candidate with the most votes
          wins.
        </p>
      </div>

      {results.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            No elections have been created yet.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {results.map((election) => (
            <ElectionCard key={String(election.electionId)} election={election} />
          ))}
        </div>
      )}
    </div>
  )
}
