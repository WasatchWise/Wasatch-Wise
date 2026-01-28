'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Mail, MessageSquare, Activity } from "lucide-react"
import { useEffect, useState } from "react"
import { getDashboardStats, DashboardStats } from "@/lib/actions/dashboard"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  async function loadStats() {
    setLoading(true)
    try {
      const data = await getDashboardStats()
      setStats(data)
    } catch (err) {
      console.error("Failed to load dashboard stats", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStats()
  }, [])

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-brand bg-clip-text text-transparent">Command Center</h2>
          <p className="text-muted-foreground mt-1">Overview of your pipeline health and agent activity.</p>
        </div>
        <Button onClick={loadStats} variant="outline" size="sm" disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* KPI Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-l-4 border-l-brand-blue shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pipeline Volume</CardTitle>
            <Users className="h-4 w-4 text-brand-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats?.pipelineVolume.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Active projects ready for outreach
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-brand-orange shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outreach Sent</CardTitle>
            <Mail className="h-4 w-4 text-brand-orange" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats?.emailsSent.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Total emails generated & sent
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-brand-primary shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
            <MessageSquare className="h-4 w-4 text-brand-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : `${stats?.replyRate}%`}</div>
            <p className="text-xs text-muted-foreground">
              Response rate across campaigns
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Activity Feed */}
      <div className="grid gap-4 md:grid-cols-1">
        <Card className="col-span-1 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-muted-foreground" />
              Live Agent Feed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6 relative pl-2">
              {/* Timeline Line */}
              <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-border -ml-[5px]"></div>

              {loading ? (
                <div className="pl-6 text-sm text-muted-foreground">Loading activity...</div>
              ) : stats?.recentActivity.length === 0 ? (
                <div className="pl-6 text-sm text-muted-foreground">No recent activity logged.</div>
              ) : (
                stats?.recentActivity.map((activity) => (
                  <div key={activity.id} className="relative pl-6 flex flex-col gap-1">
                    {/* Timeline Dot */}
                    <div className="absolute left-0 top-1.5 h-2.5 w-2.5 rounded-full border-2 border-background bg-brand-blue -ml-[9px]"></div>

                    <div className="text-sm font-medium leading-none">
                      {activity.projectName}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {activity.description}
                    </div>
                    <div className="text-xs text-muted-foreground/60">
                      {new Date(activity.date).toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
