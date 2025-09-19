"use client"

import { useState } from "react"
import {
  FileText,
  ImageIcon,
  FileSpreadsheet,
  Presentation,
  File,
  ExternalLink,
  Download,
  Eye,
  Search,
} from "lucide-react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Badge } from "../ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { cn } from "../../lib/utils"
import type { RelatedDocument } from "../../types/documentDetail"

interface RelatedDocumentsProps {
  relatedDocuments: RelatedDocument[]
  onPreview?: (document: RelatedDocument) => void
  onDownload?: (document: RelatedDocument) => void
  onOpen?: (document: RelatedDocument) => void
  className?: string
}

const getFileIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case "pdf":
      return FileText
    case "docx":
    case "doc":
      return FileText
    case "xlsx":
    case "xls":
      return FileSpreadsheet
    case "pptx":
    case "ppt":
      return Presentation
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
      return ImageIcon
    default:
      return File
  }
}

const getRelationshipColor = (relationship: RelatedDocument["relationship"]) => {
  switch (relationship) {
    case "version":
      return "text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300"
    case "referenced":
      return "text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300"
    case "similar":
      return "text-purple-600 bg-purple-100 dark:bg-purple-900 dark:text-purple-300"
    case "template":
      return "text-orange-600 bg-orange-100 dark:bg-orange-900 dark:text-orange-300"
    default:
      return "text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-300"
  }
}

const getRelationshipLabel = (relationship: RelatedDocument["relationship"]) => {
  switch (relationship) {
    case "version":
      return "Previous Version"
    case "referenced":
      return "Referenced"
    case "similar":
      return "Similar Content"
    case "template":
      return "Template"
    default:
      return "Related"
  }
}

export function RelatedDocuments({
  relatedDocuments,
  onPreview,
  onDownload,
  onOpen,
  className,
}: RelatedDocumentsProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterRelationship, setFilterRelationship] = useState<string>("all")

  // Filter documents
  const filteredDocuments = relatedDocuments.filter((doc) => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRelationship = filterRelationship === "all" || doc.relationship === filterRelationship
    return matchesSearch && matchesRelationship
  })

  // Group documents by relationship
  const groupedDocuments = filteredDocuments.reduce(
    (groups, doc) => {
      if (!groups[doc.relationship]) {
        groups[doc.relationship] = []
      }
      groups[doc.relationship].push(doc)
      return groups
    },
    {} as Record<string, RelatedDocument[]>,
  )

  // Sort documents by score within each group
  Object.keys(groupedDocuments).forEach((key) => {
    groupedDocuments[key].sort((a, b) => (b.score || 0) - (a.score || 0))
  })

  const relationshipOrder: RelatedDocument["relationship"][] = ["version", "referenced", "template", "similar"]

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header with search and filters */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Related Documents</CardTitle>
          <p className="text-sm text-muted-foreground">Documents that are connected to or similar to this document</p>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search related documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterRelationship} onValueChange={setFilterRelationship}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All relationships" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All relationships</SelectItem>
                <SelectItem value="version">Previous Versions</SelectItem>
                <SelectItem value="referenced">Referenced</SelectItem>
                <SelectItem value="template">Templates</SelectItem>
                <SelectItem value="similar">Similar Content</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Related Documents by Category */}
      <div className="space-y-6">
        {relationshipOrder.map((relationship) => {
          const documents = groupedDocuments[relationship]
          if (!documents || documents.length === 0) return null

          return (
            <Card key={relationship}>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={cn("text-xs", getRelationshipColor(relationship))}>
                      {getRelationshipLabel(relationship)}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {documents.length} document{documents.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {documents.map((doc) => {
                    const FileIcon = getFileIcon(doc.type)

                    return (
                      <Card key={doc.id} className="group hover:shadow-md transition-shadow cursor-pointer">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <FileIcon className="h-5 w-5 text-primary" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="font-medium text-sm text-foreground truncate mb-1" title={doc.name}>
                                {doc.name}
                              </h4>
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline" className="text-xs uppercase">
                                  {doc.type}
                                </Badge>
                                {doc.score && (
                                  <Badge variant="secondary" className="text-xs">
                                    {Math.round(doc.score * 100)}% match
                                  </Badge>
                                )}
                              </div>

                              {/* Document thumbnail */}
                              {doc.thumbnail && (
                                <div className="w-full h-20 rounded border bg-muted mb-3 overflow-hidden">
                                  <img
                                    src={doc.thumbnail || "/placeholder.svg"}
                                    alt={doc.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              )}

                              {/* Action buttons */}
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                {onPreview && (
                                  <Button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      onPreview(doc)
                                    }}
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                )}
                                {onDownload && (
                                  <Button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      onDownload(doc)
                                    }}
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0"
                                  >
                                    <Download className="h-4 w-4" />
                                  </Button>
                                )}
                                {onOpen && (
                                  <Button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      onOpen(doc)
                                    }}
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0"
                                  >
                                    <ExternalLink className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredDocuments.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              {searchTerm || filterRelationship !== "all" ? "No matching documents" : "No related documents"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {searchTerm || filterRelationship !== "all"
                ? "Try adjusting your search or filters to find related documents."
                : "Related documents will appear here when the system identifies connections."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
