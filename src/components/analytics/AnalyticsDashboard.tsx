"use client"

import type React from "react"
import { useState, useMemo } from "react"
import {
  TrendingUp,
  TrendingDown,
  Users,
  FileText,
  Search,
  Eye,
  ActivityIcon,
  HardDriveIcon,
  ClockIcon,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Badge } from "../ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { DatePickerWithRange } from "../ui/date-picker-with-range"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "../ui/chart"
import { cn } from "../../lib/utils"
import type { Document } from "../../data/mockData"
import {
  AreaChart,
  BarChart,
  LineChart,
  PieChart,
  Area,
  Bar,
  Line,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"

interface AnalyticsData {
  documentViews: Array<{ date: string; views: number; downloads: number; shares: number }>
  searchAnalytics: Array<{ query: string; count: number; avgResultTime: number }>
  userActivity: Array<{ date: string; activeUsers: number; newUsers: number }>
  documentTypes: Array<{ type: string; count: number; size: number }>
  storageUsage: Array<{ department: string; used: number; total: number }>
  topDocuments: Array<{ name: string; views: number; downloads: number; author: string }>
  searchTrends: Array<{ date: string; searches: number; successRate: number }>
  performanceMetrics: {
    avgSearchTime: number
    avgUploadTime: number
    systemUptime: number
    errorRate: number
  }
}

interface MetricCardProps {
  title: string
  value: string | number
  change?: number
  changeLabel?: string
  icon: React.ComponentType<{ className?: string }>
  trend?: "up" | "down" | "neutral"
}

function MetricCard({ title, value, change, changeLabel, icon: Icon, trend }: MetricCardProps) {
  const getTrendColor = () => {
    switch (trend) {
      case "up":
        return "text-green-600 dark:text-green-400"
      case "down":
        return "text-red-600 dark:text-red-400"
      default:
        return "text-muted-foreground"
    }
  }

  const getTrendIcon = () => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-3 w-3" />
      case "down":
        return <TrendingDown className="h-3 w-3" />
      default:
        return null
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {change !== undefined && (
              <div className={cn("flex items-center gap-1 text-xs", getTrendColor())}>
                {getTrendIcon()}
                <span>
                  {change > 0 ? "+" : ""}
                  {change}%
                </span>
                {changeLabel && <span className="text-muted-foreground">{changeLabel}</span>}
              </div>
            )}
          </div>
          <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface AnalyticsDashboardProps {
  documents: Document[]
  className?: string
}

export function AnalyticsDashboard({ documents, className }: AnalyticsDashboardProps) {
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | undefined>()
  const [selectedPeriod, setSelectedPeriod] = useState("7d")

  // Generate mock analytics data based on documents
  const analyticsData: AnalyticsData = useMemo(() => {
    const now = new Date()
    const daysBack = selectedPeriod === "7d" ? 7 : selectedPeriod === "30d" ? 30 : 90

    // Document views over time
    const documentViews = Array.from({ length: daysBack }, (_, i) => {
      const date = new Date(now)
      date.setDate(date.getDate() - (daysBack - 1 - i))
      return {
        date: date.toISOString().split("T")[0],
        views: Math.floor(Math.random() * 500) + 100,
        downloads: Math.floor(Math.random() * 100) + 20,
        shares: Math.floor(Math.random() * 50) + 5,
      }
    })

    // Search analytics
    const searchQueries = [
      "financial report",
      "budget analysis",
      "marketing strategy",
      "employee handbook",
      "project proposal",
      "security audit",
      "api documentation",
      "brand guidelines",
    ]
    const searchAnalytics = searchQueries
      .map((query) => ({
        query,
        count: Math.floor(Math.random() * 200) + 50,
        avgResultTime: Math.random() * 0.5 + 0.1,
      }))
      .sort((a, b) => b.count - a.count)

    // User activity
    const userActivity = Array.from({ length: daysBack }, (_, i) => {
      const date = new Date(now)
      date.setDate(date.getDate() - (daysBack - 1 - i))
      return {
        date: date.toISOString().split("T")[0],
        activeUsers: Math.floor(Math.random() * 100) + 50,
        newUsers: Math.floor(Math.random() * 10) + 2,
      }
    })

    // Document types distribution
    const typeCount = new Map<string, { count: number; size: number }>()
    documents.forEach((doc) => {
      const current = typeCount.get(doc.type) || { count: 0, size: 0 }
      typeCount.set(doc.type, {
        count: current.count + 1,
        size: current.size + doc.sizeBytes,
      })
    })
    const documentTypes = Array.from(typeCount.entries()).map(([type, data]) => ({
      type: type.toUpperCase(),
      count: data.count,
      size: Math.round(data.size / (1024 * 1024)), // Convert to MB
    }))

    // Storage usage by department
    const departments = ["Engineering", "Marketing", "HR", "Finance", "Sales"]
    const storageUsage = departments.map((dept) => ({
      department: dept,
      used: Math.floor(Math.random() * 800) + 200,
      total: 1000,
    }))

    // Top documents
    const topDocuments = documents
      .slice(0, 10)
      .map((doc) => ({
        name: doc.name,
        views: Math.floor(Math.random() * 1000) + 100,
        downloads: Math.floor(Math.random() * 200) + 20,
        author: doc.author,
      }))
      .sort((a, b) => b.views - a.views)

    // Search trends
    const searchTrends = Array.from({ length: daysBack }, (_, i) => {
      const date = new Date(now)
      date.setDate(date.getDate() - (daysBack - 1 - i))
      return {
        date: date.toISOString().split("T")[0],
        searches: Math.floor(Math.random() * 300) + 100,
        successRate: Math.random() * 20 + 80, // 80-100%
      }
    })

    return {
      documentViews,
      searchAnalytics,
      userActivity,
      documentTypes,
      storageUsage,
      topDocuments,
      searchTrends,
      performanceMetrics: {
        avgSearchTime: 0.23,
        avgUploadTime: 2.1,
        systemUptime: 99.8,
        errorRate: 0.2,
      },
    }
  }, [documents, selectedPeriod])

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"]

  const chartConfig = {
    views: {
      label: "Views",
      color: "hsl(var(--chart-1))",
    },
    downloads: {
      label: "Downloads",
      color: "hsl(var(--chart-2))",
    },
    shares: {
      label: "Shares",
      color: "hsl(var(--chart-3))",
    },
    activeUsers: {
      label: "Active Users",
      color: "hsl(var(--chart-1))",
    },
    newUsers: {
      label: "New Users",
      color: "hsl(var(--chart-2))",
    },
    used: {
      label: "Used (MB)",
      color: "hsl(var(--chart-1))",
    },
    total: {
      label: "Total (MB)",
      color: "hsl(var(--chart-2))",
    },
    searches: {
      label: "Searches",
      color: "hsl(var(--chart-1))",
    },
    successRate: {
      label: "Success Rate %",
      color: "hsl(var(--chart-2))",
    },
    responseTime: {
      label: "Response Time (s)",
      color: "hsl(var(--chart-1))",
    },
    cpuUsage: {
      label: "CPU %",
      color: "hsl(var(--chart-1))",
    },
    memoryUsage: {
      label: "Memory %",
      color: "hsl(var(--chart-2))",
    },
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Document management insights and metrics</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <DatePickerWithRange value={dateRange} onChange={setDateRange} />
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Documents"
          value={documents.length.toLocaleString()}
          change={12}
          changeLabel="vs last month"
          icon={FileText}
          trend="up"
        />
        <MetricCard title="Total Views" value="24.5K" change={8} changeLabel="vs last month" icon={Eye} trend="up" />
        <MetricCard
          title="Active Users"
          value="1,234"
          change={-3}
          changeLabel="vs last month"
          icon={Users}
          trend="down"
        />
        <MetricCard
          title="Search Queries"
          value="8.9K"
          change={15}
          changeLabel="vs last month"
          icon={Search}
          trend="up"
        />
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="search">Search</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Document Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ActivityIcon className="h-5 w-5" />
                  Document Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig}>
                  <AreaChart data={analyticsData.documentViews}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Area
                      type="monotone"
                      dataKey="views"
                      stackId="1"
                      stroke="var(--color-views)"
                      fill="var(--color-views)"
                    />
                    <Area
                      type="monotone"
                      dataKey="downloads"
                      stackId="1"
                      stroke="var(--color-downloads)"
                      fill="var(--color-downloads)"
                    />
                    <Area
                      type="monotone"
                      dataKey="shares"
                      stackId="1"
                      stroke="var(--color-shares)"
                      fill="var(--color-shares)"
                    />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Document Types Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Document Types
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig}>
                  <PieChart>
                    <Pie
                      data={analyticsData.documentTypes}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ type, percent }) => `${type} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {analyticsData.documentTypes.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* Storage Usage */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HardDriveIcon className="h-5 w-5" />
                Storage Usage by Department
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig}>
                <BarChart data={analyticsData.storageUsage}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="department" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar dataKey="used" fill="var(--color-used)" name="Used (MB)" />
                  <Bar dataKey="total" fill="#e0e0e0" name="Total (MB)" />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Top Documents */}
            <Card>
              <CardHeader>
                <CardTitle>Most Viewed Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsData.topDocuments.slice(0, 8).map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{doc.name}</p>
                        <p className="text-sm text-muted-foreground">by {doc.author}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{doc.views.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">{doc.downloads} downloads</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Document Type Details */}
            <Card>
              <CardHeader>
                <CardTitle>Document Type Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.documentTypes.map((type, index) => (
                    <div key={type.type} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="font-medium">{type.type}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-medium">{type.count} files</span>
                          <span className="text-sm text-muted-foreground ml-2">({type.size} MB)</span>
                        </div>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="h-2 rounded-full"
                          style={{
                            backgroundColor: COLORS[index % COLORS.length],
                            width: `${(type.count / Math.max(...analyticsData.documentTypes.map((t) => t.count))) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Search Tab */}
        <TabsContent value="search" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Search Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Search Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig}>
                  <BarChart data={analyticsData.searchTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar yAxisId="left" dataKey="searches" fill="var(--color-searches)" name="Searches" />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="successRate"
                      stroke="var(--color-successRate)"
                      name="Success Rate %"
                    />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Popular Search Queries */}
            <Card>
              <CardHeader>
                <CardTitle>Popular Search Queries</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsData.searchAnalytics.slice(0, 10).map((search, index) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{index + 1}</Badge>
                        <span className="font-medium">{search.query}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{search.count.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">{search.avgResultTime.toFixed(2)}s avg</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig}>
                <AreaChart data={analyticsData.userActivity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Area
                    type="monotone"
                    dataKey="activeUsers"
                    stackId="1"
                    stroke="var(--color-activeUsers)"
                    fill="var(--color-activeUsers)"
                    name="Active Users"
                  />
                  <Area
                    type="monotone"
                    dataKey="newUsers"
                    stackId="1"
                    stroke="var(--color-newUsers)"
                    fill="var(--color-newUsers)"
                    name="New Users"
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Avg Search Time"
              value={`${analyticsData.performanceMetrics.avgSearchTime}s`}
              change={-5}
              changeLabel="improvement"
              icon={ClockIcon}
              trend="up"
            />
            <MetricCard
              title="Avg Upload Time"
              value={`${analyticsData.performanceMetrics.avgUploadTime}s`}
              change={2}
              changeLabel="vs last month"
              icon={TrendingUp}
              trend="down"
            />
            <MetricCard
              title="System Uptime"
              value={`${analyticsData.performanceMetrics.systemUptime}%`}
              change={0.1}
              changeLabel="vs last month"
              icon={ActivityIcon}
              trend="up"
            />
            <MetricCard
              title="Error Rate"
              value={`${analyticsData.performanceMetrics.errorRate}%`}
              change={-10}
              changeLabel="improvement"
              icon={TrendingDown}
              trend="up"
            />
          </div>

          {/* Performance Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Response Time Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig}>
                  <LineChart
                    data={analyticsData.documentViews.map((d) => ({
                      ...d,
                      responseTime: Math.random() * 0.5 + 0.1,
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="responseTime"
                      stroke="var(--color-responseTime)"
                      name="Response Time (s)"
                    />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Load</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig}>
                  <AreaChart
                    data={analyticsData.documentViews.map((d) => ({
                      ...d,
                      cpuUsage: Math.random() * 40 + 30,
                      memoryUsage: Math.random() * 30 + 40,
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Area
                      type="monotone"
                      dataKey="cpuUsage"
                      stackId="1"
                      stroke="var(--color-cpuUsage)"
                      fill="var(--color-cpuUsage)"
                      name="CPU %"
                    />
                    <Area
                      type="monotone"
                      dataKey="memoryUsage"
                      stackId="1"
                      stroke="var(--color-memoryUsage)"
                      fill="var(--color-memoryUsage)"
                      name="Memory %"
                    />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
