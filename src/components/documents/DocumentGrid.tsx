"use client"

import { DocumentCard } from "./DocumentCard"
import { cn } from "../../lib/utils"
import type { Document } from "../../data/mockData"

interface DocumentGridProps {
  documents: Document[]
  selectedDocuments: string[]
  onSelectDocument: (id: string) => void
  onPreview: (document: Document) => void
  onDownload: (document: Document) => void
  onShare: (document: Document) => void
  onDelete: (document: Document) => void
  onEdit: (document: Document) => void
  density?: "compact" | "comfortable" | "spacious"
}

export function DocumentGrid({
  documents,
  selectedDocuments,
  onSelectDocument,
  onPreview,
  onDownload,
  onShare,
  onDelete,
  onEdit,
  density = "comfortable",
}: DocumentGridProps) {
  const gridCols = {
    compact: "grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8",
    comfortable: "grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
    spacious: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  }[density]

  const gap = {
    compact: "gap-2",
    comfortable: "gap-4",
    spacious: "gap-6",
  }[density]

  return (
    <div className={cn("grid", gridCols, gap)}>
      {documents.map((document) => (
        <DocumentCard
          key={document.id}
          document={document}
          isSelected={selectedDocuments.includes(document.id)}
          onSelect={onSelectDocument}
          onPreview={onPreview}
          onDownload={onDownload}
          onShare={onShare}
          onDelete={onDelete}
          onEdit={onEdit}
          density={density}
        />
      ))}
    </div>
  )
}
