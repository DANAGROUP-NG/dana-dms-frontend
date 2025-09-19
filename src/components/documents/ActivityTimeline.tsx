"use client"

import { useState } from "react"
import { Eye, Edit, Share, MessageSquare, Upload, Download, CheckCircle, XCircle, Clock, Search } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Badge } from "../ui/badge"
import { Input } from "../ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Card, CardContent } from "../ui/card"
import { cn } from "../../lib/utils"
import type { DocumentActivity } from "../../types/documentDetail"

interface ActivityTimelineProps {
  activities: DocumentActivity[]
  className?: string
}

const getActivityIcon = (type: DocumentActivity["type"]) => {
  switch (type) {
    case "view":
      return Eye
    case "edit":
      return Edit
    case "share":
      return Share
    case "comment":
      return MessageSquare
    case "upload":
      return Upload
    case "download":
      return Download
    case "approve":
      return CheckCircle
    case "reject":
      return XCircle
    default:
      return Clock
  }
}

const getActivityColor = (type: DocumentActivity["type"]) => {
  switch (type) {
    case "view":
      return "text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300"
    case "edit":
      return "text-orange-600 bg-orange-100 dark:bg-orange-900 dark:text-orange-300"
    case "share":
      return "text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300"
    case "comment":
      return "text-purple-600 bg-purple-100 dark:bg-purple-900 dark:text-purple-300"
    case "upload":
      return "text-indigo-600 bg-indigo-100 dark:bg-indigo-900 dark:text-indigo-300"
    case "download":
      return "text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-300"
    case "approve":
      return "text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300"
    case "reject":
      return "text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300"
    default:
      return "text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-300"
  }
}

const formatTimeAgo = (timestamp: string) => {
  const now = new Date()
  const time = new Date(timestamp)
  const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000)

  if (diffInSeconds < 60) return "Just now"
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`

  return time.toLocaleDateString()
}

export function ActivityTimeline({ activities, className }: ActivityTimelineProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [filterUser, setFilterUser] = useState<string>("all")

  // Get unique users for filter
  const uniqueUsers = Array.from(new Set(activities.map((activity) => activity.user)))

  // Filter activities
  const filteredActivities = activities.filter((activity) => {
    const matchesSearch =
      activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.user.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === "all" || activity.type === filterType
    const matchesUser = filterUser === "all" || activity.user === filterUser

    return matchesSearch && matchesType && matchesUser
  })

  // Group activities by date
  const groupedActivities = filteredActivities.reduce(
    (groups, activity) => {
      const date = new Date(activity.timestamp).toDateString()
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(activity)
      return groups
    },
    {} as Record<string, DocumentActivity[]>,
  )

  const isToday = (date: string) => {
    return date === new Date().toDateString()
  }

  const isYesterday = (date: string) => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    return date === yesterday.toDateString()
  }

  const formatDateGroup = (date: string) => {
    if (isToday(date)) return "Today"
    if (isYesterday(date)) return "Yesterday"
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search activities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="view">Views</SelectItem>
                  <SelectItem value="edit">Edits</SelectItem>
                  <SelectItem value="share">Shares</SelectItem>
                  <SelectItem value="comment">Comments</SelectItem>
                  <SelectItem value="upload">Uploads</SelectItem>
                  <SelectItem value="download">Downloads</SelectItem>
                  <SelectItem value="approve">Approvals</SelectItem>
                  <SelectItem value="reject">Rejections</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterUser} onValueChange={setFilterUser}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="All users" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All users</SelectItem>
                  {uniqueUsers.map((user) => (
                    <SelectItem key={user} value={user}>
                      {user}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Timeline */}
      <div className="space-y-6">
        {Object.entries(groupedActivities).map(([date, dayActivities]) => (
          <div key={date} className="space-y-4">
            <div className="flex items-center gap-4">
              <h3 className="text-sm font-medium text-foreground">{formatDateGroup(date)}</h3>
              <div className="flex-1 h-px bg-border"></div>
              <Badge variant="outline" className="text-xs">
                {dayActivities.length} {dayActivities.length === 1 ? "activity" : "activities"}
              </Badge>
            </div>

            <div className="space-y-4 relative">
              {/* Timeline line */}
              <div className="absolute left-6 top-0 bottom-0 w-px bg-border"></div>

              {dayActivities.map((activity, index) => {
                const ActivityIcon = getActivityIcon(activity.type)
                const isLast = index === dayActivities.length - 1

                return (
                  <div key={activity.id} className="flex gap-4 relative">
                    {/* Timeline dot */}
                    <div
                      className={cn(
                        "relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 border-background",
                        getActivityColor(activity.type),
                      )}
                    >
                      <ActivityIcon className="h-4 w-4" />
                    </div>

                    {/* Activity content */}
                    <div className="flex-1 min-w-0 pb-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={activity.userAvatar || "/placeholder.svg"} alt={activity.user} />
                              <AvatarFallback className="text-xs">
                                {activity.user
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium text-foreground">{activity.user}</span>
                            <Badge variant="outline" className="text-xs capitalize">
                              {activity.type}
                            </Badge>
                          </div>

                          <p className="text-sm text-muted-foreground mb-2">{activity.description}</p>

                          {/* Activity metadata */}
                          {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {Object.entries(activity.metadata).map(([key, value]) => (
                                <Badge key={key} variant="secondary" className="text-xs">
                                  {key}: {String(value)}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="text-xs text-muted-foreground flex-shrink-0">
                          {formatTimeAgo(activity.timestamp)}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {filteredActivities.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              {searchTerm || filterType !== "all" || filterUser !== "all"
                ? "No matching activities"
                : "No activity yet"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {searchTerm || filterType !== "all" || filterUser !== "all"
                ? "Try adjusting your filters to see more activities."
                : "Document activity will appear here as users interact with it."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
