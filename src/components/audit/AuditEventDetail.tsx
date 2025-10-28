"use client"

import { format } from "date-fns"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog"
import { Badge } from "../ui/badge"
import { Separator } from "../ui/separator"
import {
  FileText,
  User,
  Shield,
  Clock,
  Globe,
  Code,
  ChevronRight,
} from "lucide-react"
import { cn } from "../../lib/utils"
import type { AuditEvent } from "../../types/audit"

interface AuditEventDetailProps {
  event: AuditEvent | null
  isOpen: boolean
  onClose: () => void
}

function getResultColor(result: string) {
  switch (result) {
    case "SUCCESS":
      return "bg-green-500/10 text-green-600 border-green-500/20"
    case "FAILURE":
      return "bg-red-500/10 text-red-600 border-red-500/20"
    case "UNAUTHORIZED":
      return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
    case "ERROR":
      return "bg-orange-500/10 text-orange-600 border-orange-500/20"
    default:
      return "bg-gray-500/10 text-gray-600 border-gray-500/20"
  }
}

function getActionIcon(action: string) {
  const icons: Record<string, React.ComponentType<{ className?: string }>> = {
    document: FileText,
    permission: Shield,
    workflow: Clock,
    user: User,
    folder: FileText,
    system: Code,
  }
  
  const type = action.split(".")[0]
  return icons[type] || FileText
}

export function AuditEventDetail({ event, isOpen, onClose }: AuditEventDetailProps) {
  if (!event) return null

  const Icon = getActionIcon(event.action)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            Audit Event Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Event Header */}
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold">{event.action.replace(".", " ")}</h3>
                <p className="text-sm text-muted-foreground">{format(new Date(event.timestamp), "PPpp")}</p>
              </div>
              <Badge className={cn("text-xs border", getResultColor(event.result))}>
                {event.result}
              </Badge>
            </div>

            <Separator />

            {/* Event Metadata */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Event ID</p>
                <p className="text-sm font-mono">{event.id}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Duration</p>
                <p className="text-sm">{event.duration ? `${event.duration}ms` : "N/A"}</p>
              </div>
            </div>
          </div>

          {/* Actor Information */}
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <User className="h-4 w-4" />
              Actor Information
            </h4>
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Name</p>
                <p className="text-sm font-medium">{event.actorName}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Type</p>
                <Badge variant="outline">{event.actorType}</Badge>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Actor ID</p>
                <p className="text-sm font-mono">{event.actorId}</p>
              </div>
            </div>
          </div>

          {/* Target Information */}
          {event.targetName && (
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Target Information
              </h4>
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Name</p>
                  <p className="text-sm font-medium">{event.targetName}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Type</p>
                  <Badge variant="outline">{event.targetType}</Badge>
                </div>
                {event.targetId && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Target ID</p>
                    <p className="text-sm font-mono">{event.targetId}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tenant Path */}
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Tenant Path
            </h4>
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
              {event.tenantPath.map((segment, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {segment}
                  </Badge>
                  {index < event.tenantPath.length - 1 && (
                    <ChevronRight className="h-3 w-3 text-muted-foreground" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Additional Metadata */}
          {Object.keys(event.metadata).length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Code className="h-4 w-4" />
                Additional Metadata
              </h4>
              <div className="space-y-2">
                {event.metadata.ipAddress && (
                  <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                    <span className="text-sm font-medium">IP Address</span>
                    <span className="text-sm font-mono">{event.metadata.ipAddress}</span>
                  </div>
                )}
                {event.metadata.userAgent && (
                  <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                    <span className="text-sm font-medium">User Agent</span>
                    <span className="text-sm font-mono">{event.metadata.userAgent}</span>
                  </div>
                )}
                {event.metadata.reason && (
                  <div className="flex items-start justify-between p-2 bg-muted/50 rounded">
                    <span className="text-sm font-medium">Reason</span>
                    <span className="text-sm text-right">{event.metadata.reason}</span>
                  </div>
                )}
                {event.metadata.previousValues && (
                  <div className="p-2 bg-muted/50 rounded">
                    <p className="text-sm font-medium mb-1">Previous Values</p>
                    <pre className="text-xs bg-background p-2 rounded overflow-x-auto">
                      {JSON.stringify(event.metadata.previousValues, null, 2)}
                    </pre>
                  </div>
                )}
                {event.metadata.newValues && (
                  <div className="p-2 bg-muted/50 rounded">
                    <p className="text-sm font-medium mb-1">New Values</p>
                    <pre className="text-xs bg-background p-2 rounded overflow-x-auto">
                      {JSON.stringify(event.metadata.newValues, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Hash Chain */}
          {(event.hashChain || event.previousHash || event.digitalSignature) && (
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Security Information
              </h4>
              <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
                {event.hashChain && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Hash Chain</p>
                    <p className="text-xs font-mono break-all">{event.hashChain}</p>
                  </div>
                )}
                {event.previousHash && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Previous Hash</p>
                    <p className="text-xs font-mono break-all">{event.previousHash}</p>
                  </div>
                )}
                {event.digitalSignature && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Digital Signature</p>
                    <p className="text-xs font-mono break-all">{event.digitalSignature}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

