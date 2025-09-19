"use client"

import type React from "react"

import { Calendar, Clock, User, MessageSquare, CheckCircle, XCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Badge } from "../ui/badge"
import { Avatar, AvatarFallback } from "../ui/avatar"
import { cn } from "../../lib/utils"
import type { WorkflowInstance } from "../../types/workflow"

interface WorkflowTimelineProps {
  workflow: WorkflowInstance
  showAllEvents?: boolean
  className?: string
}

interface TimelineEvent {
  id: string
  type: "started" | "step_completed" | "step_rejected" | "step_assigned" | "comment" | "completed" | "cancelled"
  title: string
  description: string
  timestamp: string
  user?: string
  userId?: string
  stepName?: string
  icon: React.ComponentType<{ className?: string }>
  color: string
}

export function WorkflowTimeline({ workflow, showAllEvents = true, className }: WorkflowTimelineProps) {
  // Generate timeline events from workflow data
  const generateTimelineEvents = (): TimelineEvent[] => {
    const events: TimelineEvent[] = []

    // Workflow started event
    events.push({
      id: `start-${workflow.id}`,
      type: "started",
      title: "Workflow Started",
      description: `${workflow.name} workflow was initiated`,
      timestamp: workflow.startDate,
      user: workflow.createdBy,
      icon: Clock,
      color: "text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300",
    })

    // Step events
    workflow.steps.forEach((step) => {
      // Step assignment (if different from start)
      if (step.assigneeName) {
        events.push({
          id: `assigned-${step.id}`,
          type: "step_assigned",
          title: "Step Assigned",
          description: `${step.name} assigned to ${step.assigneeName}`,
          timestamp: workflow.startDate, // In real app, this would be step assignment date
          stepName: step.name,
          user: step.assigneeName,
          userId: step.assigneeId,
          icon: User,
          color: "text-purple-600 bg-purple-100 dark:bg-purple-900 dark:text-purple-300",
        })
      }

      // Step completion/rejection
      if (step.status === "completed" && step.completedDate) {
        events.push({
          id: `completed-${step.id}`,
          type: "step_completed",
          title: "Step Completed",
          description: `${step.name} was approved`,
          timestamp: step.completedDate,
          stepName: step.name,
          user: step.completedBy,
          icon: CheckCircle,
          color: "text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300",
        })
      } else if (step.status === "rejected" && step.completedDate) {
        events.push({
          id: `rejected-${step.id}`,
          type: "step_rejected",
          title: "Step Rejected",
          description: `${step.name} was rejected`,
          timestamp: step.completedDate,
          stepName: step.name,
          user: step.completedBy,
          icon: XCircle,
          color: "text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300",
        })
      }

      // Step comments/notes
      if (step.notes) {
        events.push({
          id: `comment-${step.id}`,
          type: "comment",
          title: "Comment Added",
          description: step.notes,
          timestamp: step.completedDate || workflow.startDate,
          stepName: step.name,
          user: step.completedBy || step.assigneeName,
          icon: MessageSquare,
          color: "text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-300",
        })
      }
    })

    // Workflow completion
    if (workflow.status === "completed" && workflow.completedDate) {
      events.push({
        id: `completed-${workflow.id}`,
        type: "completed",
        title: "Workflow Completed",
        description: `${workflow.name} workflow was completed successfully`,
        timestamp: workflow.completedDate,
        icon: CheckCircle,
        color: "text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300",
      })
    }

    // Sort events by timestamp
    return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }

  const timelineEvents = generateTimelineEvents()
  const displayEvents = showAllEvents ? timelineEvents : timelineEvents.slice(0, 10)

  const formatRelativeTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`
    return date.toLocaleDateString()
  }

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle className="text-lg">Workflow Timeline</CardTitle>
        <p className="text-sm text-muted-foreground">Track all workflow activities and changes</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-px bg-border"></div>

          {displayEvents.map((event, index) => {
            const EventIcon = event.icon
            const isLast = index === displayEvents.length - 1

            return (
              <div key={event.id} className="flex gap-4 relative">
                {/* Timeline dot */}
                <div
                  className={cn(
                    "relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 border-background",
                    event.color,
                  )}
                >
                  <EventIcon className="h-5 w-5" />
                </div>

                {/* Event content */}
                <div className="flex-1 min-w-0 pb-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-foreground text-sm">{event.title}</h3>
                        <Badge variant="outline" className="text-xs">
                          {event.type.replace("_", " ")}
                        </Badge>
                      </div>

                      <p className="text-sm text-muted-foreground mb-2">{event.description}</p>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatRelativeTime(event.timestamp)}</span>
                        </div>

                        {event.user && (
                          <div className="flex items-center gap-1">
                            <Avatar className="h-4 w-4">
                              <AvatarFallback className="text-xs">
                                {event.user
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <span>{event.user}</span>
                          </div>
                        )}

                        {event.stepName && (
                          <div className="flex items-center gap-1">
                            <span>•</span>
                            <span>{event.stepName}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground flex-shrink-0">
                      {new Date(event.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}

          {!showAllEvents && timelineEvents.length > 10 && (
            <div className="flex justify-center pt-4">
              <Badge variant="outline" className="text-xs">
                +{timelineEvents.length - 10} more events
              </Badge>
            </div>
          )}

          {timelineEvents.length === 0 && (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No timeline events</h3>
              <p className="text-sm text-muted-foreground">Workflow events will appear here as they occur.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
