"use client"

import { useState } from "react"
import {
  Share,
  Link,
  Copy,
  Eye,
  Download,
  Calendar,
  Globe,
  Users,
  Building,
  Settings,
  Trash2,
  BarChart3,
  ExternalLink,
} from "lucide-react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Switch } from "../ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Badge } from "../ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip"
import { useToast } from "../../hooks/use-toast"
import { cn } from "../../lib/utils"

export interface ShareLink {
  id: string
  url: string
  name?: string
  scope: "internal" | "organization" | "public"
  permissions: {
    canView: boolean
    canDownload: boolean
    canComment: boolean
  }
  expiresAt?: string
  createdAt: string
  createdBy: string
  isActive: boolean
  accessCount: number
  lastAccessed?: string
  requiresAuth: boolean
  allowedDomains?: string[]
  watermark?: boolean
}

interface ShareDialogProps {
  documentId: string
  documentName: string
  existingLinks?: ShareLink[]
  onCreateLink: (linkConfig: Partial<ShareLink>) => Promise<ShareLink>
  onUpdateLink: (linkId: string, updates: Partial<ShareLink>) => Promise<void>
  onDeleteLink: (linkId: string) => Promise<void>
  onCopyLink: (url: string) => void
  canCreateLinks?: boolean
  className?: string
}

// Mock data for demonstration
const mockExistingLinks: ShareLink[] = [
  {
    id: "link-1",
    url: "https://docs.company.com/share/abc123def456",
    name: "Marketing Team Review",
    scope: "organization",
    permissions: {
      canView: true,
      canDownload: true,
      canComment: true,
    },
    expiresAt: "2024-02-15T23:59:59Z",
    createdAt: "2024-01-15T10:30:00Z",
    createdBy: "John Doe",
    isActive: true,
    accessCount: 24,
    lastAccessed: "2024-01-20T14:22:00Z",
    requiresAuth: true,
    watermark: false,
  },
  {
    id: "link-2",
    url: "https://docs.company.com/share/xyz789uvw012",
    name: "Public Preview",
    scope: "public",
    permissions: {
      canView: true,
      canDownload: false,
      canComment: false,
    },
    createdAt: "2024-01-10T09:15:00Z",
    createdBy: "Jane Smith",
    isActive: true,
    accessCount: 156,
    lastAccessed: "2024-01-21T11:45:00Z",
    requiresAuth: false,
    watermark: true,
  },
]

export function ShareDialog({
  documentId,
  documentName,
  existingLinks = mockExistingLinks,
  onCreateLink,
  onUpdateLink,
  onDeleteLink,
  onCopyLink,
  canCreateLinks = true,
  className,
}: ShareDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("create")
  const [isCreating, setIsCreating] = useState(false)
  const { toast } = useToast()

  // New link configuration
  const [linkConfig, setLinkConfig] = useState({
    name: "",
    scope: "organization" as ShareLink["scope"],
    permissions: {
      canView: true,
      canDownload: true,
      canComment: false,
    },
    expiresAt: "",
    requiresAuth: true,
    allowedDomains: "",
    watermark: false,
  })

  const handleCreateLink = async () => {
    if (!canCreateLinks) return

    setIsCreating(true)
    try {
      const newLink = await onCreateLink({
        name: linkConfig.name || undefined,
        scope: linkConfig.scope,
        permissions: linkConfig.permissions,
        expiresAt: linkConfig.expiresAt || undefined,
        requiresAuth: linkConfig.requiresAuth,
        allowedDomains: linkConfig.allowedDomains
          ? linkConfig.allowedDomains.split(",").map((d) => d.trim())
          : undefined,
        watermark: linkConfig.watermark,
      })

      toast({
        title: "Share link created",
        description: "Your share link has been generated successfully.",
      })

      // Copy to clipboard
      onCopyLink(newLink.url)

      // Reset form
      setLinkConfig({
        name: "",
        scope: "organization",
        permissions: {
          canView: true,
          canDownload: true,
          canComment: false,
        },
        expiresAt: "",
        requiresAuth: true,
        allowedDomains: "",
        watermark: false,
      })

      setActiveTab("manage")
    } catch (error) {
      toast({
        title: "Failed to create link",
        description: "There was an error creating the share link. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  const handleCopyLink = (url: string) => {
    onCopyLink(url)
    toast({
      title: "Link copied",
      description: "Share link has been copied to your clipboard.",
    })
  }

  const handleToggleLinkStatus = async (linkId: string, isActive: boolean) => {
    try {
      await onUpdateLink(linkId, { isActive })
      toast({
        title: isActive ? "Link activated" : "Link deactivated",
        description: `Share link has been ${isActive ? "activated" : "deactivated"}.`,
      })
    } catch (error) {
      toast({
        title: "Failed to update link",
        description: "There was an error updating the share link.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteLink = async (linkId: string) => {
    try {
      await onDeleteLink(linkId)
      toast({
        title: "Link deleted",
        description: "Share link has been permanently deleted.",
      })
    } catch (error) {
      toast({
        title: "Failed to delete link",
        description: "There was an error deleting the share link.",
        variant: "destructive",
      })
    }
  }

  const getScopeIcon = (scope: ShareLink["scope"]) => {
    switch (scope) {
      case "internal":
        return Users
      case "organization":
        return Building
      case "public":
        return Globe
      default:
        return Share
    }
  }

  const getScopeColor = (scope: ShareLink["scope"]) => {
    switch (scope) {
      case "internal":
        return "text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300"
      case "organization":
        return "text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300"
      case "public":
        return "text-orange-600 bg-orange-100 dark:bg-orange-900 dark:text-orange-300"
      default:
        return "text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const isLinkExpired = (expiresAt?: string) => {
    if (!expiresAt) return false
    return new Date(expiresAt) < new Date()
  }

  return (
    <TooltipProvider>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className={className}>
            <Share className="h-4 w-4 mr-2" />
            Share
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share className="h-5 w-5" />
              Share "{documentName}"
            </DialogTitle>
            <DialogDescription>Create and manage share links for this document</DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="create">Create Link</TabsTrigger>
              <TabsTrigger value="manage">Manage Links ({existingLinks.length})</TabsTrigger>
            </TabsList>

            {/* Create Link Tab */}
            <TabsContent value="create" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Create New Share Link</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Configure permissions and access settings for your share link
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Link Name */}
                  <div className="space-y-2">
                    <Label htmlFor="link-name">Link Name (Optional)</Label>
                    <Input
                      id="link-name"
                      placeholder="e.g., Marketing Team Review"
                      value={linkConfig.name}
                      onChange={(e) => setLinkConfig((prev) => ({ ...prev, name: e.target.value }))}
                    />
                    <p className="text-xs text-muted-foreground">
                      Give your link a descriptive name to help identify it later
                    </p>
                  </div>

                  {/* Access Scope */}
                  <div className="space-y-2">
                    <Label>Access Scope</Label>
                    <Select
                      value={linkConfig.scope}
                      onValueChange={(value: ShareLink["scope"]) =>
                        setLinkConfig((prev) => ({ ...prev, scope: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="internal">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Internal - Team members only
                          </div>
                        </SelectItem>
                        <SelectItem value="organization">
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4" />
                            Organization - Anyone in your organization
                          </div>
                        </SelectItem>
                        <SelectItem value="public">
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4" />
                            Public - Anyone with the link
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Permissions */}
                  <div className="space-y-4">
                    <Label>Permissions</Label>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Eye className="h-4 w-4" />
                          <span className="text-sm">Can view document</span>
                        </div>
                        <Switch
                          checked={linkConfig.permissions.canView}
                          onCheckedChange={(checked) =>
                            setLinkConfig((prev) => ({
                              ...prev,
                              permissions: { ...prev.permissions, canView: checked },
                            }))
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Download className="h-4 w-4" />
                          <span className="text-sm">Can download document</span>
                        </div>
                        <Switch
                          checked={linkConfig.permissions.canDownload}
                          onCheckedChange={(checked) =>
                            setLinkConfig((prev) => ({
                              ...prev,
                              permissions: { ...prev.permissions, canDownload: checked },
                            }))
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Share className="h-4 w-4" />
                          <span className="text-sm">Can add comments</span>
                        </div>
                        <Switch
                          checked={linkConfig.permissions.canComment}
                          onCheckedChange={(checked) =>
                            setLinkConfig((prev) => ({
                              ...prev,
                              permissions: { ...prev.permissions, canComment: checked },
                            }))
                          }
                        />
                      </div>
                    </div>
                  </div>

                  {/* Expiration */}
                  <div className="space-y-2">
                    <Label htmlFor="expires-at">Expiration Date (Optional)</Label>
                    <Input
                      id="expires-at"
                      type="datetime-local"
                      value={linkConfig.expiresAt}
                      onChange={(e) => setLinkConfig((prev) => ({ ...prev, expiresAt: e.target.value }))}
                    />
                    <p className="text-xs text-muted-foreground">Leave empty for links that never expire</p>
                  </div>

                  {/* Security Options */}
                  <div className="space-y-4">
                    <Label>Security Options</Label>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm">Require authentication</span>
                          <p className="text-xs text-muted-foreground">Users must sign in to access</p>
                        </div>
                        <Switch
                          checked={linkConfig.requiresAuth}
                          onCheckedChange={(checked) => setLinkConfig((prev) => ({ ...prev, requiresAuth: checked }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm">Add watermark</span>
                          <p className="text-xs text-muted-foreground">Add user info to document</p>
                        </div>
                        <Switch
                          checked={linkConfig.watermark}
                          onCheckedChange={(checked) => setLinkConfig((prev) => ({ ...prev, watermark: checked }))}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Domain Restrictions */}
                  {linkConfig.scope === "public" && (
                    <div className="space-y-2">
                      <Label htmlFor="allowed-domains">Allowed Domains (Optional)</Label>
                      <Input
                        id="allowed-domains"
                        placeholder="company.com, partner.com"
                        value={linkConfig.allowedDomains}
                        onChange={(e) => setLinkConfig((prev) => ({ ...prev, allowedDomains: e.target.value }))}
                      />
                      <p className="text-xs text-muted-foreground">
                        Comma-separated list of domains that can access this link
                      </p>
                    </div>
                  )}

                  <Button onClick={handleCreateLink} disabled={isCreating || !canCreateLinks} className="w-full">
                    {isCreating ? (
                      <>Creating Link...</>
                    ) : (
                      <>
                        <Link className="h-4 w-4 mr-2" />
                        Create Share Link
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Manage Links Tab */}
            <TabsContent value="manage" className="space-y-4">
              {existingLinks.length > 0 ? (
                existingLinks.map((link) => {
                  const ScopeIcon = getScopeIcon(link.scope)
                  const isExpired = isLinkExpired(link.expiresAt)

                  return (
                    <Card
                      key={link.id}
                      className={cn(
                        "transition-all duration-200",
                        !link.isActive && "opacity-60",
                        isExpired && "border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800",
                      )}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className={cn("p-2 rounded-full", getScopeColor(link.scope))}>
                            <ScopeIcon className="h-4 w-4" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-medium text-sm truncate">{link.name || "Unnamed Link"}</h3>
                              <Badge variant="outline" className={cn("text-xs", getScopeColor(link.scope))}>
                                {link.scope}
                              </Badge>
                              {!link.isActive && (
                                <Badge variant="secondary" className="text-xs">
                                  Inactive
                                </Badge>
                              )}
                              {isExpired && (
                                <Badge variant="destructive" className="text-xs">
                                  Expired
                                </Badge>
                              )}
                            </div>

                            <div className="flex items-center gap-4 mb-3">
                              <Input value={link.url} readOnly className="text-xs font-mono" />
                              <Button size="sm" variant="outline" onClick={() => handleCopyLink(link.url)}>
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>

                            <div className="flex flex-wrap gap-2 mb-3">
                              {link.permissions.canView && (
                                <Badge variant="secondary" className="text-xs">
                                  <Eye className="h-3 w-3 mr-1" />
                                  View
                                </Badge>
                              )}
                              {link.permissions.canDownload && (
                                <Badge variant="secondary" className="text-xs">
                                  <Download className="h-3 w-3 mr-1" />
                                  Download
                                </Badge>
                              )}
                              {link.permissions.canComment && (
                                <Badge variant="secondary" className="text-xs">
                                  <Share className="h-3 w-3 mr-1" />
                                  Comment
                                </Badge>
                              )}
                              {link.watermark && (
                                <Badge variant="outline" className="text-xs">
                                  Watermarked
                                </Badge>
                              )}
                            </div>

                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <BarChart3 className="h-3 w-3" />
                                {link.accessCount} views
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Created {formatDate(link.createdAt)}
                              </div>
                              {link.expiresAt && (
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  Expires {formatDate(link.expiresAt)}
                                </div>
                              )}
                              {link.lastAccessed && (
                                <div className="flex items-center gap-1">
                                  <ExternalLink className="h-3 w-3" />
                                  Last accessed {formatDate(link.lastAccessed)}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleToggleLinkStatus(link.id, !link.isActive)}
                                >
                                  <Settings className="h-3 w-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>{link.isActive ? "Deactivate link" : "Activate link"}</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDeleteLink(link.id)}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Delete link permanently</TooltipContent>
                            </Tooltip>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Link className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No share links created</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Create your first share link to start sharing this document.
                    </p>
                    <Button onClick={() => setActiveTab("create")}>
                      <Link className="h-4 w-4 mr-2" />
                      Create Share Link
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  )
}
