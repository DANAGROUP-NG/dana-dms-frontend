"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import type { LucideIcon } from "lucide-react"
import { skipToken } from "@reduxjs/toolkit/query"
import {
  Archive,
  ArrowLeft,
  Building2,
  ClipboardList,
  Download,
  Edit,
  Eye,
  Factory,
  FileText,
  Layers,
  Loader2,
  MapPin,
  MessageSquare,
  Share2,
  Shield,
  ShieldCheck,
  Trash2,
  UserPlus,
  Users as UsersIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  PermissionMatrix,
  type PermissionAction,
  type PermissionEntry,
  type PermissionSubject,
} from "@/components/permissions/PermissionMatrix"
import { InheritanceIndicator, type InheritanceNode } from "@/components/permissions/InheritanceIndicator"
import { SecurityValidation } from "@/components/permissions/SecurityValidation"
import { ShareDialog, type ShareLink } from "@/components/permissions/ShareDialog"
import { ShareLinkManager } from "@/components/permissions/ShareLinkManager"
import { EffectivePermissionsCalculator, type PermissionSource } from "@/components/permissions/EffectivePermissionsCalculator"
import { PermissionAuditLog, type AuditLogEntry } from "@/components/permissions/PermissionAuditLog"
import { useListOrgUnitsQuery, type OrgUnitDto } from "@/store/api/orgApi"
import {
  useAddMembershipMutation,
  useCreateUserMutation,
  useListUsersQuery,
  useUpdateUserMutation,
  type UserDto,
} from "@/store/api/usersApi"
import {
  useCreateRoleMutation,
  useDeleteRoleMutation,
  useListRolesQuery,
  useUpdateRoleMutation,
  type RoleDto,
} from "@/store/api/rolesApi"
import { useToast } from "@/hooks/use-toast"
import { useAppSelector } from "@/hooks/redux"
import { cn } from "@/lib/utils"

interface PermissionsManagementProps {
  documentId: string
  documentTitle: string
  onBack: () => void
}

type OrgFilters = {
  groupId: string
  subsidiaryId: string
  locationId: string
  departmentId: string
}

interface RoleFormState {
  id?: string
  name: string
  description: string
  capabilities: string[]
  scopeOrgId?: string
}

interface CapabilitySection {
  id: string
  label: string
  description: string
  icon: LucideIcon
  capabilities: {
    id: string
    label: string
    description: string
  }[]
}

const capabilityCatalog: CapabilitySection[] = [
  {
    id: "lifecycle",
    label: "Document lifecycle",
    description: "Read, write, and retention controls for files.",
    icon: FileText,
    capabilities: [
      { id: "document.view", label: "View / Preview", description: "Open and preview documents within scope." },
      { id: "document.download", label: "Download", description: "Download original files to device." },
      { id: "document.comment", label: "Comment", description: "Leave comments and annotations." },
      { id: "document.edit", label: "Edit", description: "Modify document content or metadata." },
      { id: "document.share", label: "Share", description: "Generate share links and send invites." },
      { id: "document.archive", label: "Archive", description: "Archive or move records between folders." },
      { id: "document.delete", label: "Delete", description: "Permanently delete from storage." },
    ],
  },
  {
    id: "collaboration",
    label: "Collaboration",
    description: "Controls for team-based distribution.",
    icon: UsersIcon,
    capabilities: [{ id: "document.manage", label: "Manage Permissions", description: "Grant, revoke, or escalate access." }],
  },
  {
    id: "security",
    label: "Security & compliance",
    description: "Guardrails for regulated operations.",
    icon: ShieldCheck,
    capabilities: [
      { id: "compliance.watermark", label: "Watermarking", description: "Enforce watermarking on downloads." },
      { id: "compliance.audit", label: "Audit mandate", description: "Require audit logging for changes." },
      { id: "security.ip-restriction", label: "IP restrictions", description: "Restrict by location/IP ranges." },
      { id: "security.expiration", label: "Expiry control", description: "Force access expiration policies." },
    ],
  },
  {
    id: "administration",
    label: "Administration",
    description: "Organization-wide administrative powers.",
    icon: ClipboardList,
    capabilities: [
      { id: "admin.role.manage", label: "Role lifecycle", description: "Create and maintain roles." },
      { id: "admin.user.manage", label: "User administration", description: "Activate, suspend, and reset users." },
      { id: "admin.policy.manage", label: "Policy management", description: "Define templates and governance." },
    ],
  },
]

const permissionActionsCatalog: PermissionAction[] = [
  { id: "view", name: "View", icon: Eye, description: "Preview documents", category: "basic" },
  { id: "download", name: "Download", icon: Download, description: "Download files", category: "basic" },
  { id: "comment", name: "Comment", icon: MessageSquare, description: "Annotate files", category: "basic" },
  { id: "edit", name: "Edit", icon: Edit, description: "Modify content", category: "advanced" },
  { id: "share", name: "Share", icon: Share2, description: "Distribute externally", category: "advanced" },
  { id: "archive", name: "Archive", icon: Archive, description: "Archive or move records", category: "advanced" },
  { id: "delete", name: "Delete", icon: Trash2, description: "Remove permanently", category: "admin" },
  { id: "manage", name: "Manage", icon: ShieldCheck, description: "Administer permissions & policies", category: "admin" },
]

const capabilityToActionMap: Record<string, PermissionAction["id"]> = {
  "document.view": "view",
  "document.download": "download",
  "document.comment": "comment",
  "document.edit": "edit",
  "document.share": "share",
  "document.archive": "archive",
  "document.delete": "delete",
  "document.manage": "manage",
  "compliance.watermark": "manage",
  "compliance.audit": "manage",
  "security.ip-restriction": "manage",
  "security.expiration": "manage",
  "admin.role.manage": "manage",
  "admin.user.manage": "manage",
  "admin.policy.manage": "manage",
}

const actionToCapabilitiesMap: Record<string, string[]> = Object.entries(capabilityToActionMap).reduce(
  (acc, [capability, action]) => {
    acc[action] = acc[action] ? [...acc[action], capability] : [capability]
    return acc
  },
  {} as Record<string, string[]>,
)

const EMPTY_FILTERS: OrgFilters = { groupId: "", subsidiaryId: "", locationId: "", departmentId: "" }

export function PermissionsManagement({ documentId, documentTitle, onBack }: PermissionsManagementProps) {
  const { toast } = useToast()
  const authUser = useAppSelector((state) => state.auth.user)

  const [activeTab, setActiveTab] = useState("overview")
  const [orgFilters, setOrgFilters] = useState<OrgFilters>(EMPTY_FILTERS)
  const [activeOrg, setActiveOrg] = useState<string>("")
  const [roleForm, setRoleForm] = useState<RoleFormState>({ name: "", description: "", capabilities: [] })
  const [permissionOverrides, setPermissionOverrides] = useState<Record<string, boolean>>({})
  const [shareLinks, setShareLinks] = useState<ShareLink[]>([])
  const [auditEntries, setAuditEntries] = useState<AuditLogEntry[]>([])
  const [userAssignmentTarget, setUserAssignmentTarget] = useState<UserDto | null>(null)
  const [assigningRoles, setAssigningRoles] = useState(false)
  const [deletingRoleId, setDeletingRoleId] = useState<string | null>(null)
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null)

  const { data: orgUnits = [], isLoading: loadingOrgUnits } = useListOrgUnitsQuery()

  const orgMap = useMemo(() => {
    const map = new Map<string, OrgUnitDto>()
    orgUnits.forEach((unit) => map.set(unit.id, unit))
    return map
  }, [orgUnits])

  const parentLookup = useMemo(() => {
    const lookup: Record<string, string | undefined> = {}
    orgUnits.forEach((unit) => {
      lookup[unit.id] = unit.parentId
    })
    return lookup
  }, [orgUnits])

  const belongsTo = useCallback(
    (unitId: string, ancestorId?: string) => {
      if (!ancestorId) return true
      if (unitId === ancestorId) return true
      let currentParentId = parentLookup[unitId]
      while (currentParentId) {
        if (currentParentId === ancestorId) return true
        currentParentId = parentLookup[currentParentId]
      }
      return false
    },
    [parentLookup],
  )

  const groupOptions = useMemo(() => orgUnits.filter((unit) => unit.type === "GROUP"), [orgUnits])

  const subsidiaryOptions = useMemo(
    () => orgUnits.filter((unit) => unit.type === "SUBSIDIARY" && belongsTo(unit.id, orgFilters.groupId || undefined)),
    [orgUnits, belongsTo, orgFilters.groupId],
  )

  const locationOptions = useMemo(
    () =>
      orgUnits.filter((unit) => {
        if (unit.type !== "LOCATION") return false
        if (orgFilters.subsidiaryId) return belongsTo(unit.id, orgFilters.subsidiaryId)
        if (orgFilters.groupId) return belongsTo(unit.id, orgFilters.groupId)
        return true
      }),
    [orgUnits, belongsTo, orgFilters.subsidiaryId, orgFilters.groupId],
  )

  const departmentOptions = useMemo(
    () =>
      orgUnits.filter((unit) => {
        if (unit.type !== "DEPARTMENT") return false
        if (orgFilters.locationId) return belongsTo(unit.id, orgFilters.locationId)
        if (orgFilters.subsidiaryId) return belongsTo(unit.id, orgFilters.subsidiaryId)
        if (orgFilters.groupId) return belongsTo(unit.id, orgFilters.groupId)
        return true
      }),
    [orgUnits, belongsTo, orgFilters.locationId, orgFilters.subsidiaryId, orgFilters.groupId],
  )

  const deriveDefaultFilters = useCallback((): OrgFilters => {
    const firstGroup = groupOptions[0]
    const firstSubsidiary =
      subsidiaryOptions.find((unit) => belongsTo(unit.id, firstGroup?.id)) || subsidiaryOptions[0]
    const firstLocation =
      locationOptions.find((unit) => belongsTo(unit.id, firstSubsidiary?.id ?? firstGroup?.id)) || locationOptions[0]
    const firstDepartment =
      departmentOptions.find((unit) => belongsTo(unit.id, firstLocation?.id ?? firstSubsidiary?.id ?? firstGroup?.id)) ||
      departmentOptions[0]

    return {
      groupId: firstGroup?.id ?? "",
      subsidiaryId: firstSubsidiary?.id ?? "",
      locationId: firstLocation?.id ?? "",
      departmentId: firstDepartment?.id ?? "",
    }
  }, [groupOptions, subsidiaryOptions, locationOptions, departmentOptions, belongsTo])

  useEffect(() => {
    if (!orgUnits.length) return
    setOrgFilters((prev) => {
      if (prev.groupId || prev.subsidiaryId || prev.locationId || prev.departmentId) return prev
      return deriveDefaultFilters()
    })
  }, [orgUnits, deriveDefaultFilters])

  useEffect(() => {
    const nextActive =
      orgFilters.departmentId || orgFilters.locationId || orgFilters.subsidiaryId || orgFilters.groupId || ""
    setActiveOrg((prev) => {
      if (nextActive && prev !== nextActive) return nextActive
      return prev || nextActive
    })
  }, [orgFilters])

  useEffect(() => {
    setPermissionOverrides({})
  }, [activeOrg])

  useEffect(() => {
    if (!activeOrg) return
    setRoleForm((prev) => (prev.id ? prev : { ...prev, scopeOrgId: prev.scopeOrgId || activeOrg }))
  }, [activeOrg])

  const usersQueryArg = activeOrg ? { orgUnitId: activeOrg } : skipToken
  const rolesQueryArg = activeOrg ? { orgUnitId: activeOrg } : skipToken

  const { data: users = [], isFetching: loadingUsers } = useListUsersQuery(usersQueryArg)
  const { data: roles = [], isFetching: loadingRoles } = useListRolesQuery(rolesQueryArg)

  const [createUser, { isLoading: creatingUser }] = useCreateUserMutation()
  const [updateUser] = useUpdateUserMutation()
  const [addMembership] = useAddMembershipMutation()
  const [createRole, { isLoading: creatingRole }] = useCreateRoleMutation()
  const [updateRole, { isLoading: updatingRole }] = useUpdateRoleMutation()
  const [deleteRole] = useDeleteRoleMutation()

  const selectedOrg = activeOrg ? orgMap.get(activeOrg) : undefined

  const selectedOrgPath = useMemo(() => {
    if (!activeOrg) return [] as OrgUnitDto[]
    const path: OrgUnitDto[] = []
    let current = orgMap.get(activeOrg)
    while (current) {
      path.unshift(current)
      if (!current.parentId) break
      current = current.parentId ? orgMap.get(current.parentId) : undefined
    }
    return path
  }, [activeOrg, orgMap])

  const scopeStats = useMemo(() => {
    const rootId = selectedOrgPath[0]?.id || orgFilters.groupId || ""
    return [
      {
        id: "subsidiaries",
        label: "Subsidiaries",
        value: orgUnits.filter((unit) => unit.type === "SUBSIDIARY" && belongsTo(unit.id, rootId)).length,
        icon: Factory,
      },
      {
        id: "locations",
        label: "Locations",
        value: orgUnits.filter((unit) => unit.type === "LOCATION" && belongsTo(unit.id, rootId)).length,
        icon: MapPin,
      },
      {
        id: "departments",
        label: "Departments",
        value: orgUnits.filter((unit) => unit.type === "DEPARTMENT" && belongsTo(unit.id, rootId)).length,
        icon: Layers,
      },
    ]
  }, [orgUnits, belongsTo, selectedOrgPath, orgFilters.groupId])

  const roleUsage = useMemo(() => {
    const usage: Record<string, number> = {}
    users.forEach((user) => {
      user.memberships?.forEach((membership) => {
        membership.roleIds.forEach((roleId) => {
          usage[roleId] = (usage[roleId] || 0) + 1
        })
      })
    })
    return usage
  }, [users])

  const rolesById = useMemo(() => {
    const map = new Map<string, RoleDto>()
    roles.forEach((role) => map.set(role.id, role))
    return map
  }, [roles])

  const permissionSubjects: PermissionSubject[] = useMemo(() => {
    const roleSubjects: PermissionSubject[] = roles.map((role) => ({
      id: `role-${role.id}`,
      name: role.name,
      type: "role",
      isInherited: false,
    }))
    const userSubjects: PermissionSubject[] = users.map((user) => ({
      id: `user-${user.id}`,
      name: user.fullName,
      email: user.email,
      type: "user",
      isInherited: false,
    }))
    return [...roleSubjects, ...userSubjects]
  }, [roles, users])

  const subjectLabelLookup = useMemo(() => {
    const map = new Map<string, string>()
    permissionSubjects.forEach((subject) => map.set(subject.id, subject.name))
    return map
  }, [permissionSubjects])

  const permissionEntries: PermissionEntry[] = useMemo(() => {
    const entries: PermissionEntry[] = []

    const getRoleBySubjectId = (subjectId: string) => {
      if (!subjectId.startsWith("role-")) return undefined
      const roleId = subjectId.replace("role-", "")
      return rolesById.get(roleId)
    }

    const getUserBySubjectId = (subjectId: string) => {
      if (!subjectId.startsWith("user-")) return undefined
      const userId = subjectId.replace("user-", "")
      return users.find((u) => u.id === userId)
    }

    permissionSubjects.forEach((subject) => {
      permissionActionsCatalog.forEach((action) => {
        let granted = false
        let inherited = subject.type === "user"
        let source: string | undefined

        if (subject.type === "role") {
          const role = getRoleBySubjectId(subject.id)
          if (role) {
            const capabilitySet = new Set(role.capabilities)
            const mappedCapabilities = actionToCapabilitiesMap[action.id] || []
            granted = mappedCapabilities.some((capability) => capabilitySet.has(capability))
            inherited = false
            source = selectedOrg?.name
          }
        } else {
          const user = getUserBySubjectId(subject.id)
          if (user) {
            const capabilitySet = new Set<string>()
            user.memberships
              ?.filter((membership) => !activeOrg || membership.orgUnitId === activeOrg)
              .forEach((membership) => {
                membership.roleIds.forEach((roleId) => {
                  const role = rolesById.get(roleId)
                  role?.capabilities.forEach((capability) => capabilitySet.add(capability))
                })
              })
            const mappedCapabilities = actionToCapabilitiesMap[action.id] || []
            granted = mappedCapabilities.some((capability) => capabilitySet.has(capability))
            source = granted ? "Roles in scope" : undefined
            inherited = true
          }
        }

        const overrideKey = `${subject.id}:${action.id}`
        if (overrideKey in permissionOverrides) {
          granted = permissionOverrides[overrideKey]
          inherited = false
          source = "Manual override"
        }

        entries.push({
          subjectId: subject.id,
          actionId: action.id,
          granted,
          inherited,
          source,
          canModify: true,
        })
      })
    })

    return entries
  }, [permissionSubjects, rolesById, users, activeOrg, permissionOverrides, selectedOrg])

  const calculatorUser = users[0]

  const calculatorSources: PermissionSource[] = useMemo(() => {
    if (!calculatorUser) return []
    const membership = calculatorUser.memberships?.find((m) => m.orgUnitId === activeOrg)
    if (!membership) return []

    return membership.roleIds
      .map((roleId, index) => {
        const role = rolesById.get(roleId)
        if (!role) return undefined
        const permissions: Record<string, boolean> = {}
        permissionActionsCatalog.forEach((action) => {
          const mappedCapabilities = actionToCapabilitiesMap[action.id] || []
          permissions[action.id] = mappedCapabilities.some((capability) => role.capabilities.includes(capability))
        })
        return {
          id: `role-${role.id}`,
          name: role.name,
          type: "role" as const,
          permissions,
          priority: 50 - index,
          isActive: true,
        }
      })
      .filter((item): item is PermissionSource => Boolean(item))
  }, [calculatorUser, activeOrg, rolesById])

  const aggregatedDocPermissions = useMemo(() => {
    const summary: Record<string, boolean> = {}
    permissionActionsCatalog.forEach((action) => {
      summary[action.id] = permissionEntries.some(
        (entry) => entry.actionId === action.id && entry.granted && entry.subjectId.startsWith("role-"),
      )
    })
    return summary
  }, [permissionEntries])

  const inheritanceTree: InheritanceNode | undefined = useMemo(() => {
    if (!selectedOrgPath.length) {
      return {
        id: documentId,
        name: documentTitle,
        type: "document",
        permissions: aggregatedDocPermissions,
        isInherited: false,
        level: 0,
      }
    }

    const nodes = selectedOrgPath.map((unit, index) => ({
      id: unit.id,
      name: unit.name,
      type: "folder" as const,
      permissions: aggregatedDocPermissions,
      isInherited: index !== 0,
      source: index > 0 ? selectedOrgPath[index - 1].name : undefined,
      level: index,
      children: [] as InheritanceNode[],
    }))

    for (let i = nodes.length - 1; i > 0; i -= 1) {
      nodes[i - 1].children = [nodes[i]]
    }

    const documentNode: InheritanceNode = {
      id: documentId,
      name: documentTitle,
      type: "document",
      permissions: aggregatedDocPermissions,
      isInherited: true,
      source: selectedOrg?.name,
      level: nodes.length,
    }

    nodes[nodes.length - 1].children = [documentNode]
    return nodes[0]
  }, [selectedOrgPath, aggregatedDocPermissions, documentId, documentTitle, selectedOrg])

  const overviewCards = [
    { label: "Users in scope", value: loadingUsers ? "…" : users.length.toString() },
    { label: "Roles in scope", value: loadingRoles ? "…" : roles.length.toString() },
    { label: "Share links", value: shareLinks.length.toString() },
    { label: "Overrides", value: Object.keys(permissionOverrides).length.toString() },
  ]

  const auditActor = useMemo(() => {
    if (authUser) {
      return {
        id: authUser.id,
        name: `${authUser.firstName} ${authUser.lastName}`.trim(),
        email: authUser.email,
        type: "user" as const,
      }
    }
    return {
      id: "system",
      name: "System",
      email: "system@dana.group",
      type: "system" as const,
    }
  }, [authUser])

  const registerAudit = useCallback(
    (entry: Omit<AuditLogEntry, "id" | "timestamp" | "actor"> & { timestamp?: string }) => {
      setAuditEntries((prev) => [
        {
          id: crypto.randomUUID(),
          timestamp: entry.timestamp ?? new Date().toISOString(),
          actor: auditActor,
          ...entry,
        },
        ...prev,
      ])
    },
    [auditActor],
  )

  const handleOrgFilterChange = (key: keyof OrgFilters, value: string) => {
    setOrgFilters((prev) => {
      const next = { ...prev, [key]: value }
      if (key === "groupId") {
        next.subsidiaryId = ""
        next.locationId = ""
        next.departmentId = ""
      } else if (key === "subsidiaryId") {
        next.locationId = ""
        next.departmentId = ""
      } else if (key === "locationId") {
        next.departmentId = ""
      }
      return next
    })
  }

  const handleResetScope = () => {
    setOrgFilters(deriveDefaultFilters())
  }

  const handleRoleCapabilityToggle = (capabilityId: string, checked: boolean) => {
    setRoleForm((prev) => {
      const capabilities = checked
        ? Array.from(new Set([...prev.capabilities, capabilityId]))
        : prev.capabilities.filter((id) => id !== capabilityId)
      return { ...prev, capabilities }
    })
  }

  const handleEditRole = (role: RoleDto) => {
    setRoleForm({
      id: role.id,
      name: role.name,
      description: role.description ?? "",
      capabilities: role.capabilities,
      scopeOrgId: role.orgUnitId,
    })
  }

  const resetRoleForm = () => {
    setRoleForm({ name: "", description: "", capabilities: [], scopeOrgId: activeOrg })
  }

  const handleSaveRole = async () => {
    if (!roleForm.name.trim()) {
      toast({ title: "Role name required", description: "Provide a descriptive name for the role.", variant: "destructive" })
      return
    }

    const scopedOrgId = roleForm.scopeOrgId || activeOrg
    if (!scopedOrgId) {
      toast({ title: "Select an organization scope", description: "Choose a level before saving.", variant: "destructive" })
      return
    }

    const payload = {
      name: roleForm.name.trim(),
      description: roleForm.description?.trim() || undefined,
      capabilities: roleForm.capabilities,
      orgUnitId: scopedOrgId,
    }

    try {
      if (roleForm.id) {
        await updateRole({ id: roleForm.id, updates: payload }).unwrap()
        registerAudit({
          action: "modify",
          category: "permission",
          severity: "info",
          target: { id: roleForm.id, name: payload.name, type: "role" },
          resource: { id: documentId, name: documentTitle, type: "document" },
          details: { permission: "role.manage" },
        })
        toast({ title: "Role updated", description: `${payload.name} has been saved.` })
      } else {
        const created = await createRole(payload).unwrap()
        registerAudit({
          action: "grant",
          category: "permission",
          severity: "info",
          target: { id: created.id, name: created.name, type: "role" },
          resource: { id: documentId, name: documentTitle, type: "document" },
          details: { permission: "role.manage" },
        })
        toast({ title: "Role created", description: `${payload.name} is now available in this scope.` })
      }
      resetRoleForm()
    } catch {
      toast({ title: "Role operation failed", description: "Unable to persist role changes.", variant: "destructive" })
    }
  }

  const handleDeleteRole = async (role: RoleDto) => {
    if (!window.confirm(`Delete role "${role.name}"?`)) return
    setDeletingRoleId(role.id)
    try {
      await deleteRole(role.id).unwrap()
      registerAudit({
        action: "revoke",
        category: "permission",
        severity: "warning",
        target: { id: role.id, name: role.name, type: "role" },
        resource: { id: documentId, name: documentTitle, type: "document" },
        details: { reason: "Role deleted" },
      })
      toast({ title: "Role deleted", description: `${role.name} removed from this scope.` })
      if (roleForm.id === role.id) {
        resetRoleForm()
      }
    } catch {
      toast({ title: "Failed to delete role", variant: "destructive" })
    } finally {
      setDeletingRoleId(null)
    }
  }

  const handleCreateUser = async (payload: {
    fullName: string
    email: string
    phone?: string
    roleIds: string[]
    primary: boolean
  }) => {
    if (!activeOrg) {
      toast({
        title: "Select an organizational scope",
        description: "Pick the target subsidiary/location before creating a user.",
        variant: "destructive",
      })
      return
    }

    try {
      const result = await createUser({
        fullName: payload.fullName,
        email: payload.email,
        phone: payload.phone,
        roleIds: payload.roleIds,
        primary: payload.primary,
        orgUnitId: activeOrg,
      }).unwrap()

      toast({
        title: "User created",
        description: result.initialPassword
          ? `Temporary password: ${result.initialPassword}`
          : "User can now authenticate.",
      })

      registerAudit({
        action: "grant",
        category: "permission",
        severity: "info",
        target: { id: result.user.id, name: result.user.fullName, type: "user" },
        resource: { id: documentId, name: documentTitle, type: "document" },
        details: { reason: "User onboarding" },
      })
    } catch {
      toast({ title: "Failed to create user", variant: "destructive" })
    }
  }

  const handleToggleUserStatus = async (user: UserDto, nextStatus: boolean) => {
    setUpdatingUserId(user.id)
    try {
      await updateUser({ id: user.id, updates: { isActive: nextStatus } }).unwrap()
      toast({
        title: nextStatus ? "User activated" : "User deactivated",
        description: `${user.fullName} is now ${nextStatus ? "active" : "inactive"}.`,
      })
      registerAudit({
        action: nextStatus ? "grant" : "revoke",
        category: "permission",
        severity: nextStatus ? "info" : "warning",
        target: { id: user.id, name: user.fullName, type: "user" },
        resource: { id: documentId, name: documentTitle, type: "document" },
        details: { reason: "Status toggle" },
      })
    } catch {
      toast({ title: "Unable to update user status", variant: "destructive" })
    } finally {
      setUpdatingUserId(null)
    }
  }

  const handleAssignRoles = async (roleIds: string[]) => {
    if (!userAssignmentTarget || !activeOrg) return
    setAssigningRoles(true)
    try {
      await addMembership({
        id: userAssignmentTarget.id,
        membership: { orgUnitId: activeOrg, roleIds, primary: false },
      }).unwrap()

      toast({ title: "Roles updated", description: `${userAssignmentTarget.fullName} assignments saved.` })
      registerAudit({
        action: "grant",
        category: "permission",
        severity: "info",
        target: { id: userAssignmentTarget.id, name: userAssignmentTarget.fullName, type: "user" },
        resource: { id: documentId, name: documentTitle, type: "document" },
        details: { permission: "role.manage" },
      })
      setUserAssignmentTarget(null)
    } catch {
      toast({ title: "Failed to update memberships", variant: "destructive" })
    } finally {
      setAssigningRoles(false)
    }
  }

  const handlePermissionChange = (subjectId: string, actionId: string, granted: boolean) => {
    setPermissionOverrides((prev) => ({ ...prev, [`${subjectId}:${actionId}`]: granted }))
    const subjectName = subjectLabelLookup.get(subjectId) ?? subjectId
    registerAudit({
      action: "modify",
      category: "permission",
      severity: "info",
      target: { id: subjectId, name: subjectName, type: subjectId.startsWith("role-") ? "role" : "user" },
      resource: { id: documentId, name: documentTitle, type: "document" },
      details: { permission: actionId, reason: "Manual override" },
    })
  }

  const handleBulkPermissionChange = (subjectIds: string[], actionId: string, granted: boolean) => {
    setPermissionOverrides((prev) => {
      const next = { ...prev }
      subjectIds.forEach((subjectId) => {
        next[`${subjectId}:${actionId}`] = granted
      })
      return next
    })

    subjectIds.forEach((subjectId) => {
      const subjectName = subjectLabelLookup.get(subjectId) ?? subjectId
      registerAudit({
        action: "modify",
        category: "permission",
        severity: "info",
        target: { id: subjectId, name: subjectName, type: subjectId.startsWith("role-") ? "role" : "user" },
        resource: { id: documentId, name: documentTitle, type: "document" },
        details: { permission: actionId, reason: "Bulk override" },
      })
    })
  }

  const handleShareLinkCreate = async (config: Partial<ShareLink>): Promise<ShareLink> => {
    const newLink: ShareLink = {
      id: crypto.randomUUID(),
      url: `https://share.dana.group/${crypto.randomUUID()}`,
      name: config.name,
      scope: config.scope ?? "organization",
      permissions: config.permissions ?? { canView: true, canDownload: false, canComment: false },
      expiresAt: config.expiresAt,
      createdAt: new Date().toISOString(),
      createdBy: auditActor.name,
      isActive: true,
      accessCount: 0,
      lastAccessed: undefined,
      requiresAuth: config.requiresAuth ?? true,
      allowedDomains: config.allowedDomains,
      watermark: config.watermark,
    }

    setShareLinks((prev) => [newLink, ...prev])
    registerAudit({
      action: "create_link",
      category: "sharing",
      severity: "info",
      target: { id: newLink.id, name: newLink.name ?? newLink.id, type: "link" },
      resource: { id: documentId, name: documentTitle, type: "document" },
      details: { permission: "share", newValue: newLink },
    })

    return newLink
  }

  const handleShareLinkUpdate = async (linkId: string, updates: Partial<ShareLink>) => {
    const targetName = shareLinks.find((link) => link.id === linkId)?.name ?? linkId
    setShareLinks((prev) => prev.map((link) => (link.id === linkId ? { ...link, ...updates } : link)))
    registerAudit({
      action: "modify",
      category: "sharing",
      severity: "info",
      target: { id: linkId, name: updates.name ?? targetName, type: "link" },
      resource: { id: documentId, name: documentTitle, type: "document" },
      details: updates,
    })
  }

  const handleShareLinkDelete = async (linkId: string) => {
    const targetName = shareLinks.find((link) => link.id === linkId)?.name ?? linkId
    setShareLinks((prev) => prev.filter((link) => link.id !== linkId))
    registerAudit({
      action: "delete_link",
      category: "sharing",
      severity: "warning",
      target: { id: linkId, name: targetName, type: "link" },
      resource: { id: documentId, name: documentTitle, type: "document" },
      details: { reason: "Manual deletion" },
    })
  }

  const handleCopyLink = (url: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(url).catch(() => undefined)
    }
  }

  const scopeOptions = selectedOrgPath.length ? selectedOrgPath : groupOptions
  const roleSaving = creatingRole || updatingRole

  return (
    <div className="flex h-full min-h-0 flex-col bg-gray-50">
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Permissions</h1>
              <p className="text-sm text-gray-500">{documentTitle}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <ShareDialog
              documentId={documentId}
              documentName={documentTitle}
              existingLinks={shareLinks}
              onCreateLink={handleShareLinkCreate}
              onUpdateLink={handleShareLinkUpdate}
              onDeleteLink={handleShareLinkDelete}
              onCopyLink={handleCopyLink}
            />

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="whitespace-nowrap">
                  <Shield className="mr-2 h-4 w-4" />
                  Security Check
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[85vh] w-full max-w-5xl overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Security Validation</DialogTitle>
                  <DialogDescription>Run zero-trust checks for this scope.</DialogDescription>
                </DialogHeader>
                <SecurityValidation />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[320px_1fr] lg:gap-8 lg:px-8">
          <OrgScopePanel
            filters={orgFilters}
            onFilterChange={handleOrgFilterChange}
            onReset={handleResetScope}
            groupOptions={groupOptions}
            subsidiaryOptions={subsidiaryOptions}
            locationOptions={locationOptions}
            departmentOptions={departmentOptions}
            selectedPath={selectedOrgPath}
            stats={scopeStats}
            loading={loadingOrgUnits}
          />

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="roles">Roles</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="permissions">Permissions</TabsTrigger>
              <TabsTrigger value="sharing">Sharing</TabsTrigger>
              <TabsTrigger value="audit">Audit</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                {overviewCards.map((card) => (
                  <Card key={card.label}>
                    <CardHeader className="pb-2">
                      <CardDescription>{card.label}</CardDescription>
                      <CardTitle className="text-3xl">{card.value}</CardTitle>
                    </CardHeader>
                  </Card>
                ))}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Scope summary</CardTitle>
                  <CardDescription>Hierarchy path and high-level readiness.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-xs uppercase text-muted-foreground">Active path</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedOrgPath.length === 0 && (
                        <Badge variant="outline" className="text-xs text-muted-foreground">
                          Select a group to begin
                        </Badge>
                      )}
                      {selectedOrgPath.map((unit, index) => (
                        <Badge key={unit.id} variant={index === selectedOrgPath.length - 1 ? "default" : "secondary"}>
                          {unit.name}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-md border bg-slate-50 p-4">
                    <p className="text-sm font-medium text-slate-700">Operational status</p>
                    <p className="text-xs text-muted-foreground">
                      {roles.length} roles • {users.length} users • {shareLinks.length} active links
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="roles" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Roles in {selectedOrg?.name ?? "selected scope"}</CardTitle>
                  <CardDescription>Tailor reusable permission bundles per subsidiary, location, or department.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Capabilities</TableHead>
                          <TableHead>Usage</TableHead>
                          <TableHead className="w-32 text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {roles.map((role) => (
                          <TableRow key={role.id}>
                            <TableCell>
                              <div className="font-medium">{role.name}</div>
                              <p className="text-xs text-muted-foreground">{role.description || "—"}</p>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-2">
                                {role.capabilities.slice(0, 4).map((capability) => (
                                  <Badge key={capability} variant="secondary" className="text-xs">
                                    {capability}
                                  </Badge>
                                ))}
                                {role.capabilities.length > 4 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{role.capabilities.length - 4}
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{roleUsage[role.id] ?? 0} users</TableCell>
                            <TableCell className="flex justify-end gap-2">
                              <Button variant="ghost" size="sm" onClick={() => handleEditRole(role)}>
                                Edit
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive"
                                onClick={() => handleDeleteRole(role)}
                                disabled={deletingRoleId === role.id}
                              >
                                {deletingRoleId === role.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                        {roles.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center text-sm text-muted-foreground">
                              No roles defined for this scope yet.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{roleForm.id ? "Edit role" : "Create role"}</CardTitle>
                  <CardDescription>Curate capabilities that align with Dana Group governance.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-sm font-medium">Placement</p>
                      <Select
                        value={roleForm.scopeOrgId || activeOrg || ""}
                        onValueChange={(value) => setRoleForm((prev) => ({ ...prev, scopeOrgId: value }))}
                        disabled={scopeOptions.length === 0}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose level" />
                        </SelectTrigger>
                        <SelectContent>
                          {scopeOptions.map((unit) => (
                            <SelectItem key={unit.id} value={unit.id}>
                              {unit.name} • {unit.type.toLowerCase()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Role name</p>
                      <Input
                        value={roleForm.name}
                        onChange={(e) => setRoleForm((prev) => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Treasury Approver"
                      />
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium">Description</p>
                    <Textarea
                      value={roleForm.description}
                      onChange={(e) => setRoleForm((prev) => ({ ...prev, description: e.target.value }))}
                      placeholder="Explain what this role should be used for"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-4">
                    {capabilityCatalog.map((section) => (
                      <div key={section.id} className="rounded-md border p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{section.label}</p>
                            <p className="text-xs text-muted-foreground">{section.description}</p>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {
                              roleForm.capabilities.filter((capability) =>
                                section.capabilities.some((item) => item.id === capability),
                              ).length
                            }
                            /{section.capabilities.length}
                          </Badge>
                        </div>
                        <div className="mt-3 grid gap-3 sm:grid-cols-2">
                          {section.capabilities.map((capability) => {
                            const checked = roleForm.capabilities.includes(capability.id)
                            return (
                              <label key={capability.id} className="flex cursor-pointer items-start gap-3 rounded-md border p-3">
                                <Checkbox
                                  checked={checked}
                                  onCheckedChange={(state) => handleRoleCapabilityToggle(capability.id, Boolean(state))}
                                />
                                <div>
                                  <p className="text-sm font-medium">{capability.label}</p>
                                  <p className="text-xs text-muted-foreground">{capability.description}</p>
                                </div>
                              </label>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <Button onClick={handleSaveRole} disabled={roleSaving}>
                      {roleSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : roleForm.id ? "Update role" : "Create role"}
                    </Button>
                    <Button variant="outline" onClick={resetRoleForm} disabled={roleSaving}>
                      Reset
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="users" className="space-y-6">
              <UsersTable
                users={users}
                orgMap={orgMap}
                activeOrgId={activeOrg}
                rolesById={rolesById}
                onManageRoles={setUserAssignmentTarget}
                onToggleStatus={handleToggleUserStatus}
                updatingUserId={updatingUserId}
                isLoading={loadingUsers}
                canAssignRoles={roles.length > 0}
              />

              <CreateUserForm
                roles={roles}
                selectedOrg={selectedOrg}
                creating={creatingUser}
                onCreate={handleCreateUser}
              />
            </TabsContent>

            <TabsContent value="permissions" className="space-y-6">
              <PermissionMatrix
                subjects={permissionSubjects}
                actions={permissionActionsCatalog}
                permissions={permissionEntries}
                onPermissionChange={handlePermissionChange}
                onBulkPermissionChange={handleBulkPermissionChange}
                canManagePermissions
                showInheritance
              />

              <EffectivePermissionsCalculator
                userId={calculatorUser?.id}
                userName={calculatorUser?.fullName ?? "Select a user"}
                sources={calculatorSources}
                availablePermissions={permissionActionsCatalog.map((action) => action.id)}
              />

              {inheritanceTree && (
                <InheritanceIndicator rootNode={inheritanceTree} currentResourceId={documentId} />
              )}
            </TabsContent>

            <TabsContent value="sharing" className="space-y-6">
              <ShareLinkManager
                links={shareLinks}
                onUpdateLink={handleShareLinkUpdate}
                onDeleteLink={handleShareLinkDelete}
                onCopyLink={handleCopyLink}
              />
            </TabsContent>

            <TabsContent value="audit" className="space-y-6">
              <PermissionAuditLog entries={auditEntries} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <RoleAssignmentDialog
        user={userAssignmentTarget}
        roles={roles}
        open={Boolean(userAssignmentTarget)}
        onOpenChange={(open) => !open && setUserAssignmentTarget(null)}
        onSubmit={handleAssignRoles}
        submitting={assigningRoles}
        activeOrg={selectedOrg}
      />
    </div>
  )
}

function OrgScopePanel({
  filters,
  onFilterChange,
  onReset,
  groupOptions,
  subsidiaryOptions,
  locationOptions,
  departmentOptions,
  selectedPath,
  stats,
  loading,
}: {
  filters: OrgFilters
  onFilterChange: (key: keyof OrgFilters, value: string) => void
  onReset: () => void
  groupOptions: OrgUnitDto[]
  subsidiaryOptions: OrgUnitDto[]
  locationOptions: OrgUnitDto[]
  departmentOptions: OrgUnitDto[]
  selectedPath: OrgUnitDto[]
  stats: { id: string; label: string; value: number; icon: LucideIcon }[]
  loading: boolean
}) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Organizational scope</CardTitle>
          <CardDescription>Navigate group → subsidiary → location → department.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading && <p className="text-sm text-muted-foreground">Loading organizational units…</p>}

          <div className="space-y-3">
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground">Group</p>
              <Select value={filters.groupId} onValueChange={(value) => onFilterChange("groupId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select group" />
                </SelectTrigger>
                <SelectContent>
                  {groupOptions.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground">Subsidiary</p>
              <Select
                value={filters.subsidiaryId}
                onValueChange={(value) => onFilterChange("subsidiaryId", value)}
                disabled={subsidiaryOptions.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select subsidiary" />
                </SelectTrigger>
                <SelectContent>
                  {subsidiaryOptions.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground">Location</p>
              <Select
                value={filters.locationId}
                onValueChange={(value) => onFilterChange("locationId", value)}
                disabled={locationOptions.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {locationOptions.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground">Department</p>
              <Select
                value={filters.departmentId}
                onValueChange={(value) => onFilterChange("departmentId", value)}
                disabled={departmentOptions.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departmentOptions.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase text-muted-foreground">Hierarchy path</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {selectedPath.length === 0 && (
                <Badge variant="outline" className="text-xs text-muted-foreground">
                  No scope selected
                </Badge>
              )}
              {selectedPath.map((unit, index) => (
                <Badge key={unit.id} variant={index === selectedPath.length - 1 ? "default" : "secondary"}>
                  {unit.name}
                </Badge>
              ))}
            </div>
          </div>

          <Button variant="outline" size="sm" onClick={onReset} className="w-full">
            Reset scope
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Structure insights</CardTitle>
          <CardDescription>Counts derived from the selected group.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {stats.map((stat) => (
            <div key={stat.id} className="flex items-center justify-between rounded-md border p-3">
              <div>
                <p className="text-sm font-medium">{stat.label}</p>
                <p className="text-xs text-muted-foreground">Within current branch</p>
              </div>
              <div className="flex items-center gap-2">
                <stat.icon className="h-4 w-4 text-muted-foreground" />
                <span className="text-lg font-semibold">{stat.value}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

function UsersTable({
  users,
  orgMap,
  activeOrgId,
  rolesById,
  onManageRoles,
  onToggleStatus,
  updatingUserId,
  isLoading,
  canAssignRoles,
}: {
  users: UserDto[]
  orgMap: Map<string, OrgUnitDto>
  activeOrgId?: string
  rolesById: Map<string, RoleDto>
  onManageRoles: (user: UserDto) => void
  onToggleStatus: (user: UserDto, status: boolean) => void
  updatingUserId: string | null
  isLoading: boolean
  canAssignRoles: boolean
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Users in scope</CardTitle>
        <CardDescription>Only members filtered by the selected organization are listed here.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading && <p className="text-sm text-muted-foreground">Loading users…</p>}
        {!isLoading && users.length === 0 && (
          <p className="text-sm text-muted-foreground">No users found for this branch yet.</p>
        )}
        {!isLoading && users.length > 0 && (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Full name</TableHead>
                  <TableHead>Memberships</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-32 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => {
                  const memberships = user.memberships ?? []
                  const visibleMemberships =
                    activeOrgId ? memberships.filter((membership) => membership.orgUnitId === activeOrgId) : memberships

                  return (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="font-medium">{user.fullName}</div>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </TableCell>
                      <TableCell>
                        {visibleMemberships.length === 0 && (
                          <p className="text-xs text-muted-foreground">No assignments in this scope</p>
                        )}
                        <div className="space-y-1">
                          {visibleMemberships.map((membership) => {
                            const org = orgMap.get(membership.orgUnitId)
                            const roleNames = membership.roleIds.map((roleId) => rolesById.get(roleId)?.name ?? roleId)
                            return (
                              <div key={membership.id ?? `${membership.orgUnitId}-${membership.roleIds.join("-")}`} className="flex flex-wrap items-center gap-2">
                                <Badge variant="secondary" className="text-xs">
                                  {org?.name ?? membership.orgUnitId}
                                </Badge>
                                {roleNames.map((roleName) => (
                                  <Badge key={roleName} variant="outline" className="text-xs">
                                    {roleName}
                                  </Badge>
                                ))}
                              </div>
                            )
                          })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={user.isActive}
                            onCheckedChange={(state) => onToggleStatus(user, Boolean(state))}
                            disabled={updatingUserId === user.id}
                          />
                          <span className="text-xs text-muted-foreground">{user.isActive ? "Active" : "Inactive"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onManageRoles(user)}
                          disabled={!canAssignRoles}
                        >
                          Manage
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function CreateUserForm({
  roles,
  selectedOrg,
  creating,
  onCreate,
}: {
  roles: RoleDto[]
  selectedOrg?: OrgUnitDto
  creating: boolean
  onCreate: (payload: { fullName: string; email: string; phone?: string; roleIds: string[]; primary: boolean }) => void
}) {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [roleIds, setRoleIds] = useState<string[]>([])
  const [primary, setPrimary] = useState(true)

  const toggleRole = (roleId: string) => {
    setRoleIds((prev) => (prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId]))
  }

  const handleSubmit = async () => {
    if (!fullName || !email) return
    await onCreate({ fullName, email, phone, roleIds, primary })
    setFullName("")
    setEmail("")
    setPhone("")
    setRoleIds([])
    setPrimary(true)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create user</CardTitle>
        <CardDescription>
          Users inherit the context of <strong>{selectedOrg?.name ?? "selected scope"}</strong>.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm font-medium">Full name</p>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Jane Doe" />
          </div>
          <div>
            <p className="text-sm font-medium">Work email</p>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@dana.group" />
          </div>
        </div>
        <div>
          <p className="text-sm font-medium">Phone (optional)</p>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+234 800 000 0000" />
        </div>
        <div>
          <p className="text-sm font-medium">Assign roles</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {roles.map((role) => (
              <Button
                key={role.id}
                type="button"
                variant={roleIds.includes(role.id) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleRole(role.id)}
              >
                {role.name}
              </Button>
            ))}
            {roles.length === 0 && <p className="text-xs text-muted-foreground">No roles available in this scope.</p>}
          </div>
        </div>
        <div className="flex items-center justify-between rounded-md border p-3">
          <div>
            <p className="text-sm font-medium">Mark as primary contact</p>
            <p className="text-xs text-muted-foreground">Primary contacts receive escalation notices.</p>
          </div>
          <Switch checked={primary} onCheckedChange={(state) => setPrimary(Boolean(state))} />
        </div>
        <div className="flex gap-3">
          <Button onClick={handleSubmit} disabled={creating || !fullName || !email}>
            {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <><UserPlus className="mr-2 h-4 w-4" />Create user</>}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setFullName("")
              setEmail("")
              setPhone("")
              setRoleIds([])
              setPrimary(true)
            }}
          >
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function RoleAssignmentDialog({
  user,
  roles,
  open,
  onOpenChange,
  onSubmit,
  submitting,
  activeOrg,
}: {
  user: UserDto | null
  roles: RoleDto[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (roleIds: string[]) => void
  submitting: boolean
  activeOrg?: OrgUnitDto
}) {
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([])

  useEffect(() => {
    if (user && open) {
      const membership = user.memberships?.find((m) => m.orgUnitId === activeOrg?.id)
      setSelectedRoleIds(membership?.roleIds ?? [])
    }
  }, [user, open, activeOrg])

  const toggleRole = (roleId: string) => {
    setSelectedRoleIds((prev) => (prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId]))
  }

  const handleSubmit = () => {
    onSubmit(selectedRoleIds)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Assign roles</DialogTitle>
          <DialogDescription>
            {user ? `Manage ${user.fullName}'s access for ${activeOrg?.name ?? "this scope"}.` : ""}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[400px]">
          <div className="space-y-2 pr-2">
            {roles.map((role) => (
              <label key={role.id} className="flex cursor-pointer items-start gap-3 rounded-md border p-3">
                <Checkbox checked={selectedRoleIds.includes(role.id)} onCheckedChange={() => toggleRole(role.id)} />
                <div>
                  <p className="text-sm font-medium">{role.name}</p>
                  <p className="text-xs text-muted-foreground">{role.description || "No description"}</p>
                </div>
              </label>
            ))}
            {roles.length === 0 && <p className="text-sm text-muted-foreground">No roles available.</p>}
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || selectedRoleIds.length === 0}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save assignments"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
