export interface WorkflowStep {
    id: string
    name: string
    type: "approval" | "review" | "notification" | "condition"
    description?: string
    assigneeType: "user" | "role" | "group"
    assigneeId: string
    assigneeName: string
    dueDate?: string
    dueDays?: number
    escalationDays?: number
    escalationTo?: string
    status: "pending" | "in-progress" | "completed" | "rejected" | "skipped"
    order: number
    position: { x: number; y: number }
    conditions?: {
      field: string
      operator: "equals" | "not_equals" | "contains" | "greater_than" | "less_than"
      value: string
    }[]
    parallelWith?: string[]
    completedDate?: string
    completedBy?: string
    notes?: string
  }
  
  export interface WorkflowTemplate {
    id: string
    name: string
    description: string
    category: "approval" | "review" | "legal" | "compliance" | "custom"
    steps: Omit<WorkflowStep, "id" | "status" | "completedDate" | "completedBy">[]
    isDefault: boolean
    createdBy: string
    createdDate: string
    usageCount: number
  }
  
  export interface WorkflowInstance {
    id: string
    templateId?: string
    documentId: string
    name: string
    status: "draft" | "active" | "completed" | "cancelled" | "paused"
    steps: WorkflowStep[]
    currentStepId?: string
    startDate: string
    completedDate?: string
    createdBy: string
    assignedUsers: string[]
    priority: "low" | "normal" | "high" | "urgent"
    metadata: Record<string, any>
  }
  
  export interface Assignment {
    id: string
    documentId: string
    documentName: string
    workflowId?: string
    workflowStepId?: string
    title: string
    description: string
    assigneeId: string
    assigneeName: string
    assigneeEmail: string
    assigneeAvatar?: string
    assignedBy: string
    assignedDate: string
    dueDate?: string
    priority: "low" | "normal" | "high" | "urgent"
    status: "pending" | "in-progress" | "completed" | "overdue" | "cancelled"
    type: "review" | "approval" | "edit" | "comment" | "custom"
    completedDate?: string
    completedBy?: string
    notes?: string
    attachments?: string[]
    tags: string[]
  }
  
  export interface Comment {
    id: string
    documentId: string
    workflowId?: string
    assignmentId?: string
    parentId?: string
    content: string
    authorId: string
    authorName: string
    authorAvatar?: string
    createdDate: string
    editedDate?: string
    mentions: string[]
    attachments?: string[]
    reactions: {
      emoji: string
      users: string[]
    }[]
    isResolved: boolean
    resolvedBy?: string
    resolvedDate?: string
  }
  
  export interface Notification {
    id: string
    type: "assignment" | "approval" | "comment" | "mention" | "deadline" | "escalation"
    title: string
    message: string
    recipientId: string
    senderId?: string
    documentId?: string
    workflowId?: string
    assignmentId?: string
    isRead: boolean
    createdDate: string
    actionUrl?: string
    metadata: Record<string, any>
  }
  