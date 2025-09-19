"use client"

import { CheckCircle, Clock, AlertTriangle, Zap, Calendar, User } from "lucide-react"
import { Button } from "../ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Badge } from "../ui/badge"
import { cn } from "../../lib/utils"
import type { Assignment } from "../../types/workflow"

interface QuickActionsProps {
  assignments: Assignment[]
  currentUserId?: string
  onQuickAction: (assignmentId: string, action: string) => void
  className?: string
}

export function QuickActions({
  assignments,
  currentUserId = "current-user",
  onQuickAction,
  className,
}: QuickActionsProps) {
  // Get user's assignments that need quick actions
  const userAssignments = assignments.filter((a) => a.assigneeId === currentUserId)

  // Get urgent tasks due today or overdue
  const urgentTasks = userAssignments
    .filter((assignment) => {
      if (assignment.status === "completed") return false
      if (!assignment.dueDate) return false

      const dueDate = new Date(assignment.dueDate)
      const today = new Date()
      const diffInHours = Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60))

      return diffInHours <= 24 // Due within 24 hours or overdue
    })
    .slice(0, 3) // Show max 3 urgent tasks

  // Get pending approvals
  const pendingApprovals = userAssignments.filter((a) => a.status === "pending" && a.type === "approval").slice(0, 3)

  // Get tasks that can be quickly completed
  const quickCompleteTasks = userAssignments
    .filter((a) => a.status === "in-progress" && a.type === "review")
    .slice(0, 3)

  if (urgentTasks.length === 0 && pendingApprovals.length === 0 && quickCompleteTasks.length === 0) {
    return null
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Urgent Tasks */}
      {urgentTasks.length > 0 && (
        <Card className="border-red-200 dark:border-red-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertTriangle className="h-5 w-5" />
              Urgent Tasks
            </CardTitle>
            <p className="text-sm text-muted-foreground">Tasks due today or overdue</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {urgentTasks.map((task) => {
              const isOverdue = task.dueDate && new Date(task.dueDate) < new Date()

              return (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950/20 rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">{task.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {task.documentName}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{isOverdue ? "Overdue" : "Due today"}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {task.status === "pending" && (
                      <Button size="sm" variant="outline" onClick={() => onQuickAction(task.id, "start")}>
                        Start
                      </Button>
                    )}
                    {task.status === "in-progress" && (
                      <Button size="sm" onClick={() => onQuickAction(task.id, "complete")}>
                        Complete
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      {/* Pending Approvals */}
      {pendingApprovals.length > 0 && (
        <Card className="border-yellow-200 dark:border-yellow-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
              <Clock className="h-5 w-5" />
              Pending Approvals
            </CardTitle>
            <p className="text-sm text-muted-foreground">Documents waiting for your approval</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingApprovals.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg"
              >
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm truncate">{task.title}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {task.documentName}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <User className="h-3 w-3" />
                      <span>from {task.assignedBy}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => onQuickAction(task.id, "reject")}>
                    Reject
                  </Button>
                  <Button size="sm" onClick={() => onQuickAction(task.id, "approve")}>
                    Approve
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Quick Complete */}
      {quickCompleteTasks.length > 0 && (
        <Card className="border-green-200 dark:border-green-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-green-600 dark:text-green-400">
              <Zap className="h-5 w-5" />
              Quick Complete
            </CardTitle>
            <p className="text-sm text-muted-foreground">Tasks in progress that can be completed</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {quickCompleteTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-lg"
              >
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm truncate">{task.title}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {task.documentName}
                    </Badge>
                    {task.dueDate && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>Due {new Date(task.dueDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
                <Button size="sm" onClick={() => onQuickAction(task.id, "complete")}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Complete
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
