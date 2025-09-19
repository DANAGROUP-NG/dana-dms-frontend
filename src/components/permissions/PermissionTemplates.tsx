"use client"

import type React from "react"

import { useState } from "react"
import { Crown, Edit, Eye, MessageSquare, Settings, Users, Zap } from "lucide-react"
import { Button } from "../ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Badge } from "../ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"
import { cn } from "../../lib/utils"

export interface PermissionTemplate {
  id: string
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  permissions: {
    view: boolean
    edit: boolean
    comment: boolean
    share: boolean
    delete: boolean
    manage: boolean
  }
  color: string
  isDefault?: boolean
}

interface PermissionTemplatesProps {
  templates?: PermissionTemplate[]
  onApplyTemplate: (template: PermissionTemplate, subjectIds: string[]) => void
  selectedSubjects: string[]
  canManagePermissions?: boolean
  className?: string
}

const defaultTemplates: PermissionTemplate[] = [
  {
    id: "owner",
    name: "Owner",
    description: "Full control over the document including permissions management",
    icon: Crown,
    permissions: {
      view: true,
      edit: true,
      comment: true,
      share: true,
      delete: true,
      manage: true,
    },
    color: "text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300",
    isDefault: true,
  },
  {
    id: "editor",
    name: "Editor",
    description: "Can view, edit, comment, and share the document",
    icon: Edit,
    permissions: {
      view: true,
      edit: true,
      comment: true,
      share: true,
      delete: false,
      manage: false,
    },
    color: "text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300",
    isDefault: true,
  },
  {
    id: "commenter",
    name: "Commenter",
    description: "Can view and add comments to the document",
    icon: MessageSquare,
    permissions: {
      view: true,
      edit: false,
      comment: true,
      share: false,
      delete: false,
      manage: false,
    },
    color: "text-purple-600 bg-purple-100 dark:bg-purple-900 dark:text-purple-300",
    isDefault: true,
  },
  {
    id: "viewer",
    name: "Viewer",
    description: "Can only view and download the document",
    icon: Eye,
    permissions: {
      view: true,
      edit: false,
      comment: false,
      share: false,
      delete: false,
      manage: false,
    },
    color: "text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300",
    isDefault: true,
  },
]

export function PermissionTemplates({
  templates = defaultTemplates,
  onApplyTemplate,
  selectedSubjects,
  canManagePermissions = false,
  className,
}: PermissionTemplatesProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<PermissionTemplate | null>(null)

  const handleApplyTemplate = (template: PermissionTemplate) => {
    if (!canManagePermissions || selectedSubjects.length === 0) return
    onApplyTemplate(template, selectedSubjects)
    setSelectedTemplate(null)
  }

  const getPermissionCount = (template: PermissionTemplate) => {
    return Object.values(template.permissions).filter(Boolean).length
  }

  const getPermissionList = (template: PermissionTemplate) => {
    const permissions = []
    if (template.permissions.view) permissions.push("View")
    if (template.permissions.edit) permissions.push("Edit")
    if (template.permissions.comment) permissions.push("Comment")
    if (template.permissions.share) permissions.push("Share")
    if (template.permissions.delete) permissions.push("Delete")
    if (template.permissions.manage) permissions.push("Manage")
    return permissions
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Permission Templates
        </CardTitle>
        <p className="text-sm text-muted-foreground">Quickly apply common permission sets to selected users</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {templates.map((template) => {
            const TemplateIcon = template.icon
            const permissionCount = getPermissionCount(template)
            const isDisabled = !canManagePermissions || selectedSubjects.length === 0

            return (
              <Dialog key={template.id}>
                <DialogTrigger asChild>
                  <Card
                    className={cn(
                      "cursor-pointer transition-all duration-200 hover:shadow-md",
                      isDisabled && "opacity-50 cursor-not-allowed",
                    )}
                    onClick={() => !isDisabled && setSelectedTemplate(template)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={cn("p-2 rounded-full", template.color)}>
                          <TemplateIcon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm truncate">{template.name}</h3>
                          <p className="text-xs text-muted-foreground">
                            {permissionCount} permission{permissionCount !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>

                      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{template.description}</p>

                      <div className="flex flex-wrap gap-1">
                        {getPermissionList(template)
                          .slice(0, 3)
                          .map((permission) => (
                            <Badge key={permission} variant="outline" className="text-xs">
                              {permission}
                            </Badge>
                          ))}
                        {getPermissionList(template).length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{getPermissionList(template).length - 3}
                          </Badge>
                        )}
                      </div>

                      {template.isDefault && (
                        <Badge variant="secondary" className="text-xs mt-2">
                          Default
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                </DialogTrigger>

                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <div className={cn("p-2 rounded-full", template.color)}>
                        <TemplateIcon className="h-4 w-4" />
                      </div>
                      Apply {template.name} Template
                    </DialogTitle>
                    <DialogDescription>
                      This will apply the {template.name.toLowerCase()} permission set to {selectedSubjects.length}{" "}
                      selected subject{selectedSubjects.length !== 1 ? "s" : ""}.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Permissions included:</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(template.permissions).map(([key, value]) => (
                          <div key={key} className="flex items-center gap-2">
                            <div className={cn("w-2 h-2 rounded-full", value ? "bg-green-500" : "bg-gray-300")} />
                            <span
                              className={cn("text-sm capitalize", value ? "text-foreground" : "text-muted-foreground")}
                            >
                              {key}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setSelectedTemplate(null)}>
                        Cancel
                      </Button>
                      <Button onClick={() => handleApplyTemplate(template)}>Apply Template</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )
          })}
        </div>

        {selectedSubjects.length === 0 && canManagePermissions && (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Select users to apply templates</h3>
            <p className="text-sm text-muted-foreground">
              Choose one or more users from the permission matrix to quickly apply permission templates.
            </p>
          </div>
        )}

        {!canManagePermissions && (
          <div className="text-center py-8">
            <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Permission management disabled</h3>
            <p className="text-sm text-muted-foreground">You don't have permission to manage document permissions.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
