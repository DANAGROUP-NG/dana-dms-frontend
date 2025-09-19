export interface Permission {
    id: string
    type: "user" | "role" | "group"
    entityId: string
    entityName: string
    entityEmail?: string
    permissions: {
      read: boolean
      write: boolean
      delete: boolean
      share: boolean
      admin: boolean
    }
    inherited: boolean
    inheritedFrom?: string
    grantedBy: string
    grantedAt: Date
    expiresAt?: Date
  }
  
  export interface ShareLink {
    id: string
    documentId: string
    token: string
    permissions: {
      read: boolean
      write: boolean
      download: boolean
    }
    expiresAt?: Date
    passwordProtected: boolean
    allowedDomains?: string[]
    maxUses?: number
    currentUses: number
    createdBy: string
    createdAt: Date
    lastAccessedAt?: Date
  }
  
  export interface PermissionTemplate {
    id: string
    name: string
    description: string
    permissions: {
      read: boolean
      write: boolean
      delete: boolean
      share: boolean
      admin: boolean
    }
    isDefault: boolean
  }
  
  export interface AuditLogEntry {
    id: string
    documentId: string
    action: "granted" | "revoked" | "modified" | "shared" | "accessed"
    entityType: "user" | "role" | "group" | "link"
    entityId: string
    entityName: string
    performedBy: string
    performedByName: string
    timestamp: Date
    details: Record<string, any>
    ipAddress?: string
    userAgent?: string
  }
  
  export interface InheritanceChain {
    level: number
    type: "folder" | "workspace" | "organization"
    id: string
    name: string
    permissions: Permission[]
  }
  