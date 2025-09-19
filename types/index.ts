// Core API types
export interface ApiResponse<T = any> {
    data: T;
    message?: string;
    success: boolean;
  }
  
  export interface PaginatedResponse<T = any> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }
  
  export interface ApiError {
    message: string;
    statusCode: number;
    error?: string;
    details?: any;
  }
  
  // User and Auth types
  export interface User {
    id: string;
    email: string;
    fullName: string;
    phone?: string;
    isActive: boolean;
    memberships: Membership[];
    createdAt: string;
    updatedAt: string;
  }
  
  export interface Membership {
    id: string;
    userId: string;
    orgUnitId: string;
    roleIds: string[];
    primary: boolean;
    createdAt: string;
  }
  
  export interface AuthState {
    user: User | null;
    token: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    currentTenant: OrgUnit | null;
  }
  
  // Organization types
  export interface OrgUnit {
    id: string;
    name: string;
    type: 'GROUP' | 'SUBSIDIARY' | 'LOCATION' | 'DEPARTMENT';
    parentId?: string;
    tenantPath: string[];
    createdAt: string;
    updatedAt: string;
  }
  
  // Document types
  export interface Document {
    id: string;
    title: string;
    orgUnitId: string;
    folderId?: string;
    tenantPath: string[];
    status: 'ACTIVE' | 'ARCHIVED' | 'DELETED';
    mimeType: string;
    sizeBytes: number;
    tags: string[];
    currentVersionId?: string;
    createdById: string;
    updatedById?: string;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface DocumentVersion {
    id: string;
    documentId: string;
    versionNo: number;
    cloudPublicId: string;
    cloudVersion?: string;
    fileExt?: string;
    bytes: number;
    hashSha256: string;
    uploadedById: string;
    notes?: string;
    createdAt: string;
  }
  
  export interface Folder {
    id: string;
    name: string;
    orgUnitId: string;
    parentId?: string;
    tenantPath: string[];
    tags: string[];
    createdById: string;
    createdAt: string;
    updatedAt: string;
  }
  
  // Permission types
  export interface Permission {
    id: string;
    resourceType: 'folder' | 'document';
    resourceId: string;
    subjectType: 'user' | 'role';
    subjectId: string;
    allow: boolean;
    actions: PermissionAction[];
    createdAt: string;
  }
  
  export type PermissionAction = 
    | 'VIEW' 
    | 'EDIT' 
    | 'MOVE' 
    | 'SHARE' 
    | 'ASSIGN' 
    | 'APPROVE' 
    | 'DELETE' 
    | 'MANAGE_PERMS';
  
  // UI State types
  export interface UIState {
    theme: 'light' | 'dark';
    sidebarCollapsed: boolean;
    currentView: 'grid' | 'list';
    loading: Record<string, boolean>;
    errors: Record<string, string | null>;
  }