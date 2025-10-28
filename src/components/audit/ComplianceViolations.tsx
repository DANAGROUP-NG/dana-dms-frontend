"use client"

import { AlertTriangle, Shield, FileText, Lock, CheckCircle2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { format } from "date-fns"
import { cn } from "../../lib/utils"
import type { ComplianceViolation } from "../../types/audit"

interface ComplianceViolationsProps {
  violations: ComplianceViolation[]
  onResolve?: (id: string) => void
  onAssign?: (id: string, userId: string) => void
}

const violationIcons = {
  RETENTION_POLICY: FileText,
  LEGAL_HOLD: Lock,
  ACCESS_CONTROL: Shield,
  DATA_BREACH: AlertTriangle,
}

function getSeverityColor(severity: string) {
  switch (severity) {
    case "CRITICAL":
      return "bg-red-500/10 text-red-600 border-red-500/20"
    case "HIGH":
      return "bg-orange-500/10 text-orange-600 border-orange-500/20"
    case "MEDIUM":
      return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
    case "LOW":
      return "bg-blue-500/10 text-blue-600 border-blue-500/20"
    default:
      return "bg-gray-500/10 text-gray-600 border-gray-500/20"
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case "RESOLVED":
      return "bg-green-500/10 text-green-600 border-green-500/20"
    case "INVESTIGATING":
      return "bg-blue-500/10 text-blue-600 border-blue-500/20"
    case "OPEN":
      return "bg-gray-500/10 text-gray-600 border-gray-500/20"
    default:
      return "bg-gray-500/10 text-gray-600 border-gray-500/20"
  }
}

export function ComplianceViolations({ violations, onResolve, onAssign }: ComplianceViolationsProps) {
  const openViolations = violations.filter((v) => v.status !== "RESOLVED")
  const resolvedViolations = violations.filter((v) => v.status === "RESOLVED")

  const typeCounts = violations.reduce(
    (acc, v) => {
      acc[v.type] = (acc[v.type] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  const severityCounts = violations.reduce(
    (acc, v) => {
      acc[v.severity] = (acc[v.severity] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Violations</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{violations.length}</div>
            <p className="text-xs text-muted-foreground">{openViolations.length} open</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resolvedViolations.length}</div>
            <p className="text-xs text-muted-foreground">
              {violations.length > 0 
                ? `${((resolvedViolations.length / violations.length) * 100).toFixed(1)}%`
                : "0%"
              }
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Severity</CardTitle>
            <Shield className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{severityCounts.CRITICAL || 0}</div>
            <p className="text-xs text-muted-foreground">High priority items</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Types</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(typeCounts).length}</div>
            <p className="text-xs text-muted-foreground">Different violation types</p>
          </CardContent>
        </Card>
      </div>

      {/* Violations List */}
      <Card>
        <CardHeader>
          <CardTitle>Violations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {violations.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No compliance violations found
              </div>
            ) : (
              violations.map((violation) => {
                const Icon = violationIcons[violation.type]
                return (
                  <div
                    key={violation.id}
                    className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-shrink-0 mt-1">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="font-medium">{violation.description}</p>
                          {violation.documentName && (
                            <p className="text-sm text-muted-foreground">
                              Document: {violation.documentName}
                            </p>
                          )}
                        </div>
                        <Badge className={cn("text-xs border", getSeverityColor(violation.severity))}>
                          {violation.severity}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{violation.type.replace("_", " ")}</span>
                        <span>•</span>
                        <span>Detected: {format(new Date(violation.detectedAt), "MMM d, yyyy")}</span>
                        {violation.resolvedAt && (
                          <>
                            <span>•</span>
                            <span>Resolved: {format(new Date(violation.resolvedAt), "MMM d, yyyy")}</span>
                          </>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={cn("text-xs", getStatusColor(violation.status))}>
                          {violation.status}
                        </Badge>
                        {violation.assignedTo && (
                          <Badge variant="outline" className="text-xs">
                            Assigned: {violation.assignedTo}
                          </Badge>
                        )}
                      </div>

                      {violation.status !== "RESOLVED" && (
                        <div className="flex items-center gap-2 pt-2">
                          <Button size="sm" variant="outline" onClick={() => onResolve?.(violation.id)}>
                            Mark as Resolved
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => onAssign?.(violation.id, "current-user")}>
                            Assign to Me
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

