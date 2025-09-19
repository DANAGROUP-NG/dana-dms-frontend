import { BarChart3, FileText, Folder, Users, TrendingUp, Clock } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"

const stats = [
  {
    title: "Total Documents",
    value: "2,847",
    change: "+12%",
    icon: FileText,
    trend: "up",
  },
  {
    title: "Active Folders",
    value: "156",
    change: "+3%",
    icon: Folder,
    trend: "up",
  },
  {
    title: "Team Members",
    value: "24",
    change: "+2",
    icon: Users,
    trend: "up",
  },
  {
    title: "Pending Reviews",
    value: "8",
    change: "-4",
    icon: Clock,
    trend: "down",
  },
]

const recentActivity = [
  {
    id: "1",
    action: "Document uploaded",
    document: "Q4 Financial Report.pdf",
    user: "Sarah Johnson",
    time: "2 minutes ago",
  },
  {
    id: "2",
    action: "Folder created",
    document: "Marketing Materials",
    user: "Mike Chen",
    time: "15 minutes ago",
  },
  {
    id: "3",
    action: "Document reviewed",
    document: "Project Proposal.docx",
    user: "Emily Davis",
    time: "1 hour ago",
  },
  {
    id: "4",
    action: "Workflow completed",
    document: "Contract Review Process",
    user: "System",
    time: "2 hours ago",
  },
]

export function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's what's happening with your documents.</p>
        </div>
        <Button>
          <BarChart3 className="mr-2 h-4 w-4" />
          View Reports
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className={`text-xs ${stat.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                  <TrendingUp className={`inline mr-1 h-3 w-3 ${stat.trend === "down" ? "rotate-180" : ""}`} />
                  {stat.change} from last month
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest actions in your document management system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-4">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">{activity.action}</p>
                    <p className="text-sm text-muted-foreground">
                      {activity.document} by {activity.user}
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground">{activity.time}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks to get you started</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start bg-transparent">
              <FileText className="mr-2 h-4 w-4" />
              Upload New Document
            </Button>
            <Button variant="outline" className="w-full justify-start bg-transparent">
              <Folder className="mr-2 h-4 w-4" />
              Create New Folder
            </Button>
            <Button variant="outline" className="w-full justify-start bg-transparent">
              <Users className="mr-2 h-4 w-4" />
              Invite Team Member
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
