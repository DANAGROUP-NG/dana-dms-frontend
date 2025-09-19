"use client"

import { X, CheckCircle, AlertCircle, Upload } from "lucide-react"
import { Button } from "../ui/button"
import { Progress } from "../ui/progress"
import { Card, CardContent } from "../ui/card"
import { Badge } from "../ui/badge"
import { cn } from "../../lib/utils"
import type { UploadProgress as UploadProgressType } from "../../store/api/documentsApi"

interface UploadProgressProps {
  uploads: UploadProgressType[]
  onRemove: (id: string) => void
  onClear: () => void
  className?: string
}

export function UploadProgress({ uploads, onRemove, onClear, className }: UploadProgressProps) {
  if (uploads.length === 0) return null

  const completedCount = uploads.filter((u) => u.status === "completed").length
  const errorCount = uploads.filter((u) => u.status === "error").length
  const uploadingCount = uploads.filter((u) => u.status === "uploading").length

  const getStatusIcon = (status: UploadProgressType["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case "uploading":
        return <Upload className="h-4 w-4 text-blue-500 animate-pulse" />
      default:
        return null
    }
  }

  const getStatusColor = (status: UploadProgressType["status"]) => {
    switch (status) {
      case "completed":
        return "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/10"
      case "error":
        return "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/10"
      case "uploading":
        return "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/10"
      default:
        return ""
    }
  }

  return (
    <Card className={cn("w-full max-w-md", className)}>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h4 className="font-medium">Upload Progress</h4>
              <div className="flex gap-1">
                {uploadingCount > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {uploadingCount} uploading
                  </Badge>
                )}
                {completedCount > 0 && (
                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                    {completedCount} completed
                  </Badge>
                )}
                {errorCount > 0 && (
                  <Badge variant="secondary" className="text-xs bg-red-100 text-red-800">
                    {errorCount} failed
                  </Badge>
                )}
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClear}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Upload List */}
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {uploads.map((upload) => (
              <div
                key={upload.id}
                className={cn("flex items-center gap-3 p-2 border rounded-lg", getStatusColor(upload.status))}
              >
                {getStatusIcon(upload.status)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{upload.name}</p>
                  {upload.status === "uploading" && <Progress value={upload.progress} className="mt-1 h-1" />}
                  {upload.status === "error" && upload.error && (
                    <p className="text-xs text-red-600 mt-1">{upload.error}</p>
                  )}
                  {upload.status === "completed" && <p className="text-xs text-green-600 mt-1">Upload completed</p>}
                </div>
                <Button variant="ghost" size="sm" onClick={() => onRemove(upload.id)} className="h-6 w-6 p-0">
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
