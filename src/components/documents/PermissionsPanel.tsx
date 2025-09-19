"use client"

import { Crown, Edit, Eye, MessageSquare, MoreHorizontal, Plus, Search, Share, Shield, User } from "lucide-react"
import { useState } from "react"
import { cn } from "../../lib/utils"
import type { DocumentPermission } from "../../types/documentDetail"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { Input } from "../ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"

interface PermissionsPanelProps {
  permissions: DocumentPermission[]
  canManagePermissions?: boolean
  onAddUser?: () => void
  onEditPermissions?: (permission: DocumentPermission) => void
  onRemoveUser?: (permission: DocumentPermission) => void
  className?: string
}

const getRoleIcon = (role: DocumentPermission["role"]) => {
  switch (role) {
    case "owner":
      return Crown
    case "editor":
      return Edit
    case "viewer":
      return Eye
    case "commenter":
      return MessageSquare
    default:
      return User
  }
}

const getRoleColor = (role: DocumentPermission["role"]) => {
  switch (role) {
    case "owner":
      return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300"
    case "editor":
      return "text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300"
    case "viewer":
      return "text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300"
    case "commenter":
      return "text-purple-600 bg-purple-100 dark:bg-purple-900 dark:text-purple-300"
    default:
      return "text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-300"
  }
}

export function PermissionsPanel({
  permissions,
  canManagePermissions = false,
  onAddUser,
  onEditPermissions,
  onRemoveUser,
  className,
}: PermissionsPanelProps) {
  const [searchTerm, setSearchTerm] = useState("")

  // Filter permissions based on search
  const filteredPermissions = permissions.filter(
    (permission) =>
      permission.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      permission.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      permission.role.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Group permissions by role
  const groupedPermissions = filteredPermissions.reduce(
    (groups, permission) => {
      if (!groups[permission.role]) {
        groups[permission.role] = []
      }
      groups[permission.role].push(permission)
      return groups
    },
    {} as Record<string, DocumentPermission[]>,
  )

  const roleOrder: DocumentPermission["role"][] = ["owner", "editor", "commenter", "viewer"]

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header with search and add user */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-lg">Document Permissions</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Manage who can access and modify this document</p>
            </div>
            {canManagePermissions && onAddUser && (
              <Button onClick={onAddUser} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Permissions Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {roleOrder.map((role) => {
          const rolePermissions = groupedPermissions[role] || []
          const RoleIcon = getRoleIcon(role)

          return (
            <Card key={role}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className={cn("p-2 rounded-full", getRoleColor(role))}>
                    <RoleIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium capitalize">{role}s</p>
                    <p className="text-xs text-muted-foreground">
                      {rolePermissions.length} user{rolePermissions.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Permissions Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead>Access Source</TableHead>
                <TableHead>Granted</TableHead>
                {canManagePermissions && <TableHead className="w-12"></TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPermissions.map((permission) => {
                const RoleIcon = getRoleIcon(permission.role)

                return (
                  <TableRow key={permission.userId}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={permission.userAvatar || "/placeholder.svg"} alt={permission.userName} />
                          <AvatarFallback className="text-xs">
                            {permission.userName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{permission.userName}</p>
                          <p className="text-xs text-muted-foreground truncate">{permission.userEmail}</p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={cn("p-1 rounded", getRoleColor(permission.role))}>
                          <RoleIcon className="h-3 w-3" />
                        </div>
                        <span className="text-sm capitalize">{permission.role}</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {permission.permissions.canRead && (
                          <Badge variant="outline" className="text-xs">
                            <Eye className="h-3 w-3 mr-1" />
                            Read
                          </Badge>
                        )}
                        {permission.permissions.canWrite && (
                          <Badge variant="outline" className="text-xs">
                            <Edit className="h-3 w-3 mr-1" />
                            Write
                          </Badge>
                        )}
                        {permission.permissions.canShare && (
                          <Badge variant="outline" className="text-xs">
                            <Share className="h-3 w-3 mr-1" />
                            Share
                          </Badge>
                        )}
                        {permission.permissions.canComment && (
                          <Badge variant="outline" className="text-xs">
                            <MessageSquare className="h-3 w-3 mr-1" />
                            Comment
                          </Badge>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="text-sm">
                        {permission.inheritedFrom ? (
                          <div>
                            <span className="text-muted-foreground">Inherited from</span>
                            <br />
                            <span className="font-medium">{permission.inheritedFrom}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Direct access</span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        <div>By {permission.grantedBy}</div>
                        <div>{new Date(permission.grantedDate).toLocaleDateString()}</div>
                      </div>
                    </TableCell>

                    {canManagePermissions && (
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {onEditPermissions && (
                              <DropdownMenuItem onClick={() => onEditPermissions(permission)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Permissions
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            {onRemoveUser && permission.role !== "owner" && (
                              <DropdownMenuItem onClick={() => onRemoveUser(permission)} className="text-destructive">
                                <User className="mr-2 h-4 w-4" />
                                Remove Access
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {filteredPermissions.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              {searchTerm ? "No matching users" : "No permissions set"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {searchTerm
                ? "Try adjusting your search to find users."
                : "Document permissions will appear here when users are granted access."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
