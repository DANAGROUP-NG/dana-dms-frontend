"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { WorkflowBuilder } from "../components/workflow/WorkflowBuilder"
import { ApprovalChain } from "../components/workflow/ApprovalChain"
import { WorkflowTimeline } from "../components/workflow/WorkflowTimeline"
import { AssignmentPanel } from "../components/assignments/AssignmentPanel"
import { TaskDashboard } from "../components/tasks/TaskDashboard"
import { QuickActions } from "../components/tasks/QuickActions"
import { CommentThread } from "../components/comments/CommentThread"
import { NotificationCenter } from "../components/notifications/NotificationCenter"
import type { WorkflowInstance, Assignment, Comment, Notification } from "../types/workflow"

// Mock data
const mockWorkflow: WorkflowInstance = {
  id: "workflow-1",
  documentId: "doc-1",
  name: "Document Review Workflow",
  status: "active",
  steps: [
    {
      id: "step-1",
      name: "Initial Review",
      type: "review",
      assigneeType: "user",
      assigneeId: "user-1",
      assigneeName: "Sarah Johnson",
      status: "completed",
      order: 1,
      position: { x: 100, y: 100 },
      completedDate: "2024-01-15T14:30:00Z",
      completedBy: "Sarah Johnson",
    },
    {
      id: "step-2",
      name: "Manager Approval",
      type: "approval",
      assigneeType: "user",
      assigneeId: "user-2",
      assigneeName: "Mike Chen",
      status: "in-progress",
      order: 2,
      position: { x: 300, y: 100 },
      dueDate: "2024-01-18T17:00:00Z",
    },
    {
      id: "step-3",
      name: "Final Sign-off",
      type: "approval",
      assigneeType: "user",
      assigneeId: "user-3",
      assigneeName: "Emily Davis",
      status: "pending",
      order: 3,
      position: { x: 500, y: 100 },
    },
  ],
  currentStepId: "step-2",
  startDate: "2024-01-15T10:00:00Z",
  createdBy: "John Smith",
  assignedUsers: ["user-1", "user-2", "user-3"],
  priority: "high",
  metadata: {},
}

export function WorkflowManagement() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])

  const handleSaveWorkflow = (workflow: Partial<WorkflowInstance>) => {
    console.log("Saving workflow:", workflow)
  }

  const handlePublishWorkflow = (workflow: WorkflowInstance) => {
    console.log("Publishing workflow:", workflow)
  }

  const handleApprove = (stepId: string, comment?: string) => {
    console.log("Approving step:", stepId, comment)
  }

  const handleReject = (stepId: string, comment: string) => {
    console.log("Rejecting step:", stepId, comment)
  }

  const handleRequestChanges = (stepId: string, comment: string) => {
    console.log("Requesting changes:", stepId, comment)
  }

  const handleCreateAssignment = (assignment: Partial<Assignment>) => {
    setAssignments((prev) => [...prev, assignment as Assignment])
  }

  const handleUpdateAssignment = (id: string, updates: Partial<Assignment>) => {
    setAssignments((prev) => prev.map((a) => (a.id === id ? { ...a, ...updates } : a)))
  }

  const handleDeleteAssignment = (id: string) => {
    setAssignments((prev) => prev.filter((a) => a.id !== id))
  }

  const handleBulkAction = (assignmentIds: string[], action: string) => {
    console.log("Bulk action:", action, assignmentIds)
  }

  const handleAddComment = (comment: Partial<Comment>) => {
    setComments((prev) => [...prev, comment as Comment])
  }

  const handleUpdateComment = (id: string, updates: Partial<Comment>) => {
    setComments((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)))
  }

  const handleDeleteComment = (id: string) => {
    setComments((prev) => prev.filter((c) => c.id !== id))
  }

  const handleResolveComment = (id: string) => {
    setComments((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isResolved: true, resolvedDate: new Date().toISOString() } : c)),
    )
  }

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)))
  }

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
  }

  const handleDeleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const handleQuickAction = (assignmentId: string, action: string) => {
    console.log("Quick action:", action, assignmentId)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Workflow Management</h1>
        <p className="text-muted-foreground">Build workflows, manage assignments, and track approvals</p>
      </div>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="builder">Builder</TabsTrigger>
          <TabsTrigger value="approvals">Approvals</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="comments">Discussion</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <TaskDashboard
                assignments={assignments}
                onUpdateAssignment={handleUpdateAssignment}
                onBulkAction={handleBulkAction}
              />
            </div>
            <div>
              <QuickActions assignments={assignments} onQuickAction={handleQuickAction} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="builder" className="space-y-6">
          <WorkflowBuilder onSave={handleSaveWorkflow} onPublish={handlePublishWorkflow} />
        </TabsContent>

        <TabsContent value="approvals" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ApprovalChain
              workflow={mockWorkflow}
              onApprove={handleApprove}
              onReject={handleReject}
              onRequestChanges={handleRequestChanges}
              canTakeAction={true}
              currentUserId="user-2"
            />
            <WorkflowTimeline workflow={mockWorkflow} />
          </div>
        </TabsContent>

        <TabsContent value="assignments" className="space-y-6">
          <AssignmentPanel
            assignments={assignments}
            onCreateAssignment={handleCreateAssignment}
            onUpdateAssignment={handleUpdateAssignment}
            onDeleteAssignment={handleDeleteAssignment}
          />
        </TabsContent>

        <TabsContent value="comments" className="space-y-6">
          <CommentThread
            comments={comments}
            onAddComment={handleAddComment}
            onUpdateComment={handleUpdateComment}
            onDeleteComment={handleDeleteComment}
            onResolveComment={handleResolveComment}
          />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <NotificationCenter
            notifications={notifications}
            onMarkAsRead={handleMarkAsRead}
            onMarkAllAsRead={handleMarkAllAsRead}
            onDeleteNotification={handleDeleteNotification}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
