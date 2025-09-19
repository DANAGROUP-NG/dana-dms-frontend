export const APP_NAME = "Document Management System"
export const APP_VERSION = "1.0.0"

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  DASHBOARD: "/dashboard",
  DOCUMENTS: "/documents",
  FOLDERS: "/folders",
  ASSIGNMENTS: "/assignments",
  PROFILE: "/profile",
  SETTINGS: "/settings",
} as const

export const PERMISSIONS = {
  READ: "read",
  WRITE: "write",
  DELETE: "delete",
  ADMIN: "admin",
  MANAGE_USERS: "manage_users",
  MANAGE_WORKFLOWS: "manage_workflows",
  MANAGE_DOCUMENTS: "manage_documents",
} as const

export const USER_ROLES = {
  ADMIN: "admin",
  MANAGER: "manager",
  USER: "user",
} as const

export const TENANT_TYPES = {
  GROUP: "group",
  SUBSIDIARY: "subsidiary",
  LOCATION: "location",
  DEPARTMENT: "department",
} as const

export const DOCUMENT_STATUSES = {
  DRAFT: "draft",
  REVIEW: "review",
  APPROVED: "approved",
  ARCHIVED: "archived",
} as const

export const ASSIGNMENT_STATUSES = {
  PENDING: "pending",
  IN_PROGRESS: "in-progress",
  COMPLETED: "completed",
  OVERDUE: "overdue",
} as const

export const PRIORITY_LEVELS = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
} as const

export const FILE_TYPES = {
  PDF: "pdf",
  DOCX: "docx",
  XLSX: "xlsx",
  PPTX: "pptx",
  TXT: "txt",
  IMAGE: "image",
} as const

export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
export const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  "image/jpeg",
  "image/png",
  "image/gif",
]

export const STORAGE_KEYS = {
  AUTH_TOKEN: "dms_auth_token",
  USER_PREFERENCES: "dms_user_preferences",
  THEME: "dms_theme",
  SIDEBAR_STATE: "dms_sidebar_state",
} as const
