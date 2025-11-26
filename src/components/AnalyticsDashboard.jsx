import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { fetchSessions, fetchMessages, fetchSessionDocuments, fetchJiraExports, fetchAnalyticsOverview, fetchExportsTimeseries } from '../api'
import { 
  Activity, 
  FileText, 
  Send, 
  FolderOpen, 
  Download,
  Filter
} from 'lucide-react'
import MetricCard from './analytics/MetricCard'
import TestCasesChart from './analytics/TestCasesChart'
import ExportDistributionChart from './analytics/ExportDistributionChart'
import SessionsTable from './analytics/SessionsTable'
import { Button } from './ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Alert, AlertDescription } from './ui/alert'
import { Skeleton } from './ui/skeleton'
import { Card, CardContent, CardHeader } from './ui/card'

export default function AnalyticsDashboard() {
  const { user } = useAuth()
  const [loadingState, setLoadingState] = useState(true)
  const [sessions, setSessions] = useState([])
  const [timeSeriesData, setTimeSeriesData] = useState([])
  const [metrics, setMetrics] = useState({
    totalSessions: 0,
    totalTestCases: 0,
    totalJiraExports: 0,
    totalDocuments: 0,
    avgTestCasesPerSession: 0,
    exportSuccessRate: 0,
    sessionsThisWeek: 0,
    testCasesThisWeek: 0
  })
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user?.uid) return
    loadDashboardData()
  }, [user?.uid])

  const loadDashboardData = async () => {
    setLoadingState(true)
    setError(null)

    try {
      // Use server-side analytics endpoints for overview + timeseries (fewer requests)
      const [sessionsList, overviewRes, timeseriesRes] = await Promise.all([
        fetchSessions(user.uid).catch(() => []),
        fetchAnalyticsOverview(user.uid).catch(() => null),
        fetchExportsTimeseries(user.uid, 30).catch(() => null),
      ])

      setSessions(sessionsList || [])

      if (overviewRes) {
        setMetrics({
          totalSessions: overviewRes.total_sessions || 0,
          totalTestCases: overviewRes.total_test_cases || 0,
          totalJiraExports: overviewRes.total_exports || 0,
          totalDocuments: overviewRes.documents_uploaded || 0,
          avgTestCasesPerSession: overviewRes.avg_test_cases_per_session || 0,
          exportSuccessRate: overviewRes.export_success_rate || 0,
          sessionsThisWeek: overviewRes.sessions_this_week || 0,
          testCasesThisWeek: overviewRes.test_cases_this_week || 0,
        })
      }

      if (timeseriesRes && Array.isArray(timeseriesRes.timeseries)) {
        // normalize timeseries shape expected by chart
        const normalized = timeseriesRes.timeseries.map((d) => ({ date: d.date, testCases: d.count || d.testCases || 0 }))
        setTimeSeriesData(normalized)
      }

    } catch (err) {
      console.error('Error loading dashboard data:', err)
      setError(err.message || 'Failed to load dashboard data')
    } finally {
      setLoadingState(false)
    }
  }

  if (loadingState) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardHeader className="space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32 mb-2" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertDescription>
            {error}
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-4"
              onClick={loadDashboardData}
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Track your test case generation and export activity
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Sessions"
          value={metrics.totalSessions}
          description="All-time sessions"
          icon={FolderOpen}
          trend={metrics.sessionsThisWeek}
          trendLabel="this week"
          trendPositive={true}
        />
        <MetricCard
          title="Test Cases Generated"
          value={metrics.totalTestCases}
          description={`Avg ${metrics.avgTestCasesPerSession} per session`}
          icon={FileText}
          trend={metrics.testCasesThisWeek}
          trendLabel="this week"
          trendPositive={true}
        />
        <MetricCard
          title="Jira Exports"
          value={metrics.totalJiraExports}
          description={`${metrics.exportSuccessRate}% success rate`}
          icon={Send}
          trend={metrics.exportSuccessRate}
          trendLabel="success rate"
          trendPositive={metrics.exportSuccessRate > 80}
        />
        <MetricCard
          title="Documents Uploaded"
          value={metrics.totalDocuments}
          description="Requirements & docs"
          icon={Activity}
          trend={null}
          trendLabel=""
          trendPositive={true}
        />
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <TestCasesChart data={timeSeriesData} />
            <ExportDistributionChart 
              totalExports={metrics.totalJiraExports}
              successRate={metrics.exportSuccessRate}
            />
          </div>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <SessionsTable sessions={sessions} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
