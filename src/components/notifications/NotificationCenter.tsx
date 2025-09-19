"use client"

import { useState } from "react"
import { Bell, Check, X, User, MessageSquare, AlertTriangle, CheckCircle, Clock } from "lucide-react"
import { Button } from "../ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Badge } from "../ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { cn } from "../../lib/utils"
import type { Notification } from "../../types/workflow"

interface NotificationCenterProps {
  notifications?: Notification[]
  onMarkAsRead: (id: string) => void
  onMarkAllAsRead: () => void
  onDeleteNotification: (id: string) => void
  className?: string
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "assignment",
    title: "New Assignment",
    message: "You have been assigned to review 'Q4 Financial Report.pdf'",
    recipientId: "current-user",
    senderId: "user-1",
    documentId: "doc-1",
    isRead: false,
    createdDate: "2024-01-16T10:30:00Z",
    actionUrl: "/documents/doc-1",
    metadata: { priority: "high" },
  },
  {
    id: "2",
    type: "comment",
    title: "New Comment",
    message: "Mike Chen commented on 'Marketing Campaign.docx'",
    recipientId: "current-user",
    senderId: "user-2",
    documentId: "doc-2",
    isRead: false,
    createdDate: "2024-01-16T09:15:00Z",
    actionUrl: "/documents/doc-2#comments",
    metadata: {},
  },
  {
    id: "3",
    type: "mention",
    title: "You were mentioned",
    message: "Sarah Johnson mentioned you in a comment on 'Project Proposal.docx'",
    recipientId: "current-user",
    senderId: "user-3",
    documentId: "doc-3",
    isRead: true,
    createdDate: "2024-01-15T16:45:00Z",
    actionUrl: "/documents/doc-3#comment-5",
    metadata: {},
  },
  {
    id: "4",
    type: "deadline",
    title: "Deadline Reminder",
    message: "Task 'Review Financial Data' is due in 2 hours",
    recipientId: "current-user",
    documentId: "doc-1",
    assignmentId: "assignment-1",
    isRead: false,
    createdDate: "2024-01-16T15:00:00Z",
    actionUrl: "/assignments/assignment-1",
    metadata: { dueDate: "2024-01-16T17:00:00Z" },
  },
  {
    id: "5",
    type: "approval",
    title: "Approval Request",
    message: "Your approval is needed for 'Employee Handbook Updates'",
    recipientId: "current-user",
    senderId: "user-4",
    workflowId: "workflow-1",
    isRead: true,
    createdDate: "2024-01-15T11:20:00Z",
    actionUrl: "/workflows/workflow-1",
    metadata: { stepName: "HR Review" },
  },
]

const getNotificationIcon = (type: Notification["type"]) => {
  switch (type) {
    case "assignment":
      return User
    case "comment":
      return MessageSquare
    case "mention":
      return MessageSquare
    case "deadline":
      return Clock
    case "approval":
      return CheckCircle
    case "escalation":
      return AlertTriangle
    default:
      return Bell
  }
}

const getNotificationColor = (type: Notification["type"]) => {
  switch (type) {
    case "assignment":
      return "text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300"
    case "comment":
      return "text-purple-600 bg-purple-100 dark:bg-purple-900 dark:text-purple-300"
    case "mention":
      return "text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300"
    case "deadline":
      return "text-orange-600 bg-orange-100 dark:bg-orange-900 dark:text-orange-300"
    case "approval":
      return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300"
    case "escalation":
      return "text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300"
    default:
      return "text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-300"
  }
}

export function NotificationCenter({
  notifications = mockNotifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification,
  className,
}: NotificationCenterProps) {
  const [filter, setFilter] = useState<"all" | "unread">("all")

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "unread") return !notification.isRead
    return true
  })

  const unreadCount = notifications.filter((n) => !n.isRead).length

  const formatRelativeTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id)
    }
    if (notification.actionUrl) {
      // In a real app, this would navigate to the URL
      console.log("Navigate to:", notification.actionUrl)
    }
  }

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {unreadCount}
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={onMarkAllAsRead}>
              <Check className="h-4 w-4 mr-2" />
              Mark all read
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={filter} onValueChange={(value) => setFilter(value as "all" | "unread")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="all">All ({notifications.length})</TabsTrigger>
            <TabsTrigger value="unread">Unread ({unreadCount})</TabsTrigger>
          </TabsList>

          <TabsContent value={filter} className="space-y-3 mt-4">
            {filteredNotifications.map((notification) => {
              const NotificationIcon = getNotificationIcon(notification.type)

              return (
                <div
                  key={notification.id}
                  className={cn(
                    "flex gap-3 p-3 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50",
                    !notification.isRead && "bg-primary/5 border-primary/20",
                  )}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className={cn("p-2 rounded-full flex-shrink-0", getNotificationColor(notification.type))}>
                    <NotificationIcon className="h-4 w-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h4 className={cn("font-medium text-sm truncate", !notification.isRead && "font-semibold")}>
                          {notification.title}
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{notification.message}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-muted-foreground">
                            {formatRelativeTime(notification.createdDate)}
                          </span>
                          <Badge variant="outline" className="text-xs capitalize">
                            {notification.type}
                          </Badge>
                          {notification.metadata.priority === "high" && (
                            <Badge variant="destructive" className="text-xs">
                              High Priority
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        {!notification.isRead && <div className="w-2 h-2 bg-primary rounded-full" />}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation()
                            onDeleteNotification(notification.id)
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}

            {filteredNotifications.length === 0 && (
              <div className="text-center py-8">
                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  {filter === "unread" ? "No unread notifications" : "No notifications"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {filter === "unread"
                    ? "You're all caught up! New notifications will appear here."
                    : "Notifications about assignments, comments, and deadlines will appear here."}
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
