"use client"

import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Upload, X, FileText, AlertCircle, CheckCircle } from "lucide-react"
import { Button } from "../ui/button"
import { Progress } from "../ui/progress"
import { Card, CardContent } from "../ui/card"
import { Badge } from "../ui/badge"
import { cn } from "../../lib/utils"
import { MAX_FILE_SIZE } from "../../lib/constants"

interface UploadFile {
  id: string
  file: File
  progress: number
  status: "pending" | "uploading" | "completed" | "error"
  error?: string
}

interface UploadDropzoneProps {
  onUpload: (files: File[]) => void
  onClose?: () => void
  className?: string
  maxFiles?: number
}

export function UploadDropzone({ onUpload, onClose, className, maxFiles = 10 }: UploadDropzoneProps) {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      console.log("Rejected files:", rejectedFiles)
    }

    // Add accepted files to upload queue
    const newFiles: UploadFile[] = acceptedFiles.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      progress: 0,
      status: "pending",
    }))

    setUploadFiles((prev) => [...prev, ...newFiles])
  }, [])

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.openxmlformats-officedocument.presentationml.presentation": [".pptx"],
      "text/plain": [".txt"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/gif": [".gif"],
    },
    maxSize: MAX_FILE_SIZE,
    maxFiles,
    multiple: true,
  })

  const removeFile = (id: string) => {
    setUploadFiles((prev) => prev.filter((file) => file.id !== id))
  }

  const simulateUpload = async (file: UploadFile) => {
    const updateProgress = (progress: number, status: UploadFile["status"] = "uploading") => {
      setUploadFiles((prev) => prev.map((f) => (f.id === file.id ? { ...f, progress, status } : f)))
    }

    try {
      // Simulate upload progress
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise((resolve) => setTimeout(resolve, 100))
        updateProgress(progress)
      }
      updateProgress(100, "completed")
    } catch (error) {
      updateProgress(0, "error")
      setUploadFiles((prev) =>
        prev.map((f) => (f.id === file.id ? { ...f, error: "Upload failed. Please try again." } : f)),
      )
    }
  }

  const handleUpload = async () => {
    if (uploadFiles.length === 0) return

    setIsUploading(true)

    // Start uploads for all pending files
    const pendingFiles = uploadFiles.filter((f) => f.status === "pending")
    const uploadPromises = pendingFiles.map((file) => simulateUpload(file))

    try {
      await Promise.all(uploadPromises)

      // Call the onUpload callback with the actual files
      const filesToUpload = pendingFiles.map((f) => f.file)
      onUpload(filesToUpload)
    } catch (error) {
      console.error("Upload error:", error)
    } finally {
      setIsUploading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getStatusIcon = (status: UploadFile["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <FileText className="h-4 w-4 text-muted-foreground" />
    }
  }

  const completedCount = uploadFiles.filter((f) => f.status === "completed").length
  const errorCount = uploadFiles.filter((f) => f.status === "error").length
  const allCompleted = uploadFiles.length > 0 && completedCount === uploadFiles.length

  return (
    <Card className={cn("w-full max-w-2xl mx-auto", className)}>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Upload Documents</h3>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
              isDragActive && !isDragReject && "border-primary bg-primary/5",
              isDragReject && "border-red-500 bg-red-50 dark:bg-red-950/10",
              !isDragActive && "border-muted-foreground/25 hover:border-muted-foreground/50",
            )}
          >
            <input {...getInputProps()} />
            <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
            {isDragActive ? (
              isDragReject ? (
                <p className="text-red-500">Some files are not supported</p>
              ) : (
                <p className="text-primary">Drop files here...</p>
              )
            ) : (
              <div className="space-y-2">
                <p className="text-lg font-medium">Drag & drop files here</p>
                <p className="text-sm text-muted-foreground">
                  or <span className="text-primary underline">browse files</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  Supports PDF, DOCX, XLSX, PPTX, TXT, and images up to {formatFileSize(MAX_FILE_SIZE)}
                </p>
              </div>
            )}
          </div>

          {/* File List */}
          {uploadFiles.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Files to upload ({uploadFiles.length})</h4>
                {completedCount > 0 && (
                  <Badge variant="secondary">
                    {completedCount} completed
                    {errorCount > 0 && `, ${errorCount} failed`}
                  </Badge>
                )}
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {uploadFiles.map((uploadFile) => (
                  <div key={uploadFile.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    {getStatusIcon(uploadFile.status)}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{uploadFile.file.name}</p>
                      <p className="text-sm text-muted-foreground">{formatFileSize(uploadFile.file.size)}</p>
                      {uploadFile.status === "uploading" && <Progress value={uploadFile.progress} className="mt-1" />}
                      {uploadFile.error && <p className="text-sm text-red-500 mt-1">{uploadFile.error}</p>}
                    </div>
                    {uploadFile.status === "pending" && (
                      <Button variant="ghost" size="sm" onClick={() => removeFile(uploadFile.id)}>
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          {uploadFiles.length > 0 && (
            <div className="flex items-center justify-between pt-4 border-t">
              <Button variant="outline" onClick={() => setUploadFiles([])} disabled={isUploading}>
                Clear All
              </Button>
              <div className="flex gap-2">
                {allCompleted && onClose && (
                  <Button variant="outline" onClick={onClose}>
                    Close
                  </Button>
                )}
                <Button onClick={handleUpload} disabled={isUploading || uploadFiles.length === 0 || allCompleted}>
                  {isUploading
                    ? "Uploading..."
                    : `Upload ${uploadFiles.length} file${uploadFiles.length > 1 ? "s" : ""}`}
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
