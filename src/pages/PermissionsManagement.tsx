"use client"

import { EffectivePermissionsCalculator } from "@/components/permissions/EffectivePermissionsCalculator"
import { InheritanceIndicator } from "@/components/permissions/InheritanceIndicator"
import { PermissionAuditLog } from "@/components/permissions/PermissionAuditLog"
import { PermissionMatrix } from "@/components/permissions/PermissionMatrix"
import { SecurityValidation } from "@/components/permissions/SecurityValidation"
import { ShareDialog, type ShareLink } from "@/components/permissions/ShareDialog"
import { ShareLinkManager } from "@/components/permissions/ShareLinkManager"
import { UserRolePicker } from "@/components/permissions/UserRolePicker"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Eye, Link, Settings, Shield, Users } from "lucide-react"
import { useState } from "react"

interface PermissionsManagementProps {
  documentId: string
  documentTitle: string
  onBack: () => void
}

export function PermissionsManagement({ documentId, documentTitle, onBack }: PermissionsManagementProps) {
  const [activeTab, setActiveTab] = useState("permissions")

  return (
    <div className="flex h-full min-h-0 flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Permissions</h1>
                <p className="text-sm text-gray-500">{documentTitle}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <ShareDialog
                className=""
                documentId={documentId}
                documentName={documentTitle}
                onCreateLink={async (config: Partial<ShareLink>): Promise<ShareLink> => {
                  return {
                    id: crypto.randomUUID(),
                    url: "https://example.com/share/" + crypto.randomUUID(),
                    name: config.name,
                    scope: config.scope ?? "organization",
                    permissions: config.permissions ?? { canView: true, canDownload: false, canComment: false },
                    expiresAt: config.expiresAt,
                    createdAt: new Date().toISOString(),
                    createdBy: "System",
                    isActive: true,
                    accessCount: 0,
                    lastAccessed: undefined,
                    requiresAuth: config.requiresAuth ?? true,
                    allowedDomains: config.allowedDomains,
                    watermark: config.watermark ?? false,
                  }
                }}
                onUpdateLink={async () => {}}
                onDeleteLink={async () => {}}
                onCopyLink={async (url: string) => {
                  try {
                    await navigator.clipboard.writeText(url)
                  } catch {}
                }}
              />
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="whitespace-nowrap">
                    <Shield className="h-4 w-4 mr-2" />
                    Security Check
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-5xl w-full max-h-[85vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Security Validation</DialogTitle>
                  </DialogHeader>
                  <SecurityValidation />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="permissions" className="flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span>Permissions</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Users & Roles</span>
            </TabsTrigger>
            <TabsTrigger value="sharing" className="flex items-center space-x-2">
              <Link className="h-4 w-4" />
              <span>Share Links</span>
            </TabsTrigger>
            <TabsTrigger value="inheritance" className="flex items-center space-x-2">
              <Eye className="h-4 w-4" />
              <span>Inheritance</span>
            </TabsTrigger>
            <TabsTrigger value="audit" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Audit Log</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="permissions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Permission Matrix</CardTitle>
                <CardDescription>Manage user and role permissions for this document</CardDescription>
              </CardHeader>
              <CardContent>
                <PermissionMatrix
                  subjects={[]}
                  actions={[]}
                  permissions={[]}
                  onPermissionChange={() => {}}
                  onBulkPermissionChange={() => {}}
                />
              </CardContent>
            </Card>

            <EffectivePermissionsCalculator sources={[]} availablePermissions={[]} />
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Add Users & Roles</CardTitle>
                <CardDescription>Search and add users or roles to grant document access</CardDescription>
              </CardHeader>
              <CardContent>
                <UserRolePicker onSelectionChange={() => {}} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sharing" className="space-y-6">
            <ShareLinkManager
              links={[]}
              onUpdateLink={async () => {}}
              onDeleteLink={async () => {}}
              onCopyLink={() => {}}
            />
          </TabsContent>

          <TabsContent value="inheritance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Permission Inheritance</CardTitle>
                <CardDescription>
                  View how permissions are inherited from parent folders and organizational units
                </CardDescription>
              </CardHeader>
              <CardContent>
                <InheritanceIndicator
                  rootNode={{ id: "current-doc", name: documentTitle, type: "document", permissions: {}, isInherited: false, level: 0 }}
                  currentResourceId="current-doc"
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audit" className="space-y-6">
            <PermissionAuditLog entries={[]} />
          </TabsContent>
        </Tabs>
        </div>
      </div>

      {/* Share Dialog trigger is rendered in the header via ShareDialog component */}
    </div>
  )
}
