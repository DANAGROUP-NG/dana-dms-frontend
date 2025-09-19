"use client"

import type React from "react"

import { useState } from "react"
import {
  Shield,
  Eye,
  Edit,
  Share,
  Trash2,
  MessageSquare,
  Crown,
  User,
  Users,
  ChevronDown,
  Info,
  Lock,
  Unlock,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { Checkbox } from "../ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { cn } from "../../lib/utils"

export interface PermissionSubject {
  id: string
  name: string
  email?: string
  avatar?: string
  type: "user" | "role" | "group"
  isInherited?: boolean
  inheritedFrom?: string
}

export interface PermissionAction {
  id: string
  name: string
  icon: React.ComponentType<{ className?: string }>
  description: string
  category: "basic" | "advanced" | "admin"
}

export interface PermissionEntry {
  subjectId: string
  actionId: string
  granted: boolean
  inherited: boolean
  source?: string
  canModify: boolean
}

interface PermissionMatrixProps {
  subjects: PermissionSubject[]
  actions: PermissionAction[]
  permissions: PermissionEntry[]
  onPermissionChange: (subjectId: string, actionId: string, granted: boolean) => void
  onBulkPermissionChange: (subjectIds: string[], actionId: string, granted: boolean) => void
  canManagePermissions?: boolean
  showInheritance?: boolean
  className?: string
}

const defaultActions: PermissionAction[] = [
  { id: "view", name: "View", icon: Eye, description: "Can view and download the document", category: "basic" },
  { id: "edit", name: "Edit", icon: Edit, description: "Can modify document content", category: "basic" },
  {
    id: "comment",
    name: "Comment",
    icon: MessageSquare,
    description: "Can add comments and annotations",
    category: "basic",
  },
  { id: "share", name: "Share", icon: Share, description: "Can share document with others", category: "advanced" },
  { id: "delete", name: "Delete", icon: Trash2, description: "Can delete the document", category: "admin" },
  { id: "manage", name: "Manage", icon: Shield, description: "Can manage permissions and settings", category: "admin" },
]

export function PermissionMatrix({
  subjects,
  actions = defaultActions,
  permissions,
  onPermissionChange,
  onBulkPermissionChange,
  canManagePermissions = false,
  showInheritance = true,
  className,
}: PermissionMatrixProps) {
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([])
  const [expandedCategories, setExpandedCategories] = useState<string[]>(["basic", "advanced"])

  // Group actions by category
  const actionsByCategory = actions.reduce(
    (acc, action) => {
      if (!acc[action.category]) {
        acc[action.category] = []
      }
      acc[action.category].push(action)
      return acc
    },
    {} as Record<string, PermissionAction[]>,
  )

  // Get permission for specific subject and action
  const getPermission = (subjectId: string, actionId: string): PermissionEntry | undefined => {
    return permissions.find((p) => p.subjectId === subjectId && p.actionId === actionId)
  }

  // Handle individual permission toggle
  const handlePermissionToggle = (subjectId: string, actionId: string, currentValue: boolean) => {
    if (!canManagePermissions) return
    onPermissionChange(subjectId, actionId, !currentValue)
  }

  // Handle bulk permission toggle for selected subjects
  const handleBulkPermissionToggle = (actionId: string, granted: boolean) => {
    if (!canManagePermissions || selectedSubjects.length === 0) return
    onBulkPermissionChange(selectedSubjects, actionId, granted)
  }

  // Handle subject selection
  const handleSubjectSelect = (subjectId: string, selected: boolean) => {
    if (selected) {
      setSelectedSubjects((prev) => [...prev, subjectId])
    } else {
      setSelectedSubjects((prev) => prev.filter((id) => id !== subjectId))
    }
  }

  // Handle select all subjects
  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedSubjects(subjects.map((s) => s.id))
    } else {
      setSelectedSubjects([])
    }
  }

  // Toggle category expansion
  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    )
  }

  const getSubjectIcon = (subject: PermissionSubject) => {
    switch (subject.type) {
      case "role":
        return Crown
      case "group":
        return Users
      default:
        return User
    }
  }

  const getSubjectTypeColor = (type: string) => {
    switch (type) {
      case "role":
        return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300"
      case "group":
        return "text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300"
      default:
        return "text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300"
    }
  }

  return (
    <TooltipProvider>
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Permission Matrix
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Manage granular permissions for users, roles, and groups
              </p>
            </div>
            {canManagePermissions && selectedSubjects.length > 0 && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{selectedSubjects.length} selected</Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      Bulk Actions
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {actions.map((action) => (
                      <DropdownMenuItem key={action.id} onClick={() => handleBulkPermissionToggle(action.id, true)}>
                        <action.icon className="h-4 w-4 mr-2" />
                        Grant {action.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    {canManagePermissions && (
                      <Checkbox
                        checked={selectedSubjects.length === subjects.length && subjects.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    )}
                  </TableHead>
                  <TableHead className="min-w-[200px]">Subject</TableHead>
                  {Object.entries(actionsByCategory).map(([category, categoryActions]) => (
                    <TableHead key={category} className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleCategory(category)}
                        className="h-auto p-1 font-medium capitalize"
                      >
                        {category} Permissions
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 ml-1 transition-transform",
                            expandedCategories.includes(category) ? "rotate-180" : "",
                          )}
                        />
                      </Button>
                      {expandedCategories.includes(category) && (
                        <div className="flex justify-center gap-1 mt-2">
                          {categoryActions.map((action) => (
                            <Tooltip key={action.id}>
                              <TooltipTrigger asChild>
                                <div className="flex flex-col items-center gap-1 p-1">
                                  <action.icon className="h-4 w-4" />
                                  <span className="text-xs">{action.name}</span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{action.description}</p>
                              </TooltipContent>
                            </Tooltip>
                          ))}
                        </div>
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {subjects.map((subject) => {
                  const SubjectIcon = getSubjectIcon(subject)
                  const isSelected = selectedSubjects.includes(subject.id)

                  return (
                    <TableRow key={subject.id} className={cn(isSelected && "bg-muted/50")}>
                      <TableCell>
                        {canManagePermissions && (
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) => handleSubjectSelect(subject.id, !!checked)}
                          />
                        )}
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-3">
                          {subject.type === "user" ? (
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={subject.avatar || "/placeholder.svg"} alt={subject.name} />
                              <AvatarFallback className="text-xs">
                                {subject.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                          ) : (
                            <div className={cn("p-2 rounded-full", getSubjectTypeColor(subject.type))}>
                              <SubjectIcon className="h-4 w-4" />
                            </div>
                          )}

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium truncate">{subject.name}</p>
                              {subject.isInherited && showInheritance && (
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Info className="h-3 w-3 text-muted-foreground" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Inherited from {subject.inheritedFrom}</p>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                            </div>
                            {subject.email && <p className="text-xs text-muted-foreground truncate">{subject.email}</p>}
                            <Badge variant="outline" className={cn("text-xs mt-1", getSubjectTypeColor(subject.type))}>
                              {subject.type}
                            </Badge>
                          </div>
                        </div>
                      </TableCell>

                      {Object.entries(actionsByCategory).map(([category, categoryActions]) => (
                        <TableCell key={category} className="text-center">
                          {expandedCategories.includes(category) && (
                            <div className="flex justify-center gap-2">
                              {categoryActions.map((action) => {
                                const permission = getPermission(subject.id, action.id)
                                const isGranted = permission?.granted || false
                                const isInherited = permission?.inherited || false
                                const canModify = permission?.canModify !== false && canManagePermissions

                                return (
                                  <Tooltip key={action.id}>
                                    <TooltipTrigger asChild>
                                      <div className="relative">
                                        <Checkbox
                                          checked={isGranted}
                                          onCheckedChange={() =>
                                            handlePermissionToggle(subject.id, action.id, isGranted)
                                          }
                                          disabled={!canModify}
                                          className={cn(
                                            "h-5 w-5",
                                            isInherited && "opacity-60",
                                            !canModify && "cursor-not-allowed",
                                          )}
                                        />
                                        {isInherited && (
                                          <Lock className="h-2 w-2 absolute -top-1 -right-1 text-muted-foreground" />
                                        )}
                                        {!isInherited && isGranted && (
                                          <Unlock className="h-2 w-2 absolute -top-1 -right-1 text-green-600" />
                                        )}
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <div className="text-center">
                                        <p className="font-medium">{action.name}</p>
                                        <p className="text-xs">{action.description}</p>
                                        {isInherited && (
                                          <p className="text-xs text-muted-foreground mt-1">
                                            Inherited from {permission?.source}
                                          </p>
                                        )}
                                        {!canModify && (
                                          <p className="text-xs text-muted-foreground mt-1">Cannot modify</p>
                                        )}
                                      </div>
                                    </TooltipContent>
                                  </Tooltip>
                                )
                              })}
                            </div>
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}
