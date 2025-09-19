"use client"

import { AlertTriangle, CheckCircle, Eye, EyeOff, Info, Lock, Shield, Unlock, XCircle, Zap } from "lucide-react"
import { useState } from "react"
import { cn } from "../../lib/utils"
import { Alert, AlertDescription, AlertTitle } from "../ui/alert"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"
import { Progress } from "../ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { TooltipProvider } from "../ui/tooltip"

export interface SecurityRule {
  id: string
  name: string
  description: string
  severity: "critical" | "high" | "medium" | "low"
  category: "access_control" | "data_protection" | "compliance" | "audit"
  isActive: boolean
  autoEnforce: boolean
}

export interface SecurityViolation {
  id: string
  ruleId: string
  ruleName: string
  severity: "critical" | "high" | "medium" | "low"
  description: string
  affectedUsers: string[]
  affectedResources: string[]
  detectedAt: string
  status: "active" | "resolved" | "suppressed"
  recommendation: string
  autoFixAvailable: boolean
}

export interface SecurityValidationResult {
  score: number
  maxScore: number
  violations: SecurityViolation[]
  passedChecks: number
  totalChecks: number
  recommendations: string[]
}

interface SecurityValidationProps {
  validationResult?: SecurityValidationResult
  securityRules?: SecurityRule[]
  onRunValidation?: () => Promise<SecurityValidationResult>
  onFixViolation?: (violationId: string) => Promise<void>
  onSuppressViolation?: (violationId: string, reason: string) => Promise<void>
  onToggleRule?: (ruleId: string, isActive: boolean) => Promise<void>
  className?: string
}

// Mock data for demonstration
const mockSecurityRules: SecurityRule[] = [
  {
    id: "rule-1",
    name: "Prevent Public Access to Sensitive Documents",
    description: "Documents marked as sensitive should not have public share links",
    severity: "critical",
    category: "access_control",
    isActive: true,
    autoEnforce: true,
  },
  {
    id: "rule-2",
    name: "Require Authentication for External Sharing",
    description: "All external share links must require user authentication",
    severity: "high",
    category: "access_control",
    isActive: true,
    autoEnforce: false,
  },
  {
    id: "rule-3",
    name: "Limit Share Link Expiration",
    description: "Share links should not be valid for more than 30 days",
    severity: "medium",
    category: "data_protection",
    isActive: true,
    autoEnforce: false,
  },
  {
    id: "rule-4",
    name: "Audit Permission Changes",
    description: "All permission changes must be logged for compliance",
    severity: "high",
    category: "audit",
    isActive: true,
    autoEnforce: true,
  },
]

const mockViolations: SecurityViolation[] = [
  {
    id: "violation-1",
    ruleId: "rule-1",
    ruleName: "Prevent Public Access to Sensitive Documents",
    severity: "critical",
    description: "Confidential document has a public share link without authentication",
    affectedUsers: ["john.doe@company.com"],
    affectedResources: ["Confidential Project Alpha.pdf"],
    detectedAt: "2024-01-21T10:30:00Z",
    status: "active",
    recommendation: "Remove public access or require authentication for this document",
    autoFixAvailable: true,
  },
  {
    id: "violation-2",
    ruleId: "rule-3",
    ruleName: "Limit Share Link Expiration",
    severity: "medium",
    description: "Share link has no expiration date set",
    affectedUsers: ["jane.smith@company.com"],
    affectedResources: ["Marketing Strategy 2024.docx"],
    detectedAt: "2024-01-21T09:15:00Z",
    status: "active",
    recommendation: "Set an expiration date within 30 days for this share link",
    autoFixAvailable: true,
  },
]

const mockValidationResult: SecurityValidationResult = {
  score: 75,
  maxScore: 100,
  violations: mockViolations,
  passedChecks: 8,
  totalChecks: 10,
  recommendations: [
    "Enable two-factor authentication for all admin users",
    "Review and update share link expiration policies",
    "Implement regular security audits for sensitive documents",
  ],
}

export function SecurityValidation({
  validationResult = mockValidationResult,
  securityRules = mockSecurityRules,
  onRunValidation,
  onFixViolation,
  onSuppressViolation,
  onToggleRule,
  className,
}: SecurityValidationProps) {
  const [isValidating, setIsValidating] = useState(false)
  
  const [suppressionReason, setSuppressionReason] = useState("")

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300"
      case "high":
        return "text-orange-600 bg-orange-100 dark:bg-orange-900 dark:text-orange-300"
      case "medium":
        return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300"
      case "low":
        return "text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300"
      default:
        return "text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return XCircle
      case "high":
        return AlertTriangle
      case "medium":
        return Info
      case "low":
        return CheckCircle
      default:
        return Info
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "access_control":
        return Lock
      case "data_protection":
        return Shield
      case "compliance":
        return Eye
      case "audit":
        return EyeOff
      default:
        return Shield
    }
  }

  const handleRunValidation = async () => {
    setIsValidating(true)
    try {
      await onRunValidation?.()
    } catch (error) {
      console.error("Validation failed:", error)
    } finally {
      setIsValidating(false)
    }
  }

  const handleFixViolation = async (violationId: string) => {
    try {
      await onFixViolation?.(violationId)
    } catch (error) {
      console.error("Failed to fix violation:", error)
    }
  }

  const handleSuppressViolation = async (violationId: string) => {
    if (!suppressionReason.trim()) return

    try {
      await onSuppressViolation?.(violationId, suppressionReason)
      setSuppressionReason("")
    } catch (error) {
      console.error("Failed to suppress violation:", error)
    }
  }

  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100
    if (percentage >= 90) return "text-green-600"
    if (percentage >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  const activeViolations = validationResult.violations.filter((v) => v.status === "active")
  const criticalViolations = activeViolations.filter((v) => v.severity === "critical")
  const autoFixableViolations = activeViolations.filter((v) => v.autoFixAvailable)

  return (
    <TooltipProvider>
      <div className={cn("space-y-6", className)}>
        {/* Security Score */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Validation
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Comprehensive security analysis of permission settings
                </p>
              </div>
              <Button onClick={handleRunValidation} disabled={isValidating}>
                {isValidating ? (
                  <>Validating...</>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Run Validation
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="md:col-span-2">
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-center">
                    <p
                      className={cn(
                        "text-4xl font-bold",
                        getScoreColor(validationResult.score, validationResult.maxScore),
                      )}
                    >
                      {validationResult.score}
                    </p>
                    <p className="text-sm text-muted-foreground">Security Score</p>
                  </div>
                  <div className="flex-1">
                    <Progress value={(validationResult.score / validationResult.maxScore) * 100} className="h-3" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {validationResult.passedChecks} of {validationResult.totalChecks} checks passed
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{activeViolations.length}</p>
                <p className="text-xs text-muted-foreground">Active Violations</p>
              </div>

              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">{criticalViolations.length}</p>
                <p className="text-xs text-muted-foreground">Critical Issues</p>
              </div>
            </div>

            {criticalViolations.length > 0 && (
              <Alert className="mt-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Critical Security Issues Detected</AlertTitle>
                <AlertDescription>
                  {criticalViolations.length} critical security violation{criticalViolations.length !== 1 ? "s" : ""}{" "}
                  require immediate attention.
                  {autoFixableViolations.length > 0 && (
                    <> {autoFixableViolations.length} can be automatically resolved.</>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        {autoFixableViolations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-green-600" />
                Quick Fix Available
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {autoFixableViolations.length} violation{autoFixableViolations.length !== 1 ? "s" : ""} can be
                automatically resolved
              </p>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => {
                  autoFixableViolations.forEach((violation) => {
                    handleFixViolation(violation.id)
                  })
                }}
                className="w-full"
              >
                Auto-Fix {autoFixableViolations.length} Violation{autoFixableViolations.length !== 1 ? "s" : ""}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        <Tabs defaultValue="violations">
          <TabsList>
            <TabsTrigger value="violations">Violations ({activeViolations.length})</TabsTrigger>
            <TabsTrigger value="rules">Security Rules ({securityRules.length})</TabsTrigger>
            <TabsTrigger value="recommendations">
              Recommendations ({validationResult.recommendations.length})
            </TabsTrigger>
          </TabsList>

          {/* Violations Tab */}
          <TabsContent value="violations" className="space-y-4">
            {activeViolations.length > 0 ? (
              activeViolations.map((violation) => {
                const SeverityIcon = getSeverityIcon(violation.severity)

                return (
                  <Card
                    key={violation.id}
                    className={cn(
                      "border-l-4",
                      violation.severity === "critical" && "border-l-red-500",
                      violation.severity === "high" && "border-l-orange-500",
                      violation.severity === "medium" && "border-l-yellow-500",
                      violation.severity === "low" && "border-l-blue-500",
                    )}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className={cn("p-2 rounded-full", getSeverityColor(violation.severity))}>
                          <SeverityIcon className="h-4 w-4" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-medium text-sm">{violation.ruleName}</h3>
                            <Badge variant="outline" className={cn("text-xs", getSeverityColor(violation.severity))}>
                              {violation.severity}
                            </Badge>
                            {violation.autoFixAvailable && (
                              <Badge variant="secondary" className="text-xs text-green-600">
                                Auto-fixable
                              </Badge>
                            )}
                          </div>

                          <p className="text-sm text-muted-foreground mb-3">{violation.description}</p>

                          <div className="space-y-2 mb-3">
                            <div className="flex flex-wrap gap-1">
                              <span className="text-xs text-muted-foreground">Affected users:</span>
                              {violation.affectedUsers.map((user) => (
                                <Badge key={user} variant="outline" className="text-xs">
                                  {user}
                                </Badge>
                              ))}
                            </div>
                            <div className="flex flex-wrap gap-1">
                              <span className="text-xs text-muted-foreground">Resources:</span>
                              {violation.affectedResources.map((resource) => (
                                <Badge key={resource} variant="secondary" className="text-xs">
                                  {resource}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div className="p-3 bg-muted rounded-md mb-3">
                            <h4 className="text-xs font-medium mb-1">Recommendation:</h4>
                            <p className="text-xs text-muted-foreground">{violation.recommendation}</p>
                          </div>

                          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                            <span>Detected: {new Date(violation.detectedAt).toLocaleString()}</span>
                          </div>

                          <div className="flex gap-2">
                            {violation.autoFixAvailable && (
                              <Button size="sm" onClick={() => handleFixViolation(violation.id)}>
                                <CheckCircle className="h-3 w-3 mr-2" />
                                Auto-Fix
                              </Button>
                            )}
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="outline">
                                  Suppress
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Suppress Security Violation</DialogTitle>
                                  <DialogDescription>
                                    Provide a reason for suppressing this security violation. This should only be done
                                    if you have manually verified the risk is acceptable.
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <h4 className="text-sm font-medium mb-2">Violation:</h4>
                                    <p className="text-sm text-muted-foreground">{violation.description}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium mb-2 block">
                                      Suppression reason (required):
                                    </label>
                                    <textarea
                                      value={suppressionReason}
                                      onChange={(e) => setSuppressionReason(e.target.value)}
                                      placeholder="Explain why this violation can be safely ignored..."
                                      className="w-full p-2 border rounded-md text-sm"
                                      rows={3}
                                    />
                                  </div>
                                  <div className="flex justify-end gap-2">
                                    <Button variant="outline" onClick={() => setSuppressionReason("") }>
                                      Cancel
                                    </Button>
                                    <Button
                                      onClick={() => handleSuppressViolation(violation.id)}
                                      disabled={!suppressionReason.trim()}
                                    >
                                      Suppress Violation
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No security violations</h3>
                  <p className="text-sm text-muted-foreground">All security checks passed successfully.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Rules Tab */}
          <TabsContent value="rules" className="space-y-4">
            {securityRules.map((rule) => {
              const CategoryIcon = getCategoryIcon(rule.category)
              const SeverityIcon = getSeverityIcon(rule.severity)

              return (
                <Card key={rule.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className={cn("p-2 rounded-full", getSeverityColor(rule.severity))}>
                        <CategoryIcon className="h-4 w-4" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium text-sm">{rule.name}</h3>
                          <Badge variant="outline" className={cn("text-xs", getSeverityColor(rule.severity))}>
                            <SeverityIcon className="h-3 w-3 mr-1" />
                            {rule.severity}
                          </Badge>
                          <Badge variant="secondary" className="text-xs capitalize">
                            {rule.category.replace("_", " ")}
                          </Badge>
                          {rule.autoEnforce && (
                            <Badge variant="outline" className="text-xs text-blue-600">
                              Auto-enforce
                            </Badge>
                          )}
                        </div>

                        <p className="text-sm text-muted-foreground mb-3">{rule.description}</p>

                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant={rule.isActive ? "default" : "outline"}
                            onClick={() => onToggleRule?.(rule.id, !rule.isActive)}
                          >
                            {rule.isActive ? (
                              <>
                                <Lock className="h-3 w-3 mr-2" />
                                Active
                              </>
                            ) : (
                              <>
                                <Unlock className="h-3 w-3 mr-2" />
                                Inactive
                              </>
                            )}
                          </Button>
                          {rule.isActive && <span className="text-xs text-green-600">Rule is enforced</span>}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </TabsContent>

          {/* Recommendations Tab */}
          <TabsContent value="recommendations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Security Recommendations</CardTitle>
                <p className="text-sm text-muted-foreground">Suggested improvements to enhance your security posture</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {validationResult.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-muted rounded-md">
                      <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm">{recommendation}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  )
}
