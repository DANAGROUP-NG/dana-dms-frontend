"use client"

import { Download, Edit, Maximize2, RotateCw, Share, Trash2, X, ZoomIn, ZoomOut } from "lucide-react"
import { useMemo, useState } from "react"
import { Document as PDFDocument, Page, pdfjs } from "react-pdf"
import type { Document } from "../../data/mockData"
import { cn } from "../../lib/utils"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { ScrollArea } from "../ui/scroll-area"
import { Separator } from "../ui/separator"

// Configure PDF.js worker for react-pdf (vite-friendly)
try {
  pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString()
} catch {}

interface DocumentPreviewProps {
  document: Document | null
  isOpen: boolean
  onClose: () => void
  onDownload: (document: Document) => void
  onShare: (document: Document) => void
  onEdit: (document: Document) => void
  onDelete: (document: Document) => void
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "approved":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
    case "review":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
    case "draft":
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    case "archived":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
  }
}

export function DocumentPreview({
  document,
  isOpen,
  onClose,
  onDownload,
  onShare,
  onEdit,
  onDelete,
}: DocumentPreviewProps) {
  const [zoom, setZoom] = useState(100)
  const [rotation, setRotation] = useState(0)
  const [numPages, setNumPages] = useState<number | null>(null)

  if (!document) return null

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 25, 200))
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 25, 50))
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360)
  const handleReset = () => {
    setZoom(100)
    setRotation(0)
  }

  const isImage = document.type.toLowerCase().match(/^(jpg|jpeg|png|gif|webp)$/)
  const isPDF = document.type.toLowerCase() === "pdf"

  const pdfSource = useMemo(() => {
    if (!isPDF) return null
    const url = document.previewUrl || document.downloadUrl
    return url || null
  }, [document, isPDF])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <DialogTitle className="truncate">{document.name}</DialogTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className={cn("text-xs", getStatusColor(document.status))}>
                  {document.status}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {document.size} • {new Date(document.modified).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Preview Controls */}
              {(isImage || isPDF) && (
                <>
                  <Button variant="ghost" size="sm" onClick={handleZoomOut} disabled={zoom <= 50}>
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground min-w-[3rem] text-center">{zoom}%</span>
                  <Button variant="ghost" size="sm" onClick={handleZoomIn} disabled={zoom >= 200}>
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleRotate}>
                    <RotateCw className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleReset}>
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                  <Separator orientation="vertical" className="h-6" />
                </>
              )}

              {/* Action Buttons */}
              <Button variant="ghost" size="sm" onClick={() => onDownload(document)}>
                <Download className="h-4 w-4" />
              </Button>
              {document.permissions.canShare && (
                <Button variant="ghost" size="sm" onClick={() => onShare(document)}>
                  <Share className="h-4 w-4" />
                </Button>
              )}
              {document.permissions.canWrite && (
                <Button variant="ghost" size="sm" onClick={() => onEdit(document)}>
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              {document.permissions.canDelete && (
                <Button variant="ghost" size="sm" onClick={() => onDelete(document)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-1 min-h-0">
          {/* Preview Area */}
          <div className="flex-1 bg-muted/20">
            <ScrollArea className="h-full">
              <div className="p-6 flex items-center justify-center min-h-full">
                {isImage ? (
                  <img
                    src={document.thumbnail || "/placeholder.svg?height=400&width=600"}
                    alt={document.name}
                    className="max-w-full max-h-full object-contain transition-transform"
                    style={{
                      transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                    }}
                  />
                ) : isPDF && pdfSource ? (
                  <div className="w-full max-w-4xl bg-white rounded-lg overflow-hidden">
                    <PDFDocument
                      file={pdfSource}
                      onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                      loading={<div className="p-8 text-sm text-muted-foreground">Loading PDF…</div>}
                      error={<div className="p-8 text-sm text-red-500">Failed to load PDF.</div>}
                    >
                      {Array.from(new Array(numPages || 0), (_el, index) => (
                        <div key={`page_${index + 1}`} className="flex justify-center bg-gray-50">
                          <Page
                            pageNumber={index + 1}
                            scale={zoom / 100}
                            rotate={rotation}
                            renderTextLayer={false}
                            renderAnnotationLayer={false}
                          />
                        </div>
                      ))}
                    </PDFDocument>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="text-6xl mb-4">📄</div>
                    <p className="text-lg font-medium">Preview not available</p>
                    <p className="text-sm text-muted-foreground">This file type cannot be previewed in the browser</p>
                    <Button onClick={() => onDownload(document)} className="mt-4">
                      <Download className="h-4 w-4 mr-2" />
                      Download to view
                    </Button>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Sidebar */}
          <div className="w-80 border-l bg-background">
            <ScrollArea className="h-full">
              <div className="p-6 space-y-6">
                {/* Document Info */}
                <div>
                  <h3 className="font-semibold mb-3">Document Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type:</span>
                      <span className="font-medium uppercase">{document.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Size:</span>
                      <span>{document.size}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Version:</span>
                      <span>v{document.version}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Author:</span>
                      <span>{document.author}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Created:</span>
                      <span>{new Date(document.created).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Modified:</span>
                      <span>{new Date(document.modified).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Description */}
                {document.description && (
                  <>
                    <div>
                      <h3 className="font-semibold mb-3">Description</h3>
                      <p className="text-sm text-muted-foreground">{document.description}</p>
                    </div>
                    <Separator />
                  </>
                )}

                {/* Tags */}
                {document.tags.length > 0 && (
                  <>
                    <div>
                      <h3 className="font-semibold mb-3">Tags</h3>
                      <div className="flex flex-wrap gap-1">
                        {document.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Separator />
                  </>
                )}

                {/* Permissions */}
                <div>
                  <h3 className="font-semibold mb-3">Permissions</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Read:</span>
                      <Badge variant={document.permissions.canRead ? "default" : "secondary"}>
                        {document.permissions.canRead ? "Yes" : "No"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Write:</span>
                      <Badge variant={document.permissions.canWrite ? "default" : "secondary"}>
                        {document.permissions.canWrite ? "Yes" : "No"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Delete:</span>
                      <Badge variant={document.permissions.canDelete ? "default" : "secondary"}>
                        {document.permissions.canDelete ? "Yes" : "No"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Share:</span>
                      <Badge variant={document.permissions.canShare ? "default" : "secondary"}>
                        {document.permissions.canShare ? "Yes" : "No"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
