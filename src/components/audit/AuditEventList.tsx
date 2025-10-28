"use client"

import { useState } from "react"
import { format } from "date-fns"
import {
  Shield,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  FileText,
  Folder,
  User,
  Settings,
  Download,
  MoreVertical,
  Search,
} from "lucide-react"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Input } from "../ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { ScrollArea } from "../ui/scroll-area"
import { cn } from "../../lib/utils"
import type { AuditEvent } from "../../types/audit"

interface AuditEventListProps {
  events: AuditEvent[]
  onEventClick?: (event: AuditEvent) => void
  isLoading?: boolean
}

const actionIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  "document.create": FileText,
  "document.read": FileText,
  "document.update": FileText,
  "document.delete": FileText,
  "document.share": FileText,
  "document.download": Download,
  "folder.create": Folder,
  "folder.update": Folder,
  "folder.delete": Folder,
  "permission.grant": Shield,
  "permission.revoke": Shield,
  "permission.update": Shield,
  "workflow.create": Settings,
  "workflow.approve": CheckCircle2,
  "workflow.reject": XCircle,
  "user.login": User,
  "user.logout": User,
  "system.config_change": Settings,
}

function getActionIcon(action: string) {
  return actionIcons[action] || AlertCircle
}

function getResultColor(result: string) {
  switch (result) {
    case "SUCCESS":
      return "bg-green-500/10 text-green-600 dark:text-green-400"
    case "FAILURE":
      return "bg-red-500/10 text-red-600 dark:text-red-400"
    case "UNAUTHORIZED":
      return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
    case "ERROR":
      return "bg-orange-500/10 text-orange-600 dark:text-orange-400"
    default:
      return "bg-gray-500/10 text-gray-600 dark:text-gray-400"
  }
}

function getActionLabel(action: string): string {
  const parts = action.split(".")
  return parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(" ")
}

export function AuditEventList({ events, onEventClick, isLoading }: AuditEventListProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredEvents = events.filter(event => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      event.actorName.toLowerCase().includes(query) ||
      event.action.toLowerCase().includes(query) ||
      event.targetName?.toLowerCase().includes(query) ||
      event.targetType.toLowerCase().includes(query)
    )
  })

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading audit events...</CardTitle>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Audit Events</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Result</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEvents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                    No audit events found
                  </TableCell>
                </TableRow>
              ) : (
                filteredEvents.map((event) => {
                  const Icon = getActionIcon(event.action)
                  return (
                    <TableRow
                      key={event.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => onEventClick?.(event)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {format(new Date(event.timestamp), "HH:mm:ss")}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(event.timestamp), "MMM d, yyyy")}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {event.actorType === "USER" && (
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="h-4 w-4 text-primary" />
                            </div>
                          )}
                          {event.actorType === "SYSTEM" && (
                            <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                              <Settings className="h-4 w-4 text-blue-500" />
                            </div>
                          )}
                          {event.actorType === "INTEGRATION" && (
                            <div className="h-8 w-8 rounded-full bg-purple-500/10 flex items-center justify-center">
                              <Shield className="h-4 w-4 text-purple-500" />
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium">{event.actorName}</p>
                            <p className="text-xs text-muted-foreground">{event.actorType}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{getActionLabel(event.action)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium">{event.targetName || "N/A"}</p>
                          <p className="text-xs text-muted-foreground">{event.targetType}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn("text-xs", getResultColor(event.result))}>
                          {event.result}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {event.duration ? `${event.duration}ms` : "—"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onEventClick?.(event)}>
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>Export Event</DropdownMenuItem>
                            <DropdownMenuItem>Copy Event ID</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

