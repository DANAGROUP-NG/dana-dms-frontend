"use client"

import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  CheckSquare,
  Clock,
  MoreHorizontal,
  Pause,
  Play,
  Search,
  User,
} from "lucide-react"
import { useMemo, useState } from "react"
import { cn } from "../../lib/utils"
import type { Assignment } from "../../types/workflow"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Checkbox } from "../ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { Input } from "../ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"

interface TaskDashboardProps {
  assignments?: Assignment[]
  currentUserId?: string
  onUpdateAssignment: (id: string, updates: Partial<Assignment>) => void
  onBulkAction: (assignmentIds: string[], action: string) => void
  className?: string
}

const mockAssignments: Assignment[] = [
  {
    id: "1",
    documentId: "doc-1",
    documentName: "Q4 Financial Report.pdf",
    title: "Review Financial Data",
    description: "Please review the quarterly financial data and provide feedback on accuracy",
    assigneeId: "current-user",
    assigneeName: "Current User",
    assigneeEmail: "user@company.com",
    assignedBy: "John Smith",
    assignedDate: "2024-01-15T10:00:00Z",
    dueDate: "2024-01-20T17:00:00Z",
    priority: "high",
    status: "in-progress",
    type: "review",
    tags: ["finance", "quarterly"],
  },
  {
    id: "2",
    documentId: "doc-2",
    documentName: "Marketing Campaign.docx",
    title: "Approve Campaign Materials",
    description: "Review and approve the new marketing campaign materials for Q1 launch",
    assigneeId: "current-user",
    assigneeName: "Current User",
    assigneeEmail: "user@company.com",
    assignedBy: "Emily Davis",
    assignedDate: "2024-01-16T09:00:00Z",
    dueDate: "2024-01-18T12:00:00Z",
    priority: "urgent",
    status: "pending",
    type: "approval",
    tags: ["marketing", "campaign"],
  },
  {
    id: "3",
    documentId: "doc-3",
    documentName: "Employee Handbook.pdf",
    title: "Update Policy Section",
    description: "Update the employee handbook with new remote work policies",
    assigneeId: "current-user",
    assigneeName: "Current User",
    assigneeEmail: "user@company.com",
    assignedBy: "HR Team",
    assignedDate: "2024-01-10T14:00:00Z",
    dueDate: "2024-01-12T17:00:00Z",
    priority: "normal",
    status: "overdue",
    type: "edit",
    tags: ["hr", "policy"],
  },
  {
    id: "4",
    documentId: "doc-4",
    documentName: "Project Proposal.docx",
    title: "Final Review",
    description: "Conduct final review before client presentation",
    assigneeId: "current-user",
    assigneeName: "Current User",
    assigneeEmail: "user@company.com",
    assignedBy: "Project Manager",
    assignedDate: "2024-01-14T11:00:00Z",
    completedDate: "2024-01-16T15:30:00Z",
    priority: "high",
    status: "completed",
    type: "review",
    tags: ["project", "client"],
  },
]

const priorityColors = {
  low: "text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-300",
  normal: "text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300",
  high: "text-orange-600 bg-orange-100 dark:bg-orange-900 dark:text-orange-300",
  urgent: "text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300",
}

const statusColors = {
  pending: "text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300",
  "in-progress": "text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300",
  completed: "text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300",
  overdue: "text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300",
  cancelled: "text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-300",
}

export function TaskDashboard({
  assignments = mockAssignments,
  currentUserId = "current-user",
  onUpdateAssignment,
  onBulkAction,
  className,
}: TaskDashboardProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("active")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [selectedTasks, setSelectedTasks] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<string>("dueDate")

  // Filter and sort assignments
  const filteredAndSortedAssignments = useMemo(() => {
    const filtered = assignments.filter((assignment) => {
      // Only show current user's assignments
      if (assignment.assigneeId !== currentUserId) return false

      const matchesSearch =
        assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assignment.documentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assignment.description.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && ["pending", "in-progress"].includes(assignment.status)) ||
        assignment.status === statusFilter

      const matchesPriority = priorityFilter === "all" || assignment.priority === priorityFilter

      return matchesSearch && matchesStatus && matchesPriority
    })

    // Sort assignments
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "dueDate":
          if (!a.dueDate && !b.dueDate) return 0
          if (!a.dueDate) return 1
          if (!b.dueDate) return -1
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        case "priority":
          const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 }
          return priorityOrder[a.priority] - priorityOrder[b.priority]
        case "assignedDate":
          return new Date(b.assignedDate).getTime() - new Date(a.assignedDate).getTime()
        case "title":
          return a.title.localeCompare(b.title)
        default:
          return 0
      }
    })

    return filtered
  }, [assignments, currentUserId, searchTerm, statusFilter, priorityFilter, sortBy])

  // Calculate stats
  const stats = useMemo(() => {
    const userAssignments = assignments.filter((a) => a.assigneeId === currentUserId)
    const pending = userAssignments.filter((a) => a.status === "pending").length
    const inProgress = userAssignments.filter((a) => a.status === "in-progress").length
    const overdue = userAssignments.filter((a) => {
      if (!a.dueDate || a.status === "completed") return false
      return new Date(a.dueDate) < new Date()
    }).length
    const completed = userAssignments.filter((a) => a.status === "completed").length

    return { pending, inProgress, overdue, completed, total: userAssignments.length }
  }, [assignments, currentUserId])

  const handleTaskToggle = (taskId: string) => {
    setSelectedTasks((prev) => (prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]))
  }

  const handleSelectAll = () => {
    if (selectedTasks.length === filteredAndSortedAssignments.length) {
      setSelectedTasks([])
    } else {
      setSelectedTasks(filteredAndSortedAssignments.map((a) => a.id))
    }
  }

  const handleBulkAction = (action: string) => {
    onBulkAction(selectedTasks, action)
    setSelectedTasks([])
  }

  const isOverdue = (assignment: Assignment) => {
    if (!assignment.dueDate || assignment.status === "completed") return false
    return new Date(assignment.dueDate) < new Date()
  }

  const formatDueDate = (dueDate: string) => {
    const date = new Date(dueDate)
    const now = new Date()
    const diffInHours = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 0) return "Overdue"
    if (diffInHours < 24) return `Due in ${diffInHours}h`
    if (diffInHours < 168) return `Due in ${Math.floor(diffInHours / 24)}d`
    return `Due ${date.toLocaleDateString()}`
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header with Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">My Tasks</CardTitle>
          <p className="text-sm text-muted-foreground">Manage your assigned tasks and approvals</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
              <div className="text-sm text-muted-foreground">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
              <div className="text-sm text-muted-foreground">Overdue</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters and Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dueDate">Due Date</SelectItem>
                  <SelectItem value="priority">Priority</SelectItem>
                  <SelectItem value="assignedDate">Assigned Date</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedTasks.length > 0 && (
            <div className="flex items-center gap-2 mt-4 p-3 bg-muted/50 rounded-lg">
              <span className="text-sm font-medium">
                {selectedTasks.length} task{selectedTasks.length !== 1 ? "s" : ""} selected
              </span>
              <div className="flex gap-2 ml-auto">
                <Button size="sm" onClick={() => handleBulkAction("start")}>
                  <Play className="h-4 w-4 mr-2" />
                  Start
                </Button>
                <Button size="sm" onClick={() => handleBulkAction("complete")}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Complete
                </Button>
                <Button size="sm" variant="outline" onClick={() => setSelectedTasks([])}>
                  Clear
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Task List */}
      <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="active">Active ({stats.pending + stats.inProgress})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
          <TabsTrigger value="overdue">Overdue ({stats.overdue})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({stats.completed})</TabsTrigger>
        </TabsList>

        <TabsContent value={statusFilter} className="space-y-4 mt-6">
          {/* Select All Checkbox */}
          {filteredAndSortedAssignments.length > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-muted/30 rounded-lg">
              <Checkbox
                checked={selectedTasks.length === filteredAndSortedAssignments.length}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm text-muted-foreground">
                Select all {filteredAndSortedAssignments.length} task
                {filteredAndSortedAssignments.length !== 1 ? "s" : ""}
              </span>
            </div>
          )}

          {filteredAndSortedAssignments.map((assignment) => {
            const overdue = isOverdue(assignment)
            const isSelected = selectedTasks.includes(assignment.id)

            return (
              <Card
                key={assignment.id}
                className={cn(
                  "transition-all duration-200",
                  overdue && "border-red-200 dark:border-red-800",
                  isSelected && "ring-2 ring-primary/20 bg-primary/5",
                )}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => handleTaskToggle(assignment.id)}
                      className="mt-1"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium text-foreground truncate">{assignment.title}</h3>
                        <Badge className={cn("text-xs", priorityColors[assignment.priority])}>
                          {assignment.priority}
                        </Badge>
                        <Badge className={cn("text-xs", statusColors[assignment.status])}>
                          {assignment.status.replace("-", " ")}
                        </Badge>
                        {overdue && (
                          <Badge variant="destructive" className="text-xs">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Overdue
                          </Badge>
                        )}
                      </div>

                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{assignment.description}</p>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          <span>{assignment.documentName}</span>
                        </div>

                        {assignment.dueDate && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span className={cn(overdue && "text-red-600 font-medium")}>
                              {formatDueDate(assignment.dueDate)}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>Assigned {new Date(assignment.assignedDate).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {assignment.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {assignment.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {assignment.status === "pending" && (
                        <Button size="sm" onClick={() => onUpdateAssignment(assignment.id, { status: "in-progress" })}>
                          <Play className="h-4 w-4 mr-2" />
                          Start
                        </Button>
                      )}
                      {assignment.status === "in-progress" && (
                        <Button
                          size="sm"
                          onClick={() =>
                            onUpdateAssignment(assignment.id, {
                              status: "completed",
                              completedDate: new Date().toISOString(),
                            })
                          }
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Complete
                        </Button>
                      )}

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Document</DropdownMenuItem>
                          <DropdownMenuItem>Add Comment</DropdownMenuItem>
                          <DropdownMenuItem>Request Extension</DropdownMenuItem>
                          {assignment.status === "in-progress" && (
                            <DropdownMenuItem onClick={() => onUpdateAssignment(assignment.id, { status: "pending" })}>
                              <Pause className="mr-2 h-4 w-4" />
                              Pause Task
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}

          {filteredAndSortedAssignments.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  {searchTerm || statusFilter === "completed" || statusFilter !== "all" || priorityFilter !== "all"
                    ? statusFilter === "completed"
                      ? "No completed tasks"
                      : "No matching tasks"
                    : "No tasks assigned"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {searchTerm || statusFilter === "completed" || statusFilter !== "all" || priorityFilter !== "all"
                    ? statusFilter === "completed"
                      ? "Completed tasks will appear here."
                      : "Try adjusting your filters to find tasks."
                    : "New task assignments will appear here."}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
