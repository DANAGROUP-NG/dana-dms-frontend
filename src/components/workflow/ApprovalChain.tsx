"use client"

import { useState } from "react"
import {
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  User,
  Calendar,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
} from "lucide-react"
import { Button } from "../ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Badge } from "../ui/badge"
import { Avatar, AvatarFallback } from "../ui/avatar"
import { Progress } from "../ui/progress"
import { Textarea } from "../ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"
import { cn } from "../../lib/utils"
import type { WorkflowInstance, WorkflowStep } from "../../types/workflow"

interface ApprovalChainProps {
  workflow: WorkflowInstance
  onApprove: (stepId: string, comment?: string) => void
  onReject: (stepId: string, comment: string) => void
  onRequestChanges: (stepId: string, comment: string) => void
  canTakeAction?: boolean
  currentUserId?: string
  className?: string
}

const getStepIcon = (status: WorkflowStep["status"]) => {
  switch (status) {
    case "completed":
      return CheckCircle
    case "in-progress":
      return Clock
    case "rejected":
      return XCircle
    case "pending":
      return AlertTriangle
    default:
      return Clock
  }
}

const getStepColor = (status: WorkflowStep["status"]) => {
  switch (status) {
    case "completed":
      return "text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300"
    case "in-progress":
      return "text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300"
    case "rejected":
      return "text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300"
    case "pending":
      return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300"
    default:
      return "text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-300"
  }
}

export function ApprovalChain({
  workflow,
  onApprove,
  onReject,
  onRequestChanges,
  canTakeAction = false,
  currentUserId,
  className,
}: ApprovalChainProps) {
  const [actionComment, setActionComment] = useState("")
  const [showActionDialog, setShowActionDialog] = useState<{
    stepId: string
    action: "approve" | "reject" | "request-changes"
  } | null>(null)

  const sortedSteps = [...workflow.steps].sort((a, b) => a.order - b.order)
  const completedSteps = sortedSteps.filter((step) => step.status === "completed").length
  const totalSteps = sortedSteps.length
  const progressPercentage = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0

  const currentStep =
    sortedSteps.find((step) => step.status === "in-progress") || sortedSteps.find((step) => step.status === "pending")

  const canUserTakeAction = (step: WorkflowStep) => {
    return (
      canTakeAction && currentUserId === step.assigneeId && (step.status === "pending" || step.status === "in-progress")
    )
  }

  const handleAction = (action: "approve" | "reject" | "request-changes") => {
    if (!showActionDialog) return

    const { stepId } = showActionDialog

    switch (action) {
      case "approve":
        onApprove(stepId, actionComment || undefined)
        break
      case "reject":
        onReject(stepId, actionComment || "No reason provided")
        break
      case "request-changes":
        onRequestChanges(stepId, actionComment || "Changes requested")
        break
    }

    setActionComment("")
    setShowActionDialog(null)
  }

  const isOverdue = (step: WorkflowStep) => {
    if (!step.dueDate || step.status === "completed") return false
    return new Date(step.dueDate) < new Date()
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Workflow Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">{workflow.name}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {workflow.status === "active"
                  ? "In Progress"
                  : workflow.status.charAt(0).toUpperCase() + workflow.status.slice(1)}
                {workflow.startDate && <> • Started {new Date(workflow.startDate).toLocaleDateString()}</>}
              </p>
            </div>
            <Badge
              variant="secondary"
              className={cn(
                "text-xs",
                workflow.status === "completed" && "text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300",
                workflow.status === "active" && "text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300",
                workflow.status === "cancelled" && "text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300",
              )}
            >
              {workflow.status.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">
                  {completedSteps} of {totalSteps} steps completed
                </span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>

            {currentStep && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Current step:</span>
                <span className="font-medium">{currentStep.name}</span>
                {currentStep.assigneeName && (
                  <>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground">Assigned to {currentStep.assigneeName}</span>
                  </>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Approval Steps */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Approval Chain</CardTitle>
          <p className="text-sm text-muted-foreground">Track progress through each approval step</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-6 relative">
            {/* Timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-px bg-border"></div>

            {sortedSteps.map((step, index) => {
              const StepIcon = getStepIcon(step.status)
              const isLast = index === sortedSteps.length - 1
              const overdue = isOverdue(step)
              const canAct = canUserTakeAction(step)

              return (
                <div key={step.id} className="flex gap-4 relative">
                  {/* Timeline dot */}
                  <div
                    className={cn(
                      "relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 border-background",
                      getStepColor(step.status),
                      overdue && "ring-2 ring-red-500 ring-offset-2",
                    )}
                  >
                    <StepIcon className="h-5 w-5" />
                  </div>

                  {/* Step content */}
                  <div className="flex-1 min-w-0 pb-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium text-foreground">{step.name}</h3>
                          <Badge variant="outline" className={cn("text-xs", getStepColor(step.status))}>
                            {step.status.replace("-", " ")}
                          </Badge>
                          {overdue && (
                            <Badge variant="destructive" className="text-xs">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Overdue
                            </Badge>
                          )}
                        </div>

                        {step.description && <p className="text-sm text-muted-foreground mb-3">{step.description}</p>}

                        {step.assigneeName && (
                          <div className="flex items-center gap-2 mb-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs">
                                {step.assigneeName
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-muted-foreground">
                              {step.assigneeName}
                              {step.assigneeType === "role" && " (Role)"}
                              {step.assigneeType === "group" && " (Group)"}
                            </span>
                          </div>
                        )}

                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-2">
                          {step.dueDate && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>Due {new Date(step.dueDate).toLocaleDateString()}</span>
                            </div>
                          )}
                          {step.completedDate && (
                            <div className="flex items-center gap-1">
                              <CheckCircle className="h-4 w-4" />
                              <span>Completed {new Date(step.completedDate).toLocaleDateString()}</span>
                            </div>
                          )}
                          {step.completedBy && (
                            <div className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              <span>by {step.completedBy}</span>
                            </div>
                          )}
                        </div>

                        {step.notes && (
                          <div className="bg-muted/50 rounded-lg p-3 mb-3">
                            <div className="flex items-center gap-2 mb-1">
                              <MessageSquare className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm font-medium">Notes</span>
                            </div>
                            <p className="text-sm text-muted-foreground">{step.notes}</p>
                          </div>
                        )}

                        {/* Action buttons for current user */}
                        {canAct && (
                          <div className="flex items-center gap-2 mt-3">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  onClick={() => setShowActionDialog({ stepId: step.id, action: "approve" })}
                                >
                                  <ThumbsUp className="h-4 w-4 mr-2" />
                                  Approve
                                </Button>
                              </DialogTrigger>
                            </Dialog>

                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setShowActionDialog({ stepId: step.id, action: "request-changes" })}
                                >
                                  <RotateCcw className="h-4 w-4 mr-2" />
                                  Request Changes
                                </Button>
                              </DialogTrigger>
                            </Dialog>

                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => setShowActionDialog({ stepId: step.id, action: "reject" })}
                                >
                                  <ThumbsDown className="h-4 w-4 mr-2" />
                                  Reject
                                </Button>
                              </DialogTrigger>
                            </Dialog>
                          </div>
                        )}
                      </div>

                      <div className="text-xs text-muted-foreground flex-shrink-0">Step {step.order}</div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Action Dialog */}
      <Dialog open={!!showActionDialog} onOpenChange={(open) => !open && setShowActionDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {showActionDialog?.action === "approve" && "Approve Step"}
              {showActionDialog?.action === "reject" && "Reject Step"}
              {showActionDialog?.action === "request-changes" && "Request Changes"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">
                {showActionDialog?.action === "approve" ? "Comments (optional)" : "Reason"}
              </label>
              <Textarea
                value={actionComment}
                onChange={(e) => setActionComment(e.target.value)}
                placeholder={
                  showActionDialog?.action === "approve"
                    ? "Add any comments about your approval..."
                    : showActionDialog?.action === "reject"
                      ? "Explain why you're rejecting this step..."
                      : "Describe what changes are needed..."
                }
                rows={3}
              />
            </div>

            {showActionDialog?.action === "reject" && !actionComment.trim() && (
              <p className="text-sm text-muted-foreground text-yellow-600">
                A reason is required when rejecting a step.
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowActionDialog(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => showActionDialog && handleAction(showActionDialog.action)}
              disabled={showActionDialog?.action === "reject" && !actionComment.trim()}
              variant={showActionDialog?.action === "reject" ? "destructive" : "default"}
            >
              {showActionDialog?.action === "approve" && "Approve"}
              {showActionDialog?.action === "reject" && "Reject"}
              {showActionDialog?.action === "request-changes" && "Request Changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
