"use client"

import { useCallback, useMemo } from "react"
import { Badge } from "../ui/badge"
import { Card, CardContent } from "../ui/card"
import { cn } from "../../lib/utils"
import type { Document } from "../../data/mockData"

interface DocumentGridProps {
  documents: Document[]
  selectedIds: string[]
  onSelectDocument: (id: string) => void
  onOpenDocument?: (doc: Document) => void
}

export function DocumentGrid({ documents, selectedIds, onSelectDocument, onOpenDocument }: DocumentGridProps) {
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>, index: number, document: Document) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault()
        onSelectDocument(document.id)
        return
      }
      // Basic arrow navigation between items
      const items = document.querySelectorAll('[data-role="doc-card"]')
      if (!items || items.length === 0) return
      let nextIndex = index
      if (e.key === "ArrowRight") nextIndex = Math.min(index + 1, items.length - 1)
      if (e.key === "ArrowLeft") nextIndex = Math.max(index - 1, 0)
      if (e.key === "ArrowDown") nextIndex = Math.min(index + 4, items.length - 1) // heuristic for 4-column
      if (e.key === "ArrowUp") nextIndex = Math.max(index - 4, 0)
      if (nextIndex !== index) {
        ;(items[nextIndex] as HTMLElement).focus()
      }
    },
    [onSelectDocument],
  )

  const gridDocuments = useMemo(() => documents, [documents])

  return (
    <div role="list" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {gridDocuments.map((document, idx) => (
        <Card
          key={document.id}
          data-role="doc-card"
          tabIndex={0}
          aria-selected={selectedIds.includes(document.id)}
          role="listitem"
          className={cn(
            "group cursor-pointer transition-shadow hover:shadow-md border focus:outline-none focus:ring-2 focus:ring-primary",
            selectedIds.includes(document.id) && "ring-2 ring-primary",
          )}
          onClick={() => onSelectDocument(document.id)}
          onDoubleClick={() => onOpenDocument?.(document)}
          onKeyDown={(e) => handleKeyDown(e, idx, document)}
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <img
                src={document.thumbnail || "/placeholder.svg"}
                alt="thumbnail"
                className="h-12 w-12 rounded object-cover border"
                loading="lazy"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="truncate font-medium" title={document.name}>
                    {document.name}
                  </div>
                  <Badge variant="secondary" className="flex-shrink-0">
                    v{document.version}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground mt-1 truncate">
                  {document.size} • {new Date(document.modified).toLocaleDateString()} • {document.author}
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {document.tags.slice(0, 3).map((t) => (
                    <Badge key={t} variant="outline" className="text-[10px]">
                      {t}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}


