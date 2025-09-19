"use client"

import { useState } from "react"
import {
  Link,
  BarChart3,
  Globe,
  Users,
  Building,
  Eye,
  Download,
  Share,
  Settings,
  Trash2,
  Copy,
  AlertTriangle,
  CheckCircle,
} from "lucide-react"
import { Button } from "../ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Badge } from "../ui/badge"
import { Input } from "../ui/input"
import { Progress } from "../ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { TooltipProvider } from "../ui/tooltip"
import { useToast } from "../../hooks/use-toast"
import { cn } from "../../lib/utils"
import type { ShareLink } from "./ShareDialog"

interface ShareLinkManagerProps {
  links: ShareLink[]
  onUpdateLink: (linkId: string, updates: Partial<ShareLink>) => Promise<void>
  onDeleteLink: (linkId: string) => Promise<void>
  onCopyLink: (url: string) => void
  onViewAnalytics?: (linkId: string) => void
  className?: string
}

interface LinkAnalytics {
  linkId: string
  totalViews: number
  uniqueViewers: number
  downloads: number
  viewsOverTime: { date: string; views: number }[]
  topReferrers: { source: string; count: number }[]
  geographicData: { country: string; count: number }[]
}

// Mock analytics data
const mockAnalytics: Record<string, LinkAnalytics> = {
  "link-1": {
    linkId: "link-1",
    totalViews: 24,
    uniqueViewers: 18,
    downloads: 12,
    viewsOverTime: [
      { date: "2024-01-15", views: 3 },
      { date: "2024-01-16", views: 5 },
      { date: "2024-01-17", views: 8 },
      { date: "2024-01-18", views: 4 },
      { date: "2024-01-19", views: 2 },
      { date: "2024-01-20", views: 2 },
    ],
    topReferrers: [
      { source: "Direct", count: 15 },
      { source: "Email", count: 6 },
      { source: "Slack", count: 3 },
    ],
    geographicData: [
      { country: "United States", count: 18 },
      { country: "Canada", count: 4 },
      { country: "United Kingdom", count: 2 },
    ],
  },
  "link-2": {
    linkId: "link-2",
    totalViews: 156,
    uniqueViewers: 134,
    downloads: 45,
    viewsOverTime: [
      { date: "2024-01-10", views: 12 },
      { date: "2024-01-11", views: 18 },
      { date: "2024-01-12", views: 25 },
      { date: "2024-01-13", views: 22 },
      { date: "2024-01-14", views: 31 },
      { date: "2024-01-15", views: 28 },
      { date: "2024-01-16", views: 20 },
    ],
    topReferrers: [
      { source: "Google", count: 89 },
      { source: "Direct", count: 34 },
      { source: "Twitter", count: 21 },
      { source: "LinkedIn", count: 12 },
    ],
    geographicData: [
      { country: "United States", count: 78 },
      { country: "India", count: 23 },
      { country: "United Kingdom", count: 19 },
      { country: "Germany", count: 15 },
      { country: "Canada", count: 12 },
      { country: "Australia", count: 9 },
    ],
  },
}

export function ShareLinkManager({
  links,
  onUpdateLink,
  onDeleteLink,
  onCopyLink,
  onViewAnalytics,
  className,
}: ShareLinkManagerProps) {
  const [selectedLink, setSelectedLink] = useState<ShareLink | null>(null)
  const [activeTab, setActiveTab] = useState("overview")
  const { toast } = useToast()

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

  const getExpirationStatus = (expiresAt?: string) => {
    if (!expiresAt) return null

    const now = new Date()
    const expiry = new Date(expiresAt)
    const diffTime = expiry.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return { status: "expired", message: "Expired", color: "text-red-600" }
    if (diffDays === 0) return { status: "today", message: "Expires today", color: "text-orange-600" }
    if (diffDays <= 7) return { status: "soon", message: `Expires in ${diffDays} days`, color: "text-yellow-600" }
    return { status: "active", message: `Expires in ${diffDays} days`, color: "text-green-600" }
  }

  const activeLinks = links.filter((link) => link.isActive && !isLinkExpired(link.expiresAt))
  const inactiveLinks = links.filter((link) => !link.isActive || isLinkExpired(link.expiresAt))
  const totalViews = links.reduce((sum, link) => sum + link.accessCount, 0)

  return (
    <TooltipProvider>
      <div className={cn("space-y-6", className)}>
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Link className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{links.length}</p>
                  <p className="text-xs text-muted-foreground">Total Links</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{activeLinks.length}</p>
                  <p className="text-xs text-muted-foreground">Active Links</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">{totalViews}</p>
                  <p className="text-xs text-muted-foreground">Total Views</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold">{inactiveLinks.length}</p>
                  <p className="text-xs text-muted-foreground">Inactive/Expired</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Links Management */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="active">Active ({activeLinks.length})</TabsTrigger>
            <TabsTrigger value="inactive">Inactive ({inactiveLinks.length})</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>All Share Links</CardTitle>
                <p className="text-sm text-muted-foreground">Manage all share links for this document</p>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Link</TableHead>
                      <TableHead>Scope</TableHead>
                      <TableHead>Permissions</TableHead>
                      <TableHead>Views</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {links.map((link) => {
                      const ScopeIcon = getScopeIcon(link.scope)
                      const expirationStatus = getExpirationStatus(link.expiresAt)
                      const isExpired = isLinkExpired(link.expiresAt)

                      return (
                        <TableRow key={link.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className={cn("p-1 rounded", getScopeColor(link.scope))}>
                                <ScopeIcon className="h-3 w-3" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-sm truncate">{link.name || "Unnamed Link"}</p>
                                <p className="text-xs text-muted-foreground font-mono truncate">
                                  {link.url.split("/").pop()}
                                </p>
                              </div>
                            </div>
                          </TableCell>

                          <TableCell>
                            <Badge variant="outline" className={cn("text-xs", getScopeColor(link.scope))}>
                              {link.scope}
                            </Badge>
                          </TableCell>

                          <TableCell>
                            <div className="flex gap-1">
                              {link.permissions.canView && (
                                <Badge variant="secondary" className="text-xs">
                                  <Eye className="h-2 w-2 mr-1" />
                                  View
                                </Badge>
                              )}
                              {link.permissions.canDownload && (
                                <Badge variant="secondary" className="text-xs">
                                  <Download className="h-2 w-2 mr-1" />
                                  Download
                                </Badge>
                              )}
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="text-sm">
                              <span className="font-medium">{link.accessCount}</span>
                              {link.lastAccessed && (
                                <p className="text-xs text-muted-foreground">Last: {formatDate(link.lastAccessed)}</p>
                              )}
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="flex items-center gap-1">
                              {link.isActive && !isExpired ? (
                                <Badge variant="secondary" className="text-xs text-green-600">
                                  Active
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="text-xs text-red-600">
                                  {isExpired ? "Expired" : "Inactive"}
                                </Badge>
                              )}
                            </div>
                          </TableCell>

                          <TableCell>
                            {expirationStatus ? (
                              <span className={cn("text-xs", expirationStatus.color)}>{expirationStatus.message}</span>
                            ) : (
                              <span className="text-xs text-muted-foreground">Never</span>
                            )}
                          </TableCell>

                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <Settings className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleCopyLink(link.url)}>
                                  <Copy className="mr-2 h-4 w-4" />
                                  Copy Link
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleToggleLinkStatus(link.id, !link.isActive)}>
                                  {link.isActive ? (
                                    <>
                                      <Settings className="mr-2 h-4 w-4" />
                                      Deactivate
                                    </>
                                  ) : (
                                    <>
                                      <Settings className="mr-2 h-4 w-4" />
                                      Activate
                                    </>
                                  )}
                                </DropdownMenuItem>
                                {onViewAnalytics && (
                                  <DropdownMenuItem onClick={() => onViewAnalytics(link.id)}>
                                    <BarChart3 className="mr-2 h-4 w-4" />
                                    View Analytics
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleDeleteLink(link.id)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Active Links Tab */}
          <TabsContent value="active">
            <Card>
              <CardHeader>
                <CardTitle>Active Share Links</CardTitle>
                <p className="text-sm text-muted-foreground">Currently active and accessible share links</p>
              </CardHeader>
              <CardContent>
                {activeLinks.length > 0 ? (
                  <div className="space-y-4">
                    {activeLinks.map((link) => {
                      const ScopeIcon = getScopeIcon(link.scope)
                      const expirationStatus = getExpirationStatus(link.expiresAt)

                      return (
                        <Card key={link.id}>
                          <CardContent className="p-4">
                            <div className="flex items-center gap-4">
                              <div className={cn("p-2 rounded-full", getScopeColor(link.scope))}>
                                <ScopeIcon className="h-4 w-4" />
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="font-medium text-sm truncate">{link.name || "Unnamed Link"}</h3>
                                  <Badge variant="outline" className={cn("text-xs", getScopeColor(link.scope))}>
                                    {link.scope}
                                  </Badge>
                                  {expirationStatus && expirationStatus.status === "soon" && (
                                    <Badge variant="outline" className="text-xs text-orange-600">
                                      {expirationStatus.message}
                                    </Badge>
                                  )}
                                </div>

                                <div className="flex items-center gap-4 mb-2">
                                  <Input value={link.url} readOnly className="text-xs font-mono" />
                                  <Button size="sm" variant="outline" onClick={() => handleCopyLink(link.url)}>
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                </div>

                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                  <span>{link.accessCount} views</span>
                                  <span>Created {formatDate(link.createdAt)}</span>
                                  {link.lastAccessed && <span>Last accessed {formatDate(link.lastAccessed)}</span>}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Link className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No active links</h3>
                    <p className="text-sm text-muted-foreground">All share links are currently inactive or expired.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Inactive Links Tab */}
          <TabsContent value="inactive">
            <Card>
              <CardHeader>
                <CardTitle>Inactive & Expired Links</CardTitle>
                <p className="text-sm text-muted-foreground">Links that are deactivated or have expired</p>
              </CardHeader>
              <CardContent>
                {inactiveLinks.length > 0 ? (
                  <div className="space-y-4">
                    {inactiveLinks.map((link) => {
                      const ScopeIcon = getScopeIcon(link.scope)
                      const isExpired = isLinkExpired(link.expiresAt)

                      return (
                        <Card key={link.id} className="opacity-60">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-4">
                              <div className={cn("p-2 rounded-full", getScopeColor(link.scope))}>
                                <ScopeIcon className="h-4 w-4" />
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="font-medium text-sm truncate">{link.name || "Unnamed Link"}</h3>
                                  <Badge variant="secondary" className="text-xs text-red-600">
                                    {isExpired ? "Expired" : "Inactive"}
                                  </Badge>
                                </div>

                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                  <span>{link.accessCount} views</span>
                                  <span>Created {formatDate(link.createdAt)}</span>
                                  {link.expiresAt && <span>Expired {formatDate(link.expiresAt)}</span>}
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                {!isExpired && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleToggleLinkStatus(link.id, true)}
                                  >
                                    Activate
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDeleteLink(link.id)}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">All links are active</h3>
                    <p className="text-sm text-muted-foreground">No inactive or expired links found.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {links.map((link) => {
                const analytics = mockAnalytics[link.id]
                if (!analytics) return null

                return (
                  <Card key={link.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{link.name || "Unnamed Link"}</CardTitle>
                      <p className="text-sm text-muted-foreground">Analytics for the past 7 days</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-blue-600">{analytics.totalViews}</p>
                          <p className="text-xs text-muted-foreground">Total Views</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-green-600">{analytics.uniqueViewers}</p>
                          <p className="text-xs text-muted-foreground">Unique Viewers</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-purple-600">{analytics.downloads}</p>
                          <p className="text-xs text-muted-foreground">Downloads</p>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium mb-2">Top Referrers</h4>
                        <div className="space-y-2">
                          {analytics.topReferrers.slice(0, 3).map((referrer) => (
                            <div key={referrer.source} className="flex items-center justify-between">
                              <span className="text-sm">{referrer.source}</span>
                              <div className="flex items-center gap-2">
                                <Progress value={(referrer.count / analytics.totalViews) * 100} className="w-16 h-2" />
                                <span className="text-xs text-muted-foreground w-8">{referrer.count}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  )
}
