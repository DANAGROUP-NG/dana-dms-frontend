export interface DocumentVersion {
    id: string
    version: number
    name: string
    size: string
    sizeBytes: number
    uploadDate: string
    uploadedBy: string
    uploadedById: string
    notes?: string
    downloadUrl: string
    isCurrentVersion: boolean
    changes?: string[]
    hash?: string
  }
  
  export interface DocumentActivity {
    id: string
    type: "view" | "edit" | "share" | "comment" | "upload" | "download" | "approve" | "reject"
    description: string
    user: string
    userId: string
    userAvatar?: string
    timestamp: string
    metadata?: Record<string, any>
  }
  
  export interface DocumentPermission {
    userId: string
    userName: string
    userEmail: string
    userAvatar?: string
    role: "owner" | "editor" | "viewer" | "commenter"
    permissions: {
      canRead: boolean
      canWrite: boolean
      canDelete: boolean
      canShare: boolean
      canComment: boolean
    }
    inheritedFrom?: string
    grantedBy: string
    grantedDate: string
  }
  
  export interface WorkflowStep {
    id: string
    name: string
    status: "pending" | "in-progress" | "completed" | "rejected"
    assignee?: string
    assigneeId?: string
    dueDate?: string
    completedDate?: string
    notes?: string
    order: number
  }
  
  export interface DocumentWorkflow {
    id: string
    name: string
    status: "draft" | "in-review" | "approved" | "rejected" | "archived"
    currentStep?: string
    steps: WorkflowStep[]
    createdDate: string
    completedDate?: string
  }
  
  export interface RelatedDocument {
    id: string
    name: string
    type: string
    relationship: "referenced" | "similar" | "version" | "template"
    score?: number
    thumbnail?: string
  }
  
  export interface DocumentDetail {
    id: string
    name: string
    description?: string
    size: string
    sizeBytes: number
    type: string
    mimeType: string
    created: string
    modified: string
    author: string
    authorId: string
    folderId?: string
    folderPath?: string[]
    tags: string[]
    status: "draft" | "review" | "approved" | "archived"
    currentVersion: number
    thumbnail?: string
    previewUrl?: string
    downloadUrl: string
    permissions: {
      canRead: boolean
      canWrite: boolean
      canDelete: boolean
      canShare: boolean
      canComment: boolean
    }
    versions: DocumentVersion[]
    activities: DocumentActivity[]
    documentPermissions: DocumentPermission[]
    workflow?: DocumentWorkflow
    relatedDocuments: RelatedDocument[]
    metadata: Record<string, any>
  }
  