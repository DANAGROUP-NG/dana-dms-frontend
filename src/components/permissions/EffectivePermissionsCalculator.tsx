"use client"

import { useState, useMemo } from "react"
import {
  Calculator,
  User,
  Crown,
  Users,
  Shield,
  Eye,
  Edit,
  Share,
  Trash2,
  MessageSquare,
  Settings,
  CheckCircle,
  XCircle,
  Info,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { Label } from "../ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import { TooltipProvider } from "../ui/tooltip"
import { cn } from "../../lib/utils"

export interface PermissionSource {
  id: string
  name: string
  type: "direct" | "role" | "group" | "inherited"
  permissions: {
    [key: string]: boolean | null // null means not specified
  }
  priority: number // Higher number = higher priority
  isActive: boolean
}

export interface EffectivePermission {
  permission: string
  granted: boolean
  sources: {
    source: PermissionSource
    value: boolean | null
    isWinning: boolean
  }[]
  conflictResolution?: string
}

interface EffectivePermissionsCalculatorProps {
  userId?: string
  userName?: string
  sources: PermissionSource[]
  availablePermissions: string[]
  onSourceToggle?: (sourceId: string, isActive: boolean) => void
  onPermissionChange?: (sourceId: string, permission: string, value: boolean | null) => void
  className?: string
}

// Mock data for demonstration
const mockSources: PermissionSource[] = [
  {
    id: "direct-1",
    name: "Direct Assignment",
    type: "direct",
    permissions: {
      view: true,
      edit: false,
      share: null,
      delete: false,
      comment: null,
      manage: null,
    },
    priority: 100,
    isActive: true,
  },
  {
    id: "role-editor",
    name: "Editor Role",
    type: "role",
    permissions: {
      view: true,
      edit: true,
      share: true,
      delete: false,
      comment: true,
      manage: false,
    },
    priority: 50,
    isActive: true,
  },
  {
    id: "group-marketing",
    name: "Marketing Team",
    type: "group",
    permissions: {
      view: true,
      edit: true,
      share: true,
      delete: null,
      comment: true,
      manage: null,
    },
    priority: 30,
    isActive: true,
  },
  {
    id: "inherited-folder",
    name: "Parent Folder",
    type: "inherited",
    permissions: {
      view: true,
      edit: null,
      share: false,
      delete: null,
      comment: null,
      manage: null,
    },
    priority: 10,
    isActive: true,
  },
]

const defaultPermissions = ["view", "edit", "share", "delete", "comment", "manage"]

export function EffectivePermissionsCalculator({
  userId = "user-123",
  userName = "John Doe",
  sources = mockSources,
  availablePermissions = defaultPermissions,
  onSourceToggle,
  onPermissionChange,
  className,
}: EffectivePermissionsCalculatorProps) {
  const [selectedUser, setSelectedUser] = useState(userId)
  const [simulationMode, setSimulationMode] = useState(false)
  const [localSources, setLocalSources] = useState(sources)

  // Calculate effective permissions
  const effectivePermissions = useMemo((): EffectivePermission[] => {
    const activeSources = localSources.filter((source) => source.isActive)

    return availablePermissions.map((permission) => {
      // Get all sources that specify this permission
      const relevantSources = activeSources
        .map((source) => ({
          source,
          value: source.permissions[permission],
          isWinning: false,
        }))
        .filter((item) => item.value !== null)
        .sort((a, b) => b.source.priority - a.source.priority) // Sort by priority (highest first)

      // Determine the effective value
      let granted = false
      let conflictResolution = ""

      if (relevantSources.length === 0) {
        // No sources specify this permission - default to false
        granted = false
        conflictResolution = "Default deny (no sources specify this permission)"
      } else {
        // Check for explicit DENY (highest priority)
        const explicitDeny = relevantSources.find((item) => item.source.type === "direct" && item.value === false)

        if (explicitDeny) {
          granted = false
          explicitDeny.isWinning = true
          conflictResolution = "Explicit DENY overrides all other permissions"
        } else {
          // Use highest priority source
          const winner = relevantSources[0]
          granted = winner.value === true
          winner.isWinning = true

          if (relevantSources.length > 1) {
            const conflictingSources = relevantSources.filter((item) => item.value !== winner.value)
            if (conflictingSources.length > 0) {
              conflictResolution = `Resolved by priority: ${winner.source.name} (priority ${winner.source.priority})`
            }
          }
        }
      }

      return {
        permission,
        granted,
        sources: relevantSources,
        conflictResolution: conflictResolution || undefined,
      }
    })
  }, [localSources, availablePermissions])

  const getPermissionIcon = (permission: string) => {
    switch (permission) {
      case "view":
        return Eye
      case "edit":
        return Edit
      case "share":
        return Share
      case "delete":
        return Trash2
      case "comment":
        return MessageSquare
      case "manage":
        return Settings
      default:
        return Shield
    }
  }

  const getSourceIcon = (type: PermissionSource["type"]) => {
    switch (type) {
      case "direct":
        return Shield
      case "role":
        return Crown
      case "group":
        return Users
      case "inherited":
        return User
      default:
        return Info
    }
  }

  const getSourceColor = (type: PermissionSource["type"]) => {
    switch (type) {
      case "direct":
        return "text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300"
      case "role":
        return "text-purple-600 bg-purple-100 dark:bg-purple-900 dark:text-purple-300"
      case "group":
        return "text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300"
      case "inherited":
        return "text-orange-600 bg-orange-100 dark:bg-orange-900 dark:text-orange-300"
      default:
        return "text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  const handleSourceToggle = (sourceId: string, isActive: boolean) => {
    if (simulationMode) {
      setLocalSources((prev) => prev.map((source) => (source.id === sourceId ? { ...source, isActive } : source)))
    } else if (onSourceToggle) {
      onSourceToggle(sourceId, isActive)
    }
  }

  const handlePermissionChange = (sourceId: string, permission: string, value: boolean | null) => {
    if (simulationMode) {
      setLocalSources((prev) =>
        prev.map((source) =>
          source.id === sourceId
            ? {
                ...source,
                permissions: { ...source.permissions, [permission]: value },
              }
            : source,
        ),
      )
    } else if (onPermissionChange) {
      onPermissionChange(sourceId, permission, value)
    }
  }

  const grantedPermissions = effectivePermissions.filter((p) => p.granted)
  const deniedPermissions = effectivePermissions.filter((p) => !p.granted)
  const conflictedPermissions = effectivePermissions.filter((p) => p.conflictResolution)

  return (
    <TooltipProvider>
      <div className={cn("space-y-6", className)}>
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Effective Permissions Calculator
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Calculate the final permissions for a user based on all sources
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="user-select">User</Label>
                <Select value={selectedUser} onValueChange={setSelectedUser}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user-123">John Doe (john.doe@company.com)</SelectItem>
                    <SelectItem value="user-456">Jane Smith (jane.smith@company.com)</SelectItem>
                    <SelectItem value="user-789">Mike Johnson (mike.johnson@company.com)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button
                  variant={simulationMode ? "default" : "outline"}
                  onClick={() => setSimulationMode(!simulationMode)}
                >
                  {simulationMode ? "Exit Simulation" : "Simulation Mode"}
                </Button>
              </div>
            </div>

            {simulationMode && (
              <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-md border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <Info className="h-4 w-4 inline mr-2" />
                  Simulation mode: Changes are temporary and won't be saved
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-2xl font-bold text-green-600">{grantedPermissions.length}</p>
                  <p className="text-xs text-muted-foreground">Granted</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-600" />
                <div>
                  <p className="text-2xl font-bold text-red-600">{deniedPermissions.length}</p>
                  <p className="text-xs text-muted-foreground">Denied</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-yellow-600" />
                <div>
                  <p className="text-2xl font-bold text-yellow-600">{conflictedPermissions.length}</p>
                  <p className="text-xs text-muted-foreground">Conflicts</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="effective">
          <TabsList>
            <TabsTrigger value="effective">Effective Permissions</TabsTrigger>
            <TabsTrigger value="sources">Permission Sources</TabsTrigger>
            <TabsTrigger value="matrix">Permission Matrix</TabsTrigger>
          </TabsList>

          {/* Effective Permissions Tab */}
          <TabsContent value="effective">
            <Card>
              <CardHeader>
                <CardTitle>Final Permissions for {userName}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  The calculated effective permissions after resolving all conflicts
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {effectivePermissions.map((permission) => {
                    const PermissionIcon = getPermissionIcon(permission.permission)

                    return (
                      <Card key={permission.permission}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <div
                              className={cn(
                                "p-2 rounded-full",
                                permission.granted
                                  ? "text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300"
                                  : "text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300",
                              )}
                            >
                              <PermissionIcon className="h-4 w-4" />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-medium text-sm capitalize">{permission.permission}</h3>
                                <Badge variant={permission.granted ? "default" : "secondary"}>
                                  {permission.granted ? "GRANTED" : "DENIED"}
                                </Badge>
                                {permission.conflictResolution && (
                                  <Badge variant="outline" className="text-xs text-yellow-600">
                                    Conflict Resolved
                                  </Badge>
                                )}
                              </div>

                              {permission.conflictResolution && (
                                <p className="text-xs text-muted-foreground mb-2">{permission.conflictResolution}</p>
                              )}

                              <div className="space-y-1">
                                <p className="text-xs font-medium text-muted-foreground">Sources:</p>
                                {permission.sources.map(({ source, value, isWinning }) => {
                                  const SourceIcon = getSourceIcon(source.type)

                                  return (
                                    <div key={source.id} className="flex items-center gap-2 text-xs">
                                      <div className={cn("p-1 rounded", getSourceColor(source.type))}>
                                        <SourceIcon className="h-2 w-2" />
                                      </div>
                                      <span className={cn(isWinning && "font-medium")}>{source.name}</span>
                                      <Badge variant={value ? "default" : "secondary"} className="text-xs">
                                        {value ? "ALLOW" : "DENY"}
                                      </Badge>
                                      <span className="text-muted-foreground">(priority: {source.priority})</span>
                                      {isWinning && (
                                        <Badge variant="outline" className="text-xs text-green-600">
                                          Winner
                                        </Badge>
                                      )}
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sources Tab */}
          <TabsContent value="sources">
            <Card>
              <CardHeader>
                <CardTitle>Permission Sources</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Manage individual permission sources and their priorities
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {localSources.map((source) => {
                    const SourceIcon = getSourceIcon(source.type)

                    return (
                      <Card key={source.id} className={cn(!source.isActive && "opacity-50")}>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4 mb-4">
                            <div className={cn("p-2 rounded-full", getSourceColor(source.type))}>
                              <SourceIcon className="h-4 w-4" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium text-sm">{source.name}</h3>
                              <p className="text-xs text-muted-foreground">
                                Priority: {source.priority} • Type: {source.type}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              variant={source.isActive ? "default" : "outline"}
                              onClick={() => handleSourceToggle(source.id, !source.isActive)}
                            >
                              {source.isActive ? "Active" : "Inactive"}
                            </Button>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                            {availablePermissions.map((permission) => {
                              const value = source.permissions[permission]

                              return (
                                <div key={permission} className="text-center">
                                  <p className="text-xs font-medium mb-1 capitalize">{permission}</p>
                                  <div className="flex gap-1">
                                    <Button
                                      size="sm"
                                      variant={value === true ? "default" : "outline"}
                                      className="h-6 px-2 text-xs"
                                      onClick={() => handlePermissionChange(source.id, permission, true)}
                                      disabled={!source.isActive}
                                    >
                                      ✓
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant={value === false ? "default" : "outline"}
                                      className="h-6 px-2 text-xs"
                                      onClick={() => handlePermissionChange(source.id, permission, false)}
                                      disabled={!source.isActive}
                                    >
                                      ✗
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant={value === null ? "default" : "outline"}
                                      className="h-6 px-2 text-xs"
                                      onClick={() => handlePermissionChange(source.id, permission, null)}
                                      disabled={!source.isActive}
                                    >
                                      —
                                    </Button>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Matrix Tab */}
          <TabsContent value="matrix">
            <Card>
              <CardHeader>
                <CardTitle>Permission Matrix</CardTitle>
                <p className="text-sm text-muted-foreground">Overview of all permissions across all sources</p>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Source</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      {availablePermissions.map((permission) => (
                        <TableHead key={permission} className="text-center capitalize">
                          {permission}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {localSources.map((source) => {
                      const SourceIcon = getSourceIcon(source.type)

                      return (
                        <TableRow key={source.id} className={cn(!source.isActive && "opacity-50")}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className={cn("p-1 rounded", getSourceColor(source.type))}>
                                <SourceIcon className="h-3 w-3" />
                              </div>
                              <span className="text-sm">{source.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={cn("text-xs", getSourceColor(source.type))}>
                              {source.type}
                            </Badge>
                          </TableCell>
                          <TableCell>{source.priority}</TableCell>
                          <TableCell>
                            <Badge variant={source.isActive ? "default" : "secondary"} className="text-xs">
                              {source.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          {availablePermissions.map((permission) => {
                            const value = source.permissions[permission]

                            return (
                              <TableCell key={permission} className="text-center">
                                {value === true && <CheckCircle className="h-4 w-4 text-green-600 mx-auto" />}
                                {value === false && <XCircle className="h-4 w-4 text-red-600 mx-auto" />}
                                {value === null && <span className="text-muted-foreground">—</span>}
                              </TableCell>
                            )
                          })}
                        </TableRow>
                      )
                    })}

                    {/* Effective Row */}
                    <TableRow className="border-t-2 font-medium bg-muted/50">
                      <TableCell colSpan={4}>
                        <div className="flex items-center gap-2">
                          <Calculator className="h-4 w-4" />
                          <span>Effective Permissions</span>
                        </div>
                      </TableCell>
                      {availablePermissions.map((permission) => {
                        const effective = effectivePermissions.find((p) => p.permission === permission)

                        return (
                          <TableCell key={permission} className="text-center">
                            {effective?.granted ? (
                              <CheckCircle className="h-4 w-4 text-green-600 mx-auto" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-600 mx-auto" />
                            )}
                          </TableCell>
                        )
                      })}
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  )
}
