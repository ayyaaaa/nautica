'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// Shadcn-style colors
const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
]

// Fallback colors if CSS vars aren't set up
const FALLBACK_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']

interface VesselPieChartProps {
  data: { name: string; value: number }[]
}

export function VesselPieChart({ data }: VesselPieChartProps) {
  const chartData =
    data.length > 0
      ? data
      : [
          { name: 'Dhoani', value: 40 },
          { name: 'Launch', value: 30 },
          { name: 'Yacht', value: 10 },
          { name: 'Barge', value: 15 },
          { name: 'Other', value: 5 },
        ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fleet Composition</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={FALLBACK_COLORS[index % FALLBACK_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  borderRadius: '8px',
                  border: '1px solid hsl(var(--border))',
                }}
                itemStyle={{ color: 'hsl(var(--popover-foreground))' }}
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
