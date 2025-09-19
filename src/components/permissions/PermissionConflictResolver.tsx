"use client"

import { useState } from "react"
import { AlertTriangle, Shield, CheckCircle, XCircle, Info, ArrowRight, Users, Crown } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { Alert, AlertDescription, AlertTitle } from "../ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { TooltipProvider } from "../ui/tooltip"
import { cn } from "../../lib/utils"

export interface PermissionConflict {
  id: string
  type: "deny_overrides_allow" | "role_conflict" | "inheritance_conflict" | "explicit_vs_inherited"
  severity: "high" | "medium" | "low"
  description: string
  affectedUsers: string[]
  affectedPermissions: string[]
  sources: {
    id: string
    name: string
    type: "role" | "group" | "direct" | "inherited"
    permission: string
    value: boolean
  }[]
  recommendation: string
  autoResolvable: boolean
}

interface PermissionConflictResolverProps {
  conflicts: PermissionConflict[]
  onResolveConflict: (conflictId: string, resolution: "accept_recommendation" | "manual") => void
  onViewDetails: (conflictId: string) => void
  className?: string
}

// Mock conflict data
const mockConflicts: PermissionConflict[] = [
  {
    id: "conflict-1",
    type: "deny_overrides_allow",
    severity: "high",
    description: "User has explicit DENY for 'edit' permission but role grants ALLOW",
    affectedUsers: ["john.doe@company.com"],
    affectedPermissions: ["edit"],
    sources: [
      {
        id: "direct-1",
        name: "Direct Assignment",
        type: "direct",
        permission: "edit",
        value: false,
      },
      {
        id: "role-editor",
        name: "Editor Role",
        type: "role",
        permission: "edit",
        value: true,
      },
    ],
    recommendation: "Explicit DENY should override role-based ALLOW. User will not have edit permission.",
    autoResolvable: true,
  },
  {
    id: "conflict-2",
    type: "role_conflict",
    severity: "medium",
    description: "User has conflicting permissions from multiple roles",
    affectedUsers: ["jane.smith@company.com"],
    affectedPermissions: ["share", "delete"],
    sources: [
      {
        id: "role-viewer",
        name: "Viewer Role",
        type: "role",
        permission: "share",
        value: false,
      },
      {
        id: "role-contributor",
        name: "Contributor Role",
        type: "role",
        permission: "share",
        value: true,
      },
      {
        id: "role-admin",
        name: "Admin Role",
        type: "role",
        permission: "delete",
        value: true,
      },
    ],
    recommendation: "Grant most permissive access when roles conflict. User will have share and delete permissions.",
    autoResolvable: true,
  },
  {
    id: "conflict-3",
    type: "inheritance_conflict",
    severity: "low",
    description: "Document permissions differ from parent folder permissions",
    affectedUsers: ["team@company.com"],
    affectedPermissions: ["comment"],
    sources: [
      {
        id: "folder-parent",
        name: "Parent Folder",
        type: "inherited",
        permission: "comment",
        value: true,
      },
      {
        id: "doc-explicit",
        name: "Document Settings",
        type: "direct",
        permission: "comment",
        value: false,
      },
    ],
    recommendation: "Document-level permissions should override inherited permissions. Comments will be disabled.",
    autoResolvable: false,
  },
]

export function PermissionConflictResolver({
  conflicts = mockConflicts,
  onResolveConflict,
  onViewDetails,
  className,
}: PermissionConflictResolverProps) {
  const [selectedConflict, setSelectedConflict] = useState<PermissionConflict | null>(null)
  const [resolvedConflicts, setResolvedConflicts] = useState<string[]>([])

  const getSeverityColor = (severity: PermissionConflict["severity"]) => {
    switch (severity) {
      case "high":
        return "text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300"
      case "medium":
        return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300"
      case "low":
        return "text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300"
      default:
        return "text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  const getSeverityIcon = (severity: PermissionConflict["severity"]) => {
    switch (severity) {
      case "high":
        return XCircle
      case "medium":
        return AlertTriangle
      case "low":
        return Info
      default:
        return Info
    }
  }

  const getTypeIcon = (type: PermissionConflict["type"]) => {
    switch (type) {
      case "deny_overrides_allow":
        return Shield
      case "role_conflict":
        return Crown
      case "inheritance_conflict":
        return ArrowRight
      case "explicit_vs_inherited":
        return Users
      default:
        return AlertTriangle
    }
  }

  const getSourceIcon = (sourceType: string) => {
    switch (sourceType) {
      case "role":
        return Crown
      case "group":
        return Users
      case "direct":
        return Shield
      case "inherited":
        return ArrowRight
      default:
        return Info
    }
  }

  const getSourceColor = (sourceType: string) => {
    switch (sourceType) {
      case "role":
        return "text-purple-600 bg-purple-100 dark:bg-purple-900 dark:text-purple-300"
      case "group":
        return "text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300"
      case "direct":
        return "text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300"
      case "inherited":
        return "text-orange-600 bg-orange-100 dark:bg-orange-900 dark:text-orange-300"
      default:
        return "text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  const handleResolveConflict = (conflictId: string, resolution: "accept_recommendation" | "manual") => {
    onResolveConflict(conflictId, resolution)
    setResolvedConflicts((prev) => [...prev, conflictId])
  }

  const activeConflicts = conflicts.filter((c) => !resolvedConflicts.includes(c.id))
  const highSeverityConflicts = activeConflicts.filter((c) => c.severity === "high")
  const autoResolvableConflicts = activeConflicts.filter((c) => c.autoResolvable)

  return (
    <TooltipProvider>
      <div className={cn("space-y-6", className)}>
        {/* Summary */}
        {activeConflicts.length > 0 && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Permission Conflicts Detected</AlertTitle>
            <AlertDescription>
              {activeConflicts.length} permission conflict{activeConflicts.length !== 1 ? "s" : ""} found.
              {highSeverityConflicts.length > 0 && (
                <>
                  {" "}
                  {highSeverityConflicts.length} require{highSeverityConflicts.length === 1 ? "s" : ""} immediate
                  attention.
                </>
              )}
              {autoResolvableConflicts.length > 0 && <> {autoResolvableConflicts.length} can be auto-resolved.</>}
            </AlertDescription>
          </Alert>
        )}

        {/* Quick Actions */}
        {autoResolvableConflicts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Quick Resolution
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {autoResolvableConflicts.length} conflict{autoResolvableConflicts.length !== 1 ? "s" : ""} can be
                automatically resolved
              </p>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => {
                  autoResolvableConflicts.forEach((conflict) => {
                    handleResolveConflict(conflict.id, "accept_recommendation")
                  })
                }}
                className="w-full"
              >
                Auto-Resolve {autoResolvableConflicts.length} Conflict{autoResolvableConflicts.length !== 1 ? "s" : ""}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Conflicts List */}
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All ({activeConflicts.length})</TabsTrigger>
            <TabsTrigger value="high">High Priority ({highSeverityConflicts.length})</TabsTrigger>
            <TabsTrigger value="auto">Auto-Resolvable ({autoResolvableConflicts.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {activeConflicts.map((conflict) => {
              const SeverityIcon = getSeverityIcon(conflict.severity)
              const TypeIcon = getTypeIcon(conflict.type)

              return (
                <Card key={conflict.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className={cn("p-2 rounded-full", getSeverityColor(conflict.severity))}>
                        <SeverityIcon className="h-4 w-4" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <TypeIcon className="h-4 w-4 text-muted-foreground" />
                          <Badge variant="outline" className={cn("text-xs", getSeverityColor(conflict.severity))}>
                            {conflict.severity} priority
                          </Badge>
                          {conflict.autoResolvable && (
                            <Badge variant="secondary" className="text-xs text-green-600">
                              Auto-resolvable
                            </Badge>
                          )}
                        </div>

                        <h3 className="font-medium text-sm mb-2">{conflict.description}</h3>

                        <div className="space-y-2 mb-3">
                          <div className="flex flex-wrap gap-1">
                            <span className="text-xs text-muted-foreground">Affected users:</span>
                            {conflict.affectedUsers.map((user) => (
                              <Badge key={user} variant="outline" className="text-xs">
                                {user}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex flex-wrap gap-1">
                            <span className="text-xs text-muted-foreground">Permissions:</span>
                            {conflict.affectedPermissions.map((permission) => (
                              <Badge key={permission} variant="secondary" className="text-xs">
                                {permission}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="mb-3">
                          <h4 className="text-xs font-medium text-muted-foreground mb-2">Conflicting Sources:</h4>
                          <div className="space-y-1">
                            {conflict.sources.map((source) => {
                              const SourceIcon = getSourceIcon(source.type)
                              return (
                                <div key={source.id} className="flex items-center gap-2 text-xs">
                                  <div className={cn("p-1 rounded", getSourceColor(source.type))}>
                                    <SourceIcon className="h-2 w-2" />
                                  </div>
                                  <span>{source.name}</span>
                                  <ArrowRight className="h-2 w-2 text-muted-foreground" />
                                  <span className="font-mono">
                                    {source.permission}: {source.value ? "ALLOW" : "DENY"}
                                  </span>
                                </div>
                              )
                            })}
                          </div>
                        </div>

                        <div className="p-3 bg-muted rounded-md mb-3">
                          <h4 className="text-xs font-medium mb-1">Recommendation:</h4>
                          <p className="text-xs text-muted-foreground">{conflict.recommendation}</p>
                        </div>

                        <div className="flex gap-2">
                          {conflict.autoResolvable && (
                            <Button
                              size="sm"
                              onClick={() => handleResolveConflict(conflict.id, "accept_recommendation")}
                            >
                              <CheckCircle className="h-3 w-3 mr-2" />
                              Accept Recommendation
                            </Button>
                          )}
                          <Button size="sm" variant="outline" onClick={() => onViewDetails(conflict.id)}>
                            View Details
                          </Button>
                          {!conflict.autoResolvable && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleResolveConflict(conflict.id, "manual")}
                            >
                              Manual Resolution
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </TabsContent>

          <TabsContent value="high" className="space-y-4">
            {highSeverityConflicts.length > 0 ? (
              highSeverityConflicts.map((conflict) => (
                <Card key={conflict.id} className="border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <XCircle className="h-4 w-4 text-red-600" />
                      <span className="font-medium text-sm">{conflict.description}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">{conflict.recommendation}</p>
                    <div className="flex gap-2">
                      {conflict.autoResolvable && (
                        <Button size="sm" onClick={() => handleResolveConflict(conflict.id, "accept_recommendation")}>
                          Resolve Now
                        </Button>
                      )}
                      <Button size="sm" variant="outline" onClick={() => onViewDetails(conflict.id)}>
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No high priority conflicts</h3>
                  <p className="text-sm text-muted-foreground">All critical permission conflicts have been resolved.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="auto" className="space-y-4">
            {autoResolvableConflicts.length > 0 ? (
              autoResolvableConflicts.map((conflict) => (
                <Card
                  key={conflict.id}
                  className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-sm">{conflict.description}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">{conflict.recommendation}</p>
                    <Button size="sm" onClick={() => handleResolveConflict(conflict.id, "accept_recommendation")}>
                      Auto-Resolve
                    </Button>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Info className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No auto-resolvable conflicts</h3>
                  <p className="text-sm text-muted-foreground">
                    All remaining conflicts require manual review and resolution.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Success State */}
        {activeConflicts.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No permission conflicts</h3>
              <p className="text-sm text-muted-foreground">
                All permissions are properly configured with no conflicts detected.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </TooltipProvider>
  )
}
