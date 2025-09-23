"use client"

import { AlertTriangle, Calendar, CheckCircle, Clock, MoreHorizontal, Plus, Search, User } from "lucide-react"
import { useState } from "react"
import { cn } from "../../lib/utils"
import type { Assignment } from "../../types/workflow"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Textarea } from "../ui/textarea"

interface AssignmentPanelProps {
  documentId?: string
  assignments?: Assignment[]
  onCreateAssignment: (assignment: Partial<Assignment>) => void
  onUpdateAssignment: (id: string, updates: Partial<Assignment>) => void
  onDeleteAssignment: (id: string) => void
  className?: string
}

const mockUsers = [
  { id: "1", name: "Sarah Johnson", email: "sarah@company.com", avatar: "/placeholder.svg?height=32&width=32" },
  { id: "2", name: "Mike Chen", email: "mike@company.com", avatar: "/placeholder.svg?height=32&width=32" },
  { id: "3", name: "Emily Davis", email: "emily@company.com", avatar: "/placeholder.svg?height=32&width=32" },
  { id: "4", name: "John Smith", email: "john@company.com", avatar: "/placeholder.svg?height=32&width=32" },
]

const mockAssignments: Assignment[] = [
  {
    id: "1",
    documentId: "doc-1",
    documentName: "Q4 Financial Report.pdf",
    title: "Review Financial Data",
    description: "Please review the quarterly financial data and provide feedback on accuracy",
    assigneeId: "1",
    assigneeName: "Sarah Johnson",
    assigneeEmail: "sarah@company.com",
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
    assigneeId: "2",
    assigneeName: "Mike Chen",
    assigneeEmail: "mike@company.com",
    assignedBy: "Emily Davis",
    assignedDate: "2024-01-16T09:00:00Z",
    dueDate: "2024-01-18T12:00:00Z",
    priority: "urgent",
    status: "pending",
    type: "approval",
    tags: ["marketing", "campaign"],
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

export function AssignmentPanel({
  documentId,
  assignments = mockAssignments,
  onCreateAssignment,
  onUpdateAssignment,
  onDeleteAssignment,
  className,
}: AssignmentPanelProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newAssignment, setNewAssignment] = useState<Partial<Assignment>>({
    title: "",
    description: "",
    assigneeId: "",
    priority: "normal",
    type: "review",
    tags: [],
  })

  // Filter assignments
  const filteredAssignments = assignments.filter((assignment) => {
    const matchesSearch =
      assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.assigneeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.documentName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || assignment.status === statusFilter
    const matchesPriority = priorityFilter === "all" || assignment.priority === priorityFilter
    const matchesDocument = !documentId || assignment.documentId === documentId

    return matchesSearch && matchesStatus && matchesPriority && matchesDocument
  })

  const handleCreateAssignment = () => {
    if (!newAssignment.title || !newAssignment.assigneeId) return

    const assignee = mockUsers.find((u) => u.id === newAssignment.assigneeId)
    const assignment: Partial<Assignment> = {
      ...newAssignment,
      id: `assignment-${Date.now()}`,
      documentId: documentId || "doc-1",
      documentName: "Current Document.pdf",
      assigneeName: assignee?.name || "",
      assigneeEmail: assignee?.email || "",
      assignedBy: "Current User",
      assignedDate: new Date().toISOString(),
      status: "pending",
    }

    onCreateAssignment(assignment)
    setNewAssignment({
      title: "",
      description: "",
      assigneeId: "",
      priority: "normal",
      type: "review",
      tags: [],
    })
    setShowCreateDialog(false)
  }

  const getOverdueCount = () => {
    return assignments.filter((a) => {
      if (!a.dueDate || a.status === "completed") return false
      return new Date(a.dueDate) < new Date()
    }).length
  }

  const getPendingCount = () => {
    return assignments.filter((a) => a.status === "pending").length
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header with Stats */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Assignment Management</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Manage document assignments and track progress</p>
            </div>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Assignment
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Assignment</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="assignment-title">Title</Label>
                    <Input
                      id="assignment-title"
                      value={newAssignment.title || ""}
                      onChange={(e) => setNewAssignment((prev) => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter assignment title..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="assignment-description">Description</Label>
                    <Textarea
                      id="assignment-description"
                      value={newAssignment.description || ""}
                      onChange={(e) => setNewAssignment((prev) => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe what needs to be done..."
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="assignee">Assign to</Label>
                      <Select
                        value={newAssignment.assigneeId || ""}
                        onValueChange={(value) => setNewAssignment((prev) => ({ ...prev, assigneeId: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select user..." />
                        </SelectTrigger>
                        <SelectContent>
                          {mockUsers.map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                                  <AvatarFallback className="text-xs">
                                    {user.name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                                {user.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="due-date">Due Date</Label>
                      <Input
                        id="due-date"
                        type="datetime-local"
                        value={newAssignment.dueDate || ""}
                        onChange={(e) => setNewAssignment((prev) => ({ ...prev, dueDate: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="priority">Priority</Label>
                      <Select
                        value={newAssignment.priority || "normal"}
                        onValueChange={(value) => setNewAssignment((prev) => ({ ...prev, priority: value as any }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="type">Type</Label>
                      <Select
                        value={newAssignment.type || "review"}
                        onValueChange={(value) => setNewAssignment((prev) => ({ ...prev, type: value as any }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="review">Review</SelectItem>
                          <SelectItem value="approval">Approval</SelectItem>
                          <SelectItem value="edit">Edit</SelectItem>
                          <SelectItem value="comment">Comment</SelectItem>
                          <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateAssignment} disabled={!newAssignment.title || !newAssignment.assigneeId}>
                    Create Assignment
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{assignments.length}</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{getPendingCount()}</div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {assignments.filter((a) => a.status === "in-progress").length}
              </div>
              <div className="text-sm text-muted-foreground">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{getOverdueCount()}</div>
              <div className="text-sm text-muted-foreground">Overdue</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search assignments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Assignments List */}
      <div className="space-y-4">
        {filteredAssignments.map((assignment) => {
          const isOverdue =
            assignment.dueDate && new Date(assignment.dueDate) < new Date() && assignment.status !== "completed"

          return (
            <Card key={assignment.id} className={cn(isOverdue && "border-red-200 dark:border-red-800")}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium text-foreground truncate">{assignment.title}</h3>
                      <Badge className={cn("text-xs", priorityColors[assignment.priority])}>
                        {assignment.priority}
                      </Badge>
                      <Badge className={cn("text-xs", statusColors[assignment.status])}>
                        {assignment.status.replace("-", " ")}
                      </Badge>
                      {isOverdue && (
                        <Badge variant="destructive" className="text-xs">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Overdue
                        </Badge>
                      )}
                    </div>

                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{assignment.description}</p>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage
                            src={assignment.assigneeAvatar || "/placeholder.svg"}
                            alt={assignment.assigneeName}
                          />
                          <AvatarFallback className="text-xs">
                            {assignment.assigneeName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <span>{assignment.assigneeName}</span>
                      </div>

                      {assignment.dueDate && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>Due {new Date(assignment.dueDate).toLocaleDateString()}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Assigned {new Date(assignment.assignedDate).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {assignment.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
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
                        <DropdownMenuItem>Edit Assignment</DropdownMenuItem>
                        <DropdownMenuItem>Reassign</DropdownMenuItem>
                        <DropdownMenuItem>Add Comment</DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => onDeleteAssignment(assignment.id)}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredAssignments.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No assignments found</h3>
            <p className="text-sm text-muted-foreground">
              {searchTerm || statusFilter !== "all" || priorityFilter !== "all"
                ? "Try adjusting your filters to find assignments."
                : "Create your first assignment to get started."}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Create Assignment Dialog was moved inside the Dialog above */}
    </div>
  )
}
