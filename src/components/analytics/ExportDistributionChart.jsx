import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip
} from 'recharts'
import { CheckCircle2, XCircle, Clock } from 'lucide-react'

export default function ExportDistributionChart({ totalExports, successRate }) {
  const successfulExports = Math.round((totalExports * successRate) / 100)
  const failedExports = totalExports - successfulExports

  const data = [
    { name: 'Successful', value: successfulExports, color: 'hsl(142, 76%, 36%)' },
    { name: 'Failed', value: failedExports, color: 'hsl(0, 84%, 60%)' }
  ]

  const COLORS = data.map(item => item.color)

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const percentage = totalExports > 0 
        ? ((payload[0].value / totalExports) * 100).toFixed(1)
        : 0
      return (
        <div className="bg-background border border-border rounded-lg shadow-lg p-3">
          <p className="text-sm font-medium">{payload[0].name}</p>
          <p className="text-sm">
            <span className="font-semibold">{payload[0].value}</span> exports
          </p>
          <p className="text-xs text-muted-foreground">{percentage}%</p>
        </div>
      )
    }
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Export Performance</CardTitle>
        <CardDescription>
          Jira export success vs failures
        </CardDescription>
      </CardHeader>
      <CardContent>
        {totalExports > 0 ? (
          <div className="space-y-4">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-950/20">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-xs text-muted-foreground">Successful</p>
                  <p className="text-lg font-bold text-green-700 dark:text-green-400">
                    {successfulExports}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-950/20">
                <XCircle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-xs text-muted-foreground">Failed</p>
                  <p className="text-lg font-bold text-red-700 dark:text-red-400">
                    {failedExports}
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center p-3 rounded-lg bg-muted">
              <p className="text-sm text-muted-foreground mb-1">Overall Success Rate</p>
              <p className="text-2xl font-bold text-primary">{successRate}%</p>
            </div>
          </div>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No exports yet</p>
              <p className="text-xs mt-1">Export test cases to Jira to see statistics</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
