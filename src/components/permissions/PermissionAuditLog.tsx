"use client"

import {
  Crown,
  Download,
  Edit,
  Eye,
  History,
  Minus,
  Plus,
  Search,
  Share,
  Shield,
  Trash2,
  User,
  Users,
} from "lucide-react"
import { useState } from "react"
import type { DateRange } from "react-day-picker"
import { cn } from "../../lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { DatePickerWithRange } from "../ui/date-range-picker"
import { Input } from "../ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import { TooltipProvider } from "../ui/tooltip"

export interface AuditLogEntry {
  id: string
  timestamp: string
  action: "grant" | "revoke" | "modify" | "create_link" | "delete_link" | "access_document" | "login" | "logout"
  actor: {
    id: string
    name: string
    email: string
    avatar?: string
    type: "user" | "system"
  }
  target?: {
    id: string
    name: string
    type: "user" | "role" | "group" | "document" | "link"
  }
  resource: {
    id: string
    name: string
    type: "document" | "folder"
  }
  details: {
    permission?: string
    oldValue?: any
    newValue?: any
    reason?: string
    ipAddress?: string
    userAgent?: string
  }
  severity: "info" | "warning" | "error"
  category: "permission" | "access" | "sharing" | "authentication"
}

interface PermissionAuditLogProps {
  entries: AuditLogEntry[]
  onExport?: (filters: any) => void
  onLoadMore?: () => void
  hasMore?: boolean
  isLoading?: boolean
  className?: string
}

// Mock audit log data
const mockAuditEntries: AuditLogEntry[] = [
  {
    id: "audit-1",
    timestamp: "2024-01-21T14:30:00Z",
    action: "grant",
    actor: {
      id: "admin-1",
      name: "John Admin",
      email: "john.admin@company.com",
      avatar: "/placeholder.svg",
      type: "user",
    },
    target: {
      id: "user-123",
      name: "Jane Smith",
      type: "user",
    },
    resource: {
      id: "doc-1",
      name: "Q4 Financial Report.pdf",
      type: "document",
    },
    details: {
      permission: "edit",
      reason: "Added to quarterly review team",
      ipAddress: "192.168.1.100",
    },
    severity: "info",
    category: "permission",
  },
  {
    id: "audit-2",
    timestamp: "2024-01-21T13:45:00Z",
    action: "create_link",
    actor: {
      id: "user-456",
      name: "Mike Johnson",
      email: "mike.johnson@company.com",
      type: "user",
    },
    resource: {
      id: "doc-2",
      name: "Marketing Strategy 2024.docx",
      type: "document",
    },
    details: {
      newValue: {
        scope: "organization",
        expiresAt: "2024-02-21T23:59:59Z",
        requiresAuth: true,
      },
      ipAddress: "192.168.1.101",
    },
    severity: "info",
    category: "sharing",
  },
  {
    id: "audit-3",
    timestamp: "2024-01-21T12:15:00Z",
    action: "access_document",
    actor: {
      id: "user-789",
      name: "Sarah Wilson",
      email: "sarah.wilson@company.com",
      type: "user",
    },
    resource: {
      id: "doc-3",
      name: "Confidential Project Alpha.pdf",
      type: "document",
    },
    details: {
      ipAddress: "10.0.0.50",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    },
    severity: "warning",
    category: "access",
  },
  {
    id: "audit-4",
    timestamp: "2024-01-21T11:30:00Z",
    action: "revoke",
    actor: {
      id: "system",
      name: "System",
      email: "system@company.com",
      type: "system",
    },
    target: {
      id: "user-999",
      name: "Former Employee",
      type: "user",
    },
    resource: {
      id: "folder-1",
      name: "HR Documents",
      type: "folder",
    },
    details: {
      permission: "all",
      reason: "User account deactivated",
    },
    severity: "warning",
    category: "permission",
  },
]

export function PermissionAuditLog({
  entries = mockAuditEntries,
  onExport,
  onLoadMore,
  hasMore = false,
  isLoading = false,
  className,
}: PermissionAuditLogProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [actionFilter, setActionFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [severityFilter, setSeverityFilter] = useState<string>("all")
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)

  // Filter entries based on current filters
  const filteredEntries = entries.filter((entry) => {
    const matchesSearch =
      !searchQuery ||
      entry.actor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.resource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.target?.name.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesAction = actionFilter === "all" || entry.action === actionFilter
    const matchesCategory = categoryFilter === "all" || entry.category === categoryFilter
    const matchesSeverity = severityFilter === "all" || entry.severity === severityFilter

    const matchesDateRange =
      !dateRange?.from ||
      !dateRange?.to ||
      (new Date(entry.timestamp) >= dateRange.from && new Date(entry.timestamp) <= dateRange.to)

    return matchesSearch && matchesAction && matchesCategory && matchesSeverity && matchesDateRange
  })

  const getActionIcon = (action: AuditLogEntry["action"]) => {
    switch (action) {
      case "grant":
        return Plus
      case "revoke":
        return Minus
      case "modify":
        return Edit
      case "create_link":
        return Share
      case "delete_link":
        return Trash2
      case "access_document":
        return Eye
      case "login":
      case "logout":
        return User
      default:
        return Shield
    }
  }

  const getActionColor = (action: AuditLogEntry["action"]) => {
    switch (action) {
      case "grant":
        return "text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300"
      case "revoke":
        return "text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300"
      case "modify":
        return "text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300"
      case "create_link":
        return "text-purple-600 bg-purple-100 dark:bg-purple-900 dark:text-purple-300"
      case "delete_link":
        return "text-orange-600 bg-orange-100 dark:bg-orange-900 dark:text-orange-300"
      case "access_document":
        return "text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-300"
      default:
        return "text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  const getSeverityColor = (severity: AuditLogEntry["severity"]) => {
    switch (severity) {
      case "error":
        return "text-red-600"
      case "warning":
        return "text-yellow-600"
      case "info":
        return "text-blue-600"
      default:
        return "text-gray-600"
    }
  }

  const getTargetIcon = (type?: string) => {
    switch (type) {
      case "user":
        return User
      case "role":
        return Crown
      case "group":
        return Users
      case "document":
        return Eye
      case "link":
        return Share
      default:
        return Shield
    }
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  const formatActionDescription = (entry: AuditLogEntry) => {
    const { action, target, details } = entry

    switch (action) {
      case "grant":
        return `Granted ${details.permission} permission to ${target?.name}`
      case "revoke":
        return `Revoked ${details.permission || "all"} permission${details.permission ? "" : "s"} from ${target?.name}`
      case "modify":
        return `Modified permissions for ${target?.name}`
      case "create_link":
        return `Created share link with ${details.newValue?.scope} access`
      case "delete_link":
        return "Deleted share link"
      case "access_document":
        return "Accessed document"
      default:
        return action.replace("_", " ")
    }
  }

  const handleExport = () => {
    if (onExport) {
      onExport({
        searchQuery,
        actionFilter,
        categoryFilter,
        severityFilter,
        dateRange,
      })
    }
  }

  return (
    <TooltipProvider>
      <div className={cn("space-y-6", className)}>
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Permission Audit Log
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Track all permission changes and access events</p>
              </div>
              {onExport && (
                <Button onClick={handleExport} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search logs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All actions</SelectItem>
                  <SelectItem value="grant">Grant</SelectItem>
                  <SelectItem value="revoke">Revoke</SelectItem>
                  <SelectItem value="modify">Modify</SelectItem>
                  <SelectItem value="create_link">Create Link</SelectItem>
                  <SelectItem value="delete_link">Delete Link</SelectItem>
                  <SelectItem value="access_document">Access Document</SelectItem>
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  <SelectItem value="permission">Permission</SelectItem>
                  <SelectItem value="access">Access</SelectItem>
                  <SelectItem value="sharing">Sharing</SelectItem>
                  <SelectItem value="authentication">Authentication</SelectItem>
                </SelectContent>
              </Select>

              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All severities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All severities</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                </SelectContent>
              </Select>

              <DatePickerWithRange date={dateRange} onDateChange={(range) => setDateRange(range)} />
            </div>
          </CardContent>
        </Card>

        {/* Audit Log Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Actor</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Resource</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Severity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntries.map((entry) => {
                  const ActionIcon = getActionIcon(entry.action)
                  const TargetIcon = getTargetIcon(entry.target?.type)

                  return (
                    <TableRow key={entry.id}>
                      <TableCell className="font-mono text-xs">{formatTimestamp(entry.timestamp)}</TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2">
                          {entry.actor.type === "user" ? (
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={entry.actor.avatar || "/placeholder.svg"} alt={entry.actor.name} />
                              <AvatarFallback className="text-xs">
                                {entry.actor.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                              <Shield className="h-3 w-3" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{entry.actor.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{entry.actor.email}</p>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={cn("p-1 rounded", getActionColor(entry.action))}>
                            <ActionIcon className="h-3 w-3" />
                          </div>
                          <div>
                            <p className="text-sm font-medium capitalize">{entry.action.replace("_", " ")}</p>
                            <Badge variant="outline" className="text-xs capitalize">
                              {entry.category}
                            </Badge>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        {entry.target ? (
                          <div className="flex items-center gap-2">
                            <TargetIcon className="h-3 w-3 text-muted-foreground" />
                            <div>
                              <p className="text-sm">{entry.target.name}</p>
                              <p className="text-xs text-muted-foreground capitalize">{entry.target.type}</p>
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>

                      <TableCell>
                        <div>
                          <p className="text-sm font-medium">{entry.resource.name}</p>
                          <p className="text-xs text-muted-foreground capitalize">{entry.resource.type}</p>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="max-w-xs">
                          <p className="text-sm">{formatActionDescription(entry)}</p>
                          {entry.details.reason && (
                            <p className="text-xs text-muted-foreground mt-1">Reason: {entry.details.reason}</p>
                          )}
                          {entry.details.ipAddress && (
                            <p className="text-xs text-muted-foreground font-mono">IP: {entry.details.ipAddress}</p>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge variant="outline" className={cn("text-xs", getSeverityColor(entry.severity))}>
                          {entry.severity}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>

            {filteredEntries.length === 0 && (
              <div className="p-8 text-center">
                <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No audit entries found</h3>
                <p className="text-sm text-muted-foreground">
                  {searchQuery || actionFilter !== "all" || categoryFilter !== "all" || severityFilter !== "all"
                    ? "Try adjusting your filters to see more results."
                    : "Audit log entries will appear here as actions are performed."}
                </p>
              </div>
            )}

            {hasMore && (
              <div className="p-4 border-t">
                <Button onClick={onLoadMore} disabled={isLoading} variant="outline" className="w-full bg-transparent">
                  {isLoading ? "Loading..." : "Load More"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  )
}
