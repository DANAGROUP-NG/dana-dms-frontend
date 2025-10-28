export type AuditActorType = 'USER' | 'SYSTEM' | 'INTEGRATION'
export type AuditTargetType = 'DOCUMENT' | 'FOLDER' | 'USER' | 'WORKFLOW' | 'PERMISSION' | 'TENANT'
export type AuditActionType = 
  | 'document.create'
  | 'document.read'
  | 'document.update'
  | 'document.delete'
  | 'document.download'
  | 'document.share'
  | 'document.move'
  | 'document.archive'
  | 'document.restore'
  | 'folder.create'
  | 'folder.update'
  | 'folder.delete'
  | 'folder.move'
  | 'permission.grant'
  | 'permission.revoke'
  | 'permission.update'
  | 'workflow.create'
  | 'workflow.start'
  | 'workflow.approve'
  | 'workflow.reject'
  | 'workflow.complete'
  | 'user.login'
  | 'user.logout'
  | 'user.password_change'
  | 'user.role_change'
  | 'tenant.create'
  | 'tenant.update'
  | 'tenant.delete'
  | 'system.config_change'
  | 'compliance.legal_hold'
  | 'compliance.retention_change'
export type AuditResult = 'SUCCESS' | 'FAILURE' | 'UNAUTHORIZED' | 'ERROR'

export interface AuditEventMetadata {
  ipAddress?: string
  userAgent?: string
  previousValues?: Record<string, any>
  newValues?: Record<string, any>
  reason?: string
  documentName?: string
  folderPath?: string
  permissionType?: string
  workflowStatus?: string
  roleChanges?: Record<string, string>
  additionalInfo?: Record<string, any>
  targetName?: string
}

export interface AuditEvent {
  id: string
  tenantPath: string[]
  timestamp: string
  actorId: string
  actorName: string
  actorType: AuditActorType
  action: AuditActionType
  targetType: AuditTargetType
  targetId?: string
  targetName?: string
  result: AuditResult
  metadata: AuditEventMetadata
  hashChain?: string
  previousHash?: string
  digitalSignature?: string
  duration?: number // in milliseconds
}

export interface AuditFilters {
  startDate?: string
  endDate?: string
  actorId?: string
  actorType?: AuditActorType
  action?: AuditActionType
  targetType?: AuditTargetType
  targetId?: string
  result?: AuditResult
  search?: string
}

export interface AuditSummary {
  totalEvents: number
  successEvents: number
  failureEvents: number
  unauthorizedEvents: number
  errorEvents: number
  eventsByAction: Record<string, number>
  eventsByTarget: Record<string, number>
  eventsByActor: Record<string, number>
  averageDuration?: number
  peakHour: string
  mostActiveUser: string
}

export interface AuditReport {
  id: string
  name: string
  description: string
  reportType: 'FULL' | 'SUMMARY' | 'CUSTOM' | 'COMPLIANCE'
  format: 'JSON' | 'CSV' | 'PDF' | 'EXCEL'
  filters: AuditFilters
  generatedAt: string
  generatedBy: string
  fileUrl?: string
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
  recordCount?: number
}

export interface AuditChartData {
  date: string
  success: number
  failure: number
  unauthorized: number
  error: number
}

export interface AuditTimelineData {
  date: string
  events: AuditEvent[]
}

export interface ComplianceViolation {
  id: string
  type: 'RETENTION_POLICY' | 'LEGAL_HOLD' | 'ACCESS_CONTROL' | 'DATA_BREACH'
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  description: string
  documentId?: string
  documentName?: string
  detectedAt: string
  resolvedAt?: string
  status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED'
  assignedTo?: string
}

