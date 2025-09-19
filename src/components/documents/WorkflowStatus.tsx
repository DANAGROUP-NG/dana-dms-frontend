"use client"

import { AlertCircle, Calendar, CheckCircle, Clock, XCircle } from "lucide-react"
import { cn } from "../../lib/utils"
import type { DocumentWorkflow, WorkflowStep } from "../../types/documentDetail"
import { Avatar, AvatarFallback } from "../ui/avatar"
import { Badge } from "../ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Progress } from "../ui/progress"

interface WorkflowStatusProps {
  workflow: DocumentWorkflow
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
      return AlertCircle
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

const getWorkflowStatusColor = (status: DocumentWorkflow["status"]) => {
  switch (status) {
    case "approved":
      return "text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300"
    case "in-review":
      return "text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300"
    case "rejected":
      return "text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300"
    case "draft":
      return "text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-300"
    case "archived":
      return "text-orange-600 bg-orange-100 dark:bg-orange-900 dark:text-orange-300"
    default:
      return "text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-300"
  }
}

export function WorkflowStatus({ workflow, className }: WorkflowStatusProps) {
  const completedSteps = workflow.steps.filter((step) => step.status === "completed").length
  const totalSteps = workflow.steps.length
  const progressPercentage = (completedSteps / totalSteps) * 100

  const sortedSteps = [...workflow.steps].sort((a, b) => a.order - b.order)

  return (
    <div className={cn("space-y-6", className)}>
      {/* Workflow Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">{workflow.name}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Created {new Date(workflow.createdDate).toLocaleDateString()}
                {workflow.completedDate && <> • Completed {new Date(workflow.completedDate).toLocaleDateString()}</>}
              </p>
            </div>
            <Badge variant="secondary" className={cn("text-xs", getWorkflowStatusColor(workflow.status))}>
              {workflow.status.replace("-", " ").toUpperCase()}
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
          </div>
        </CardContent>
      </Card>

      {/* Workflow Steps */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Workflow Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 relative">
            {/* Timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-px bg-border"></div>

            {sortedSteps.map((step) => {
              const StepIcon = getStepIcon(step.status)

              return (
                <div key={step.id} className="flex gap-4 relative">
                  {/* Timeline dot */}
                  <div
                    className={cn(
                      "relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 border-background",
                      getStepColor(step.status),
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
                        </div>

                        {step.assignee && (
                          <div className="flex items-center gap-2 mb-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs">
                                {step.assignee
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-muted-foreground">Assigned to {step.assignee}</span>
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
                        </div>

                        {step.notes && <p className="text-sm text-muted-foreground">{step.notes}</p>}
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
    </div>
  )
}
