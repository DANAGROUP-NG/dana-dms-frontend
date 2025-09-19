import { Clock, User, CheckCircle } from "lucide-react"
import { Badge } from "../components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"

const mockAssignments = [
  {
    id: "1",
    title: "Review Q4 Financial Report",
    description: "Please review the quarterly financial report and provide feedback",
    assignee: "Sarah Johnson",
    dueDate: "2024-01-20",
    status: "pending",
    priority: "high",
  },
  {
    id: "2",
    title: "Approve Marketing Campaign",
    description: "Review and approve the new marketing campaign materials",
    assignee: "Mike Chen",
    dueDate: "2024-01-18",
    status: "in-progress",
    priority: "medium",
  },
  {
    id: "3",
    title: "Update Employee Handbook",
    description: "Update the employee handbook with new policies",
    assignee: "Emily Davis",
    dueDate: "2024-01-25",
    status: "completed",
    priority: "low",
  },
]

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  "in-progress": "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
}

const priorityColors = {
  high: "bg-red-100 text-red-800",
  medium: "bg-orange-100 text-orange-800",
  low: "bg-gray-100 text-gray-800",
}

export function Assignments() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Assignments</h1>
          <p className="text-muted-foreground">Track and manage document review assignments</p>
        </div>
      </div>

      {/* Assignments List */}
      <div className="space-y-4">
        {mockAssignments.map((assignment) => (
          <Card key={assignment.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{assignment.title}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge className={priorityColors[assignment.priority as keyof typeof priorityColors]}>
                    {assignment.priority}
                  </Badge>
                  <Badge className={statusColors[assignment.status as keyof typeof statusColors]}>
                    {assignment.status}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">{assignment.description}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {assignment.assignee}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      Due {assignment.dueDate}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {assignment.status === "pending" && (
                      <Button size="sm">
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Start Review
                      </Button>
                    )}
                    {assignment.status === "in-progress" && (
                      <Button size="sm">
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Complete
                      </Button>
                    )}
                    {assignment.status === "completed" && (
                      <div className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm">Completed</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
