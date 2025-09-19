"use client"

import { useState } from "react"
import { Download, Eye, RotateCcw, GitCompare, Clock, User, FileText, ChevronDown, ChevronRight } from "lucide-react"
import { Button } from "../ui/button"
import { Card, CardContent, CardHeader } from "../ui/card"
import { Badge } from "../ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible"
import { cn } from "../../lib/utils"
import type { DocumentVersion } from "../../types/documentDetail"

interface VersionHistoryProps {
  versions: DocumentVersion[]
  onDownloadVersion: (version: DocumentVersion) => void
  onPreviewVersion: (version: DocumentVersion) => void
  onRestoreVersion: (version: DocumentVersion) => void
  onCompareVersions: (version1: DocumentVersion, version2: DocumentVersion) => void
  className?: string
}

export function VersionHistory({
  versions,
  onDownloadVersion,
  onPreviewVersion,
  onRestoreVersion,
  onCompareVersions,
  className,
}: VersionHistoryProps) {
  const [selectedVersions, setSelectedVersions] = useState<string[]>([])
  const [expandedVersions, setExpandedVersions] = useState<string[]>([])

  const handleVersionSelect = (versionId: string) => {
    setSelectedVersions((prev) => {
      if (prev.includes(versionId)) {
        return prev.filter((id) => id !== versionId)
      } else if (prev.length < 2) {
        return [...prev, versionId]
      } else {
        return [prev[1], versionId]
      }
    })
  }

  const toggleExpanded = (versionId: string) => {
    setExpandedVersions((prev) =>
      prev.includes(versionId) ? prev.filter((id) => id !== versionId) : [...prev, versionId],
    )
  }

  const handleCompare = () => {
    if (selectedVersions.length === 2) {
      const version1 = versions.find((v) => v.id === selectedVersions[0])
      const version2 = versions.find((v) => v.id === selectedVersions[1])
      if (version1 && version2) {
        onCompareVersions(version1, version2)
      }
    }
  }

  const formatFileSize = (bytes: number) => {
    const sizes = ["Bytes", "KB", "MB", "GB"]
    if (bytes === 0) return "0 Bytes"
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i]
  }

  const getSizeDifference = (currentBytes: number, previousBytes: number) => {
    const diff = currentBytes - previousBytes
    if (diff === 0) return null
    const sign = diff > 0 ? "+" : ""
    return `${sign}${formatFileSize(Math.abs(diff))}`
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Compare Actions */}
      {selectedVersions.length === 2 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GitCompare className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">2 versions selected for comparison</span>
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={handleCompare} size="sm">
                  <GitCompare className="h-4 w-4 mr-2" />
                  Compare Versions
                </Button>
                <Button variant="outline" size="sm" onClick={() => setSelectedVersions([])}>
                  Clear Selection
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Version List */}
      <div className="space-y-3">
        {versions.map((version, index) => {
          const isSelected = selectedVersions.includes(version.id)
          const isExpanded = expandedVersions.includes(version.id)
          const previousVersion = versions[index + 1]
          const sizeDiff = previousVersion ? getSizeDifference(version.sizeBytes, previousVersion.sizeBytes) : null

          return (
            <Card
              key={version.id}
              className={cn(
                "transition-all duration-200",
                isSelected && "ring-2 ring-primary border-primary/50",
                version.isCurrentVersion && "border-primary/30 bg-primary/5",
              )}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div
                      className={cn(
                        "h-10 w-10 rounded-full border-2 flex items-center justify-center cursor-pointer transition-colors",
                        isSelected ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/30",
                      )}
                      onClick={() => handleVersionSelect(version.id)}
                    >
                      <span className="text-sm font-medium">v{version.version}</span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-foreground truncate">Version {version.version}</h3>
                        {version.isCurrentVersion && (
                          <Badge variant="default" className="text-xs">
                            Current
                          </Badge>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>{version.uploadedBy}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{new Date(version.uploadDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          <span>{version.size}</span>
                          {sizeDiff && (
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-xs ml-1",
                                sizeDiff.startsWith("+") ? "text-green-600" : "text-red-600",
                              )}
                            >
                              {sizeDiff}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {version.notes && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{version.notes}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button variant="ghost" size="sm" onClick={() => onPreviewVersion(version)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => onDownloadVersion(version)}>
                      <Download className="h-4 w-4" />
                    </Button>
                    {!version.isCurrentVersion && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Restore Version {version.version}?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will create a new version based on version {version.version}. The current version
                              will be preserved in the version history.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => onRestoreVersion(version)}>
                              Restore Version
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}

                    {version.changes && version.changes.length > 0 && (
                      <Collapsible>
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={() => toggleExpanded(version.id)}>
                            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                          </Button>
                        </CollapsibleTrigger>
                      </Collapsible>
                    )}
                  </div>
                </div>
              </CardHeader>

              {version.changes && version.changes.length > 0 && (
                <Collapsible open={isExpanded}>
                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      <div className="border-t pt-3">
                        <h4 className="text-sm font-medium text-foreground mb-2">Changes in this version:</h4>
                        <ul className="space-y-1">
                          {version.changes.map((change, changeIndex) => (
                            <li key={changeIndex} className="text-sm text-muted-foreground flex items-start gap-2">
                              <span className="w-1 h-1 rounded-full bg-primary mt-2 flex-shrink-0"></span>
                              <span>{change}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              )}
            </Card>
          )
        })}
      </div>

      {versions.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No versions available</h3>
            <p className="text-sm text-muted-foreground">
              Version history will appear here when the document is updated.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
