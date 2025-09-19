"use client"

import { useState, useEffect } from "react"
import { Search, User, Users, Crown, Plus, Check, Loader2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Badge } from "../ui/badge"
import { Input } from "../ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { ScrollArea } from "../ui/scroll-area"
import { cn } from "../../lib/utils"

export interface UserOption {
  id: string
  name: string
  email: string
  avatar?: string
  department?: string
  title?: string
  isActive: boolean
}

export interface RoleOption {
  id: string
  name: string
  description: string
  userCount: number
  permissions: string[]
  color?: string
}

export interface GroupOption {
  id: string
  name: string
  description: string
  memberCount: number
  type: "department" | "team" | "project"
}

interface UserRolePickerProps {
  users?: UserOption[]
  roles?: RoleOption[]
  groups?: GroupOption[]
  selectedUsers?: string[]
  selectedRoles?: string[]
  selectedGroups?: string[]
  onSelectionChange: (selection: {
    users: string[]
    roles: string[]
    groups: string[]
  }) => void
  onSearch?: (query: string, type: "users" | "roles" | "groups") => Promise<any[]>
  isLoading?: boolean
  maxSelections?: number
  allowMultiple?: boolean
  className?: string
}

// Mock data for demonstration
const mockUsers: UserOption[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john.doe@company.com",
    avatar: "/placeholder.svg",
    department: "Engineering",
    title: "Senior Developer",
    isActive: true,
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane.smith@company.com",
    department: "Design",
    title: "UX Designer",
    isActive: true,
  },
  {
    id: "3",
    name: "Mike Johnson",
    email: "mike.johnson@company.com",
    department: "Marketing",
    title: "Marketing Manager",
    isActive: false,
  },
]

const mockRoles: RoleOption[] = [
  {
    id: "admin",
    name: "Administrator",
    description: "Full system access and management capabilities",
    userCount: 5,
    permissions: ["manage", "delete", "share", "edit", "view"],
    color: "text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300",
  },
  {
    id: "editor",
    name: "Content Editor",
    description: "Can create, edit, and publish content",
    userCount: 12,
    permissions: ["edit", "view", "comment", "share"],
    color: "text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300",
  },
  {
    id: "viewer",
    name: "Viewer",
    description: "Read-only access to content",
    userCount: 45,
    permissions: ["view"],
    color: "text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300",
  },
]

const mockGroups: GroupOption[] = [
  {
    id: "eng-team",
    name: "Engineering Team",
    description: "All engineering department members",
    memberCount: 25,
    type: "department",
  },
  {
    id: "design-team",
    name: "Design Team",
    description: "Product design and UX team",
    memberCount: 8,
    type: "team",
  },
  {
    id: "project-alpha",
    name: "Project Alpha",
    description: "Members working on Project Alpha",
    memberCount: 12,
    type: "project",
  },
]

export function UserRolePicker({
  users = mockUsers,
  roles = mockRoles,
  groups = mockGroups,
  selectedUsers = [],
  selectedRoles = [],
  selectedGroups = [],
  onSelectionChange,
  onSearch,
  isLoading = false,
  maxSelections,
  allowMultiple = true,
  className,
}: UserRolePickerProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("users")
  const [filteredUsers, setFilteredUsers] = useState(users)
  const [filteredRoles, setFilteredRoles] = useState(roles)
  const [filteredGroups, setFilteredGroups] = useState(groups)
  const [isSearching, setIsSearching] = useState(false)

  // Filter items based on search query
  useEffect(() => {
    const query = searchQuery.toLowerCase()

    setFilteredUsers(
      users.filter(
        (user) =>
          user.name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query) ||
          user.department?.toLowerCase().includes(query),
      ),
    )

    setFilteredRoles(
      roles.filter((role) => role.name.toLowerCase().includes(query) || role.description.toLowerCase().includes(query)),
    )

    setFilteredGroups(
      groups.filter(
        (group) => group.name.toLowerCase().includes(query) || group.description.toLowerCase().includes(query),
      ),
    )
  }, [searchQuery, users, roles, groups])

  // Handle search with external API
  const handleSearch = async (query: string) => {
    if (!onSearch || query.length < 2) return

    setIsSearching(true)
    try {
      const results = await onSearch(query, activeTab as "users" | "roles" | "groups")

      switch (activeTab) {
        case "users":
          setFilteredUsers(results as UserOption[])
          break
        case "roles":
          setFilteredRoles(results as RoleOption[])
          break
        case "groups":
          setFilteredGroups(results as GroupOption[])
          break
      }
    } catch (error) {
      console.error("Search failed:", error)
    } finally {
      setIsSearching(false)
    }
  }

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery && onSearch) {
        handleSearch(searchQuery)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery, activeTab, onSearch])

  // Handle selection changes
  const handleUserToggle = (userId: string) => {
    let newSelection
    if (selectedUsers.includes(userId)) {
      newSelection = selectedUsers.filter((id) => id !== userId)
    } else {
      if (!allowMultiple) {
        newSelection = [userId]
      } else if (maxSelections && selectedUsers.length >= maxSelections) {
        return // Don't add if at max
      } else {
        newSelection = [...selectedUsers, userId]
      }
    }

    onSelectionChange({
      users: newSelection,
      roles: selectedRoles,
      groups: selectedGroups,
    })
  }

  const handleRoleToggle = (roleId: string) => {
    let newSelection
    if (selectedRoles.includes(roleId)) {
      newSelection = selectedRoles.filter((id) => id !== roleId)
    } else {
      if (!allowMultiple) {
        newSelection = [roleId]
      } else if (maxSelections && selectedRoles.length >= maxSelections) {
        return
      } else {
        newSelection = [...selectedRoles, roleId]
      }
    }

    onSelectionChange({
      users: selectedUsers,
      roles: newSelection,
      groups: selectedGroups,
    })
  }

  const handleGroupToggle = (groupId: string) => {
    let newSelection
    if (selectedGroups.includes(groupId)) {
      newSelection = selectedGroups.filter((id) => id !== groupId)
    } else {
      if (!allowMultiple) {
        newSelection = [groupId]
      } else if (maxSelections && selectedGroups.length >= maxSelections) {
        return
      } else {
        newSelection = [...selectedGroups, groupId]
      }
    }

    onSelectionChange({
      users: selectedUsers,
      roles: selectedRoles,
      groups: newSelection,
    })
  }

  const getTotalSelections = () => {
    return selectedUsers.length + selectedRoles.length + selectedGroups.length
  }

  const getGroupTypeIcon = (type: GroupOption["type"]) => {
    switch (type) {
      case "department":
        return Users
      case "team":
        return User
      case "project":
        return Crown
      default:
        return Users
    }
  }

  const getGroupTypeColor = (type: GroupOption["type"]) => {
    switch (type) {
      case "department":
        return "text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300"
      case "team":
        return "text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300"
      case "project":
        return "text-purple-600 bg-purple-100 dark:bg-purple-900 dark:text-purple-300"
      default:
        return "text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add Users & Roles
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Search and select users, roles, or groups to grant permissions
            </p>
          </div>
          {getTotalSelections() > 0 && (
            <Badge variant="secondary">
              {getTotalSelections()} selected
              {maxSelections && ` / ${maxSelections}`}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users, roles, or groups..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10"
          />
          {(isSearching || isLoading) && (
            <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>

        {/* Tabs for different types */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Users ({filteredUsers.length})
            </TabsTrigger>
            <TabsTrigger value="roles" className="flex items-center gap-2">
              <Crown className="h-4 w-4" />
              Roles ({filteredRoles.length})
            </TabsTrigger>
            <TabsTrigger value="groups" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Groups ({filteredGroups.length})
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users">
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {filteredUsers.map((user) => {
                  const isSelected = selectedUsers.includes(user.id)
                  const isDisabled =
                    !user.isActive || (maxSelections && getTotalSelections() >= maxSelections && !isSelected)

                  return (
                    <Card
                      key={user.id}
                      className={cn(
                        "cursor-pointer transition-all duration-200",
                        isSelected && "ring-2 ring-primary bg-primary/5",
                        isDisabled && "opacity-50 cursor-not-allowed",
                      )}
                      onClick={() => !isDisabled && handleUserToggle(user.id)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                            <AvatarFallback>
                              {user.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-sm truncate">{user.name}</p>
                              {!user.isActive && (
                                <Badge variant="secondary" className="text-xs">
                                  Inactive
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                            {user.department && (
                              <p className="text-xs text-muted-foreground">
                                {user.title} • {user.department}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center">
                            {isSelected && (
                              <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                <Check className="h-3 w-3 text-primary-foreground" />
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Roles Tab */}
          <TabsContent value="roles">
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {filteredRoles.map((role) => {
                  const isSelected = selectedRoles.includes(role.id)
                  const isDisabled = maxSelections && getTotalSelections() >= maxSelections && !isSelected

                  return (
                    <Card
                      key={role.id}
                      className={cn(
                        "cursor-pointer transition-all duration-200",
                        isSelected && "ring-2 ring-primary bg-primary/5",
                        isDisabled && "opacity-50 cursor-not-allowed",
                      )}
                      onClick={() => !isDisabled && handleRoleToggle(role.id)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center gap-3">
                          <div className={cn("p-2 rounded-full", role.color || "bg-primary/10")}>
                            <Crown className="h-4 w-4" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-sm truncate">{role.name}</p>
                              <Badge variant="outline" className="text-xs">
                                {role.userCount} users
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground truncate mb-2">{role.description}</p>
                            <div className="flex flex-wrap gap-1">
                              {role.permissions.slice(0, 3).map((permission) => (
                                <Badge key={permission} variant="secondary" className="text-xs">
                                  {permission}
                                </Badge>
                              ))}
                              {role.permissions.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{role.permissions.length - 3}
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center">
                            {isSelected && (
                              <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                <Check className="h-3 w-3 text-primary-foreground" />
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Groups Tab */}
          <TabsContent value="groups">
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {filteredGroups.map((group) => {
                  const isSelected = selectedGroups.includes(group.id)
                  const isDisabled = maxSelections && getTotalSelections() >= maxSelections && !isSelected
                  const GroupIcon = getGroupTypeIcon(group.type)

                  return (
                    <Card
                      key={group.id}
                      className={cn(
                        "cursor-pointer transition-all duration-200",
                        isSelected && "ring-2 ring-primary bg-primary/5",
                        isDisabled && "opacity-50 cursor-not-allowed",
                      )}
                      onClick={() => !isDisabled && handleGroupToggle(group.id)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center gap-3">
                          <div className={cn("p-2 rounded-full", getGroupTypeColor(group.type))}>
                            <GroupIcon className="h-4 w-4" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-sm truncate">{group.name}</p>
                              <Badge variant="outline" className="text-xs">
                                {group.memberCount} members
                              </Badge>
                              <Badge variant="secondary" className={cn("text-xs", getGroupTypeColor(group.type))}>
                                {group.type}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground truncate">{group.description}</p>
                          </div>

                          <div className="flex items-center">
                            {isSelected && (
                              <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                <Check className="h-3 w-3 text-primary-foreground" />
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        {/* Empty States */}
        {filteredUsers.length === 0 && activeTab === "users" && (
          <div className="text-center py-8">
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No users found</h3>
            <p className="text-sm text-muted-foreground">
              {searchQuery ? "Try adjusting your search terms." : "No users available to add."}
            </p>
          </div>
        )}

        {filteredRoles.length === 0 && activeTab === "roles" && (
          <div className="text-center py-8">
            <Crown className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No roles found</h3>
            <p className="text-sm text-muted-foreground">
              {searchQuery ? "Try adjusting your search terms." : "No roles available to add."}
            </p>
          </div>
        )}

        {filteredGroups.length === 0 && activeTab === "groups" && (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No groups found</h3>
            <p className="text-sm text-muted-foreground">
              {searchQuery ? "Try adjusting your search terms." : "No groups available to add."}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
