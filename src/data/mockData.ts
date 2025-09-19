import type { Tenant, User } from "../store/slices/authSlice"

export const mockUsers: User[] = [
  {
    id: "1",
    email: "admin@example.com",
    firstName: "John",
    lastName: "Doe",
    avatar: "/professional-male-avatar.png",
    tenantMemberships: [
      {
        tenantId: "1",
        role: "admin",
        permissions: ["read", "write", "delete", "admin", "manage_users", "manage_workflows"],
      },
      {
        tenantId: "4",
        role: "manager",
        permissions: ["read", "write", "manage_documents"],
      },
    ],
  },
  {
    id: "2",
    email: "manager@example.com",
    firstName: "Sarah",
    lastName: "Johnson",
    avatar: "/professional-female-avatar.png",
    tenantMemberships: [
      {
        tenantId: "2",
        role: "manager",
        permissions: ["read", "write", "manage_documents"],
      },
    ],
  },
  {
    id: "3",
    email: "user@example.com",
    firstName: "Mike",
    lastName: "Chen",
    avatar: "/professional-asian-male-avatar.jpg",
    tenantMemberships: [
      {
        tenantId: "3",
        role: "user",
        permissions: ["read", "write"],
      },
    ],
  },
]

export const mockTenantHierarchy: Tenant[] = [
  {
    id: "1",
    name: "Global Corp",
    type: "group",
    children: [
      {
        id: "2",
        name: "North America",
        type: "subsidiary",
        parentId: "1",
        children: [
          {
            id: "3",
            name: "New York Office",
            type: "location",
            parentId: "2",
            children: [
              {
                id: "4",
                name: "Engineering",
                type: "department",
                parentId: "3",
              },
              {
                id: "5",
                name: "Marketing",
                type: "department",
                parentId: "3",
              },
              {
                id: "6",
                name: "Human Resources",
                type: "department",
                parentId: "3",
              },
            ],
          },
          {
            id: "7",
            name: "Los Angeles Office",
            type: "location",
            parentId: "2",
            children: [
              {
                id: "8",
                name: "Sales",
                type: "department",
                parentId: "7",
              },
              {
                id: "9",
                name: "Support",
                type: "department",
                parentId: "7",
              },
            ],
          },
        ],
      },
      {
        id: "10",
        name: "Europe",
        type: "subsidiary",
        parentId: "1",
        children: [
          {
            id: "11",
            name: "London Office",
            type: "location",
            parentId: "10",
            children: [
              {
                id: "12",
                name: "Finance",
                type: "department",
                parentId: "11",
              },
              {
                id: "13",
                name: "Legal",
                type: "department",
                parentId: "11",
              },
            ],
          },
        ],
      },
    ],
  },
]

export interface Document {
  id: string
  name: string
  size: string
  sizeBytes: number
  modified: string
  created: string
  type: string
  mimeType: string
  author: string
  authorId: string
  folderId?: string
  tags: string[]
  status: "draft" | "review" | "approved" | "archived"
  version: number
  description?: string
  thumbnail?: string
  downloadUrl?: string
  previewUrl?: string
  permissions: {
    canRead: boolean
    canWrite: boolean
    canDelete: boolean
    canShare: boolean
  }
}

export const mockDocuments: Document[] = [
  {
    id: "1",
    name: "Q4 Financial Report.pdf",
    size: "2.4 MB",
    sizeBytes: 2516582,
    modified: "2024-01-15T10:30:00Z",
    created: "2024-01-10T09:15:00Z",
    type: "pdf",
    mimeType: "application/pdf",
    author: "Sarah Johnson",
    authorId: "2",
    folderId: "1",
    tags: ["financial", "quarterly", "report"],
    status: "approved",
    version: 3,
    description: "Comprehensive financial analysis for Q4 2023",
    thumbnail: "/placeholder-d6aag.png",
    permissions: {
      canRead: true,
      canWrite: false,
      canDelete: false,
      canShare: true,
    },
  },
  {
    id: "2",
    name: "Project Proposal - AI Integration.docx",
    size: "1.8 MB",
    sizeBytes: 1887437,
    modified: "2024-01-14T14:22:00Z",
    created: "2024-01-12T11:00:00Z",
    type: "docx",
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    author: "Mike Chen",
    authorId: "3",
    folderId: "4",
    tags: ["project", "proposal", "ai", "integration"],
    status: "review",
    version: 2,
    description: "Proposal for implementing AI features in our platform",
    thumbnail: "/document-proposal.jpg",
    permissions: {
      canRead: true,
      canWrite: true,
      canDelete: true,
      canShare: true,
    },
  },
  {
    id: "3",
    name: "Marketing Strategy 2024.pptx",
    size: "5.2 MB",
    sizeBytes: 5452595,
    modified: "2024-01-13T16:45:00Z",
    created: "2024-01-08T13:30:00Z",
    type: "pptx",
    mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    author: "Emily Davis",
    authorId: "4",
    folderId: "2",
    tags: ["marketing", "strategy", "2024", "presentation"],
    status: "draft",
    version: 1,
    description: "Annual marketing strategy and campaign planning",
    thumbnail: "/marketing-presentation.jpg",
    permissions: {
      canRead: true,
      canWrite: true,
      canDelete: true,
      canShare: false,
    },
  },
  {
    id: "4",
    name: "Budget Analysis Spreadsheet.xlsx",
    size: "892 KB",
    sizeBytes: 913408,
    modified: "2024-01-12T09:18:00Z",
    created: "2023-12-20T10:00:00Z",
    type: "xlsx",
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    author: "John Smith",
    authorId: "1",
    folderId: "1",
    tags: ["budget", "analysis", "financial", "spreadsheet"],
    status: "approved",
    version: 4,
    description: "Detailed budget breakdown and variance analysis",
    thumbnail: "/excel-spreadsheet.png",
    permissions: {
      canRead: true,
      canWrite: false,
      canDelete: false,
      canShare: true,
    },
  },
  {
    id: "5",
    name: "Employee Handbook 2024.pdf",
    size: "3.1 MB",
    sizeBytes: 3251200,
    modified: "2024-01-11T12:00:00Z",
    created: "2023-12-20T10:00:00Z",
    type: "pdf",
    mimeType: "application/pdf",
    author: "HR Department",
    authorId: "hr-dept",
    folderId: "3",
    tags: ["hr", "handbook", "policies", "2024"],
    status: "approved",
    version: 2,
    description: "Updated employee handbook with new policies",
    thumbnail: "/placeholder-mvxt5.png",
    permissions: {
      canRead: true,
      canWrite: false,
      canDelete: false,
      canShare: true,
    },
  },
  {
    id: "6",
    name: "Product Roadmap Q1-Q2.pdf",
    size: "1.5 MB",
    sizeBytes: 1572864,
    modified: "2024-01-10T15:30:00Z",
    created: "2024-01-08T14:00:00Z",
    type: "pdf",
    mimeType: "application/pdf",
    author: "Product Team",
    authorId: "product-team",
    folderId: "4",
    tags: ["product", "roadmap", "planning"],
    status: "approved",
    version: 1,
    description: "Product development roadmap for first half of 2024",
    thumbnail: "/product-roadmap-visual.png",
    permissions: {
      canRead: true,
      canWrite: false,
      canDelete: false,
      canShare: true,
    },
  },
  {
    id: "7",
    name: "Client Meeting Notes - Acme Corp.docx",
    size: "245 KB",
    sizeBytes: 250880,
    modified: "2024-01-09T11:15:00Z",
    created: "2024-01-09T10:30:00Z",
    type: "docx",
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    author: "Sales Team",
    authorId: "sales-team",
    folderId: "5",
    tags: ["meeting", "client", "acme", "notes"],
    status: "draft",
    version: 1,
    description: "Meeting notes from client discovery session",
    thumbnail: "/meeting-notes.png",
    permissions: {
      canRead: true,
      canWrite: true,
      canDelete: true,
      canShare: false,
    },
  },
  {
    id: "8",
    name: "Security Audit Report.pdf",
    size: "4.2 MB",
    sizeBytes: 4404019,
    modified: "2024-01-08T13:45:00Z",
    created: "2023-12-28T11:00:00Z",
    type: "pdf",
    mimeType: "application/pdf",
    author: "Security Team",
    authorId: "security-team",
    folderId: "6",
    tags: ["security", "audit", "compliance"],
    status: "approved",
    version: 1,
    description: "Annual security audit findings and recommendations",
    thumbnail: "/placeholder-n8yni.png",
    permissions: {
      canRead: true,
      canWrite: false,
      canDelete: false,
      canShare: false,
    },
  },
  {
    id: "9",
    name: "Training Materials - New Hires.pptx",
    size: "8.7 MB",
    sizeBytes: 9126805,
    modified: "2024-01-07T16:20:00Z",
    created: "2023-12-15T14:00:00Z",
    type: "pptx",
    mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    author: "HR Department",
    authorId: "hr-dept",
    folderId: "3",
    tags: ["training", "onboarding", "hr"],
    status: "approved",
    version: 3,
    description: "Comprehensive training presentation for new employees",
    thumbnail: "/placeholder-0b1np.png",
    permissions: {
      canRead: true,
      canWrite: true,
      canDelete: false,
      canShare: true,
    },
  },
  {
    id: "10",
    name: "API Documentation v2.1.pdf",
    size: "2.8 MB",
    sizeBytes: 2936012,
    modified: "2024-01-06T10:00:00Z",
    created: "2024-01-03T15:30:00Z",
    type: "pdf",
    mimeType: "application/pdf",
    author: "Engineering Team",
    authorId: "eng-team",
    folderId: "7",
    tags: ["api", "documentation", "technical"],
    status: "approved",
    version: 2,
    description: "Complete API reference documentation",
    thumbnail: "/api-documentation-concept.png",
    permissions: {
      canRead: true,
      canWrite: false,
      canDelete: false,
      canShare: true,
    },
  },
  {
    id: "11",
    name: "Brand Guidelines 2024.pdf",
    size: "12.3 MB",
    sizeBytes: 12902400,
    modified: "2024-01-05T14:30:00Z",
    created: "2023-12-28T11:00:00Z",
    type: "pdf",
    mimeType: "application/pdf",
    author: "Design Team",
    authorId: "design-team",
    folderId: "2",
    tags: ["brand", "guidelines", "design"],
    status: "approved",
    version: 1,
    description: "Updated brand guidelines and visual identity standards",
    thumbnail: "/brand-guidelines-concept.png",
    permissions: {
      canRead: true,
      canWrite: false,
      canDelete: false,
      canShare: true,
    },
  },
  {
    id: "12",
    name: "Competitive Analysis.xlsx",
    size: "1.2 MB",
    sizeBytes: 1258291,
    modified: "2024-01-04T09:45:00Z",
    created: "2023-12-30T13:15:00Z",
    type: "xlsx",
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    author: "Strategy Team",
    authorId: "strategy-team",
    folderId: "8",
    tags: ["competitive", "analysis", "market"],
    status: "review",
    version: 2,
    description: "Market analysis and competitor comparison",
    thumbnail: "/competitive-analysis.png",
    permissions: {
      canRead: true,
      canWrite: true,
      canDelete: true,
      canShare: false,
    },
  },
  // Continue with more documents...
]

export interface FolderPermissionsMeta {
  isPublic: boolean
  allowSharing: boolean
  restrictedAccess: boolean
  sharedWithCount?: number
}

export interface FolderOwnerMeta {
  id: string
  name: string
}

export interface Folder {
  id: string
  name: string
  documentCount: number
  modified: string
  created?: string
  color: string
  owner?: FolderOwnerMeta
  permissions?: FolderPermissionsMeta
  parentId?: string
  children?: Folder[]
}

export const mockFolders: Folder[] = [
  {
    id: "1",
    name: "Financial Reports",
    documentCount: 24,
    modified: "2024-01-15",
    created: "2023-01-05",
    color: "blue",
    owner: { id: "1", name: "John Doe" },
    permissions: { isPublic: false, allowSharing: true, restrictedAccess: true, sharedWithCount: 5 },
    children: [
      {
        id: "1-1",
        name: "2023",
        documentCount: 12,
        modified: "2024-01-10",
        created: "2023-01-10",
        color: "blue",
        parentId: "1",
        permissions: { isPublic: false, allowSharing: true, restrictedAccess: true },
        children: [
          {
            id: "1-1-1",
            name: "Q1",
            documentCount: 3,
            modified: "2023-04-01",
            created: "2023-02-01",
            color: "blue",
            parentId: "1-1",
          },
          {
            id: "1-1-2",
            name: "Q2",
            documentCount: 3,
            modified: "2023-07-01",
            created: "2023-05-01",
            color: "blue",
            parentId: "1-1",
          },
          {
            id: "1-1-3",
            name: "Q3",
            documentCount: 3,
            modified: "2023-10-01",
            created: "2023-08-01",
            color: "blue",
            parentId: "1-1",
          },
          {
            id: "1-1-4",
            name: "Q4",
            documentCount: 3,
            modified: "2024-01-01",
            created: "2023-11-01",
            color: "blue",
            parentId: "1-1",
          },
        ],
      },
    ],
  },
  {
    id: "2",
    name: "Marketing Materials",
    documentCount: 18,
    modified: "2024-01-14",
    created: "2022-11-20",
    color: "green",
    owner: { id: "4", name: "Emily Davis" },
    permissions: { isPublic: true, allowSharing: true, restrictedAccess: false, sharedWithCount: 20 },
    children: [
      {
        id: "2-1",
        name: "Campaigns",
        documentCount: 10,
        modified: "2024-01-12",
        created: "2023-03-01",
        color: "green",
        parentId: "2",
        children: [
          {
            id: "2-1-1",
            name: "Spring Launch",
            documentCount: 5,
            modified: "2023-04-15",
            created: "2023-02-15",
            color: "green",
            parentId: "2-1",
          },
          {
            id: "2-1-2",
            name: "Autumn Promo",
            documentCount: 5,
            modified: "2023-10-20",
            created: "2023-08-20",
            color: "green",
            parentId: "2-1",
          },
        ],
      },
    ],
  },
  {
    id: "3",
    name: "HR Documents",
    documentCount: 32,
    modified: "2024-01-13",
    created: "2022-01-10",
    color: "purple",
    owner: { id: "hr-dept", name: "HR Department" },
    permissions: { isPublic: false, allowSharing: false, restrictedAccess: true, sharedWithCount: 0 },
    children: [
      {
        id: "3-1",
        name: "Policies",
        documentCount: 16,
        modified: "2024-01-13",
        created: "2022-01-15",
        color: "purple",
        parentId: "3",
        children: [
          {
            id: "3-1-1",
            name: "Security",
            documentCount: 6,
            modified: "2023-12-01",
            created: "2022-02-01",
            color: "purple",
            parentId: "3-1",
          },
        ],
      },
    ],
  },
  {
    id: "4",
    name: "Project Files",
    documentCount: 45,
    modified: "2024-01-12",
    created: "2021-09-01",
    color: "orange",
    owner: { id: "1", name: "John Doe" },
    permissions: { isPublic: true, allowSharing: true, restrictedAccess: false, sharedWithCount: 12 },
    children: [
      {
        id: "5",
        name: "Active Projects",
        documentCount: 28,
        modified: "2024-01-12",
        created: "2021-09-15",
        color: "orange",
        parentId: "4",
        children: [
          {
            id: "5-1",
            name: "Phoenix",
            documentCount: 10,
            modified: "2024-01-11",
            created: "2022-05-01",
            color: "orange",
            parentId: "5",
          },
        ],
      },
      {
        id: "6",
        name: "Archived Projects",
        documentCount: 17,
        modified: "2024-01-10",
        created: "2021-12-20",
        color: "gray",
        parentId: "4",
      },
    ],
  },
]

export interface Assignment {
  id: string
  title: string
  description: string
  assignee: string
  assigneeId: string
  dueDate: string
  status: "pending" | "in-progress" | "completed" | "overdue"
  priority: "low" | "medium" | "high"
  documentId?: string
  workflowId?: string
}

export const mockAssignments: Assignment[] = [
  {
    id: "1",
    title: "Review Q4 Financial Report",
    description: "Please review the quarterly financial report and provide feedback on accuracy and completeness.",
    assignee: "Sarah Johnson",
    assigneeId: "2",
    dueDate: "2024-01-20",
    status: "pending",
    priority: "high",
    documentId: "1",
  },
  {
    id: "2",
    title: "Approve Marketing Campaign",
    description: "Review and approve the new marketing campaign materials for Q1 launch.",
    assignee: "Mike Chen",
    assigneeId: "3",
    dueDate: "2024-01-18",
    status: "in-progress",
    priority: "medium",
    documentId: "3",
  },
  {
    id: "3",
    title: "Update Employee Handbook",
    description: "Update the employee handbook with new remote work policies and benefits information.",
    assignee: "Emily Davis",
    assigneeId: "4",
    dueDate: "2024-01-25",
    status: "completed",
    priority: "low",
    documentId: "5",
  },
  {
    id: "4",
    title: "Budget Review Process",
    description: "Complete the annual budget review and submit recommendations for next fiscal year.",
    assignee: "John Doe",
    assigneeId: "1",
    dueDate: "2024-01-16",
    status: "overdue",
    priority: "high",
    documentId: "4",
  },
]
