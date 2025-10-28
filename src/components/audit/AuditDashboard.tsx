"use client"

import { BarChart3, Shield, CheckCircle2, XCircle, TrendingUp, TrendingDown } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend as RechartsLegend } from "recharts"
import { cn } from "../../lib/utils"
import type { AuditChartData, AuditSummary } from "../../types/audit"

interface AuditDashboardProps {
  summary: AuditSummary
  chartData: AuditChartData[]
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  change,
}: {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ComponentType<{ className?: string }>
  trend?: "up" | "down" | "neutral"
  change?: number
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value.toLocaleString()}</div>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
        {change !== undefined && trend && (
          <div className={cn("flex items-center gap-1 text-xs mt-1", 
            trend === "up" ? "text-green-600" : trend === "down" ? "text-red-600" : "text-muted-foreground"
          )}>
            {trend === "up" && <TrendingUp className="h-3 w-3" />}
            {trend === "down" && <TrendingDown className="h-3 w-3" />}
            <span>{Math.abs(change)}% from last period</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function AuditDashboard({ summary, chartData }: AuditDashboardProps) {
  const successRate = summary.totalEvents > 0 
    ? ((summary.successEvents / summary.totalEvents) * 100).toFixed(1)
    : 0

  const COLORS = {
    success: "hsl(var(--chart-1))",
    failure: "hsl(0, 84.2%, 60.2%)",
    unauthorized: "hsl(38, 92%, 50%)",
    error: "hsl(24, 95%, 53%)",
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Events"
          value={summary.totalEvents}
          subtitle="Last 30 days"
          icon={BarChart3}
          trend="up"
          change={12}
        />
        <StatCard
          title="Success Rate"
          value={`${successRate}%`}
          subtitle={`${summary.successEvents} successful`}
          icon={CheckCircle2}
          trend="up"
          change={2}
        />
        <StatCard
          title="Failed Events"
          value={summary.failureEvents}
          subtitle={`${summary.unauthorizedEvents} unauthorized`}
          icon={XCircle}
          trend="down"
          change={-8}
        />
        <StatCard
          title="Avg Duration"
          value={`${summary.averageDuration || 0}ms`}
          subtitle="Response time"
          icon={Shield}
          trend="up"
          change={-5}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Event Trends Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Event Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full h-[300px]">
              <LineChart data={chartData} width={500} height={300}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <RechartsTooltip />
                <RechartsLegend />
                <Line type="monotone" dataKey="success" stroke={COLORS.success} name="Success" strokeWidth={2} />
                <Line type="monotone" dataKey="failure" stroke={COLORS.failure} name="Failure" strokeWidth={2} />
                <Line type="monotone" dataKey="unauthorized" stroke={COLORS.unauthorized} name="Unauthorized" strokeWidth={2} />
                <Line type="monotone" dataKey="error" stroke={COLORS.error} name="Error" strokeWidth={2} />
              </LineChart>
            </div>
          </CardContent>
        </Card>

        {/* Event Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Actions Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full h-[300px]">
              <BarChart
                width={500}
                height={300}
                data={Object.entries(summary.eventsByAction)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 8)
                  .map(([action, count]) => ({
                    action: action.split(".")[1] || action,
                    count,
                  }))}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="action" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <RechartsTooltip />
                <RechartsLegend />
                <Bar dataKey="count" fill="hsl(var(--chart-1))" />
              </BarChart>
            </div>
          </CardContent>
        </Card>

        {/* Target Types Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Target Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(summary.eventsByTarget)
                .sort(([, a], [, b]) => b - a)
                .map(([target, count]) => {
                  const percentage = (count / summary.totalEvents) * 100
                  return (
                    <div key={target} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{target}</span>
                        <span className="text-sm text-muted-foreground">{count} events</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-primary"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
            </div>
          </CardContent>
        </Card>

        {/* Top Actors */}
        <Card>
          <CardHeader>
            <CardTitle>Most Active Actors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(summary.eventsByActor)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 6)
                .map(([actor, count], index) => (
                  <div key={actor} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold">
                        {index + 1}
                      </div>
                      <span className="text-sm font-medium">{actor}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{count}</p>
                      <p className="text-xs text-muted-foreground">
                        {((count / summary.totalEvents) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

