"use client"

import { useState } from "react"
import {
  Grid,
  List,
  SortAsc,
  SortDesc,
  Filter,
  Download,
  Share,
  Eye,
  MoreHorizontal,
  FileText,
  Clock,
  User,
} from "lucide-react"
import { Card, CardContent } from "../ui/card"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { Separator } from "../ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { DocumentList } from "../documents/DocumentList"
import { cn } from "../../lib/utils"
import type { Document } from "../../data/mockData"
import type { AdvancedSearchFilters } from "./AdvancedSearchInterface"

interface SearchResult extends Document {
  relevanceScore?: number
  matchedFields?: string[]
  snippet?: string
}

interface SearchResultsWithFacetsProps {
  results: SearchResult[]
  totalResults: number
  filters: AdvancedSearchFilters
  onFiltersChange: (filters: AdvancedSearchFilters) => void
  onDocumentSelect: (document: Document) => void
  onDocumentPreview: (document: Document) => void
  onDocumentDownload: (document: Document) => void
  onDocumentShare: (document: Document) => void
  onDocumentDelete: (document: Document) => void
  onDocumentEdit: (document: Document) => void
  selectedDocuments: string[]
  onSelectDocument: (id: string) => void
  onSelectAll: (ids: string[]) => void
  isLoading?: boolean
  className?: string
}

export function SearchResultsWithFacets({
  results,
  totalResults,
  filters,
  onFiltersChange,
  onDocumentSelect,
  onDocumentPreview,
  onDocumentDownload,
  onDocumentShare,
  onDocumentDelete,
  onDocumentEdit,
  selectedDocuments,
  onSelectDocument,
  onSelectAll,
  isLoading = false,
  className,
}: SearchResultsWithFacetsProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState(filters.sortBy || "relevance")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(filters.sortOrder || "desc")

  const handleSortChange = (newSortBy: string) => {
    setSortBy(newSortBy)
    onFiltersChange({ ...filters, sortBy: newSortBy as any })
  }

  const handleSortOrderToggle = () => {
    const newOrder = sortOrder === "asc" ? "desc" : "asc"
    setSortOrder(newOrder)
    onFiltersChange({ ...filters, sortOrder: newOrder })
  }

  const getResultsText = () => {
    if (isLoading) return "Searching..."
    if (totalResults === 0) return "No results found"
    if (totalResults === 1) return "1 result"
    return `${totalResults.toLocaleString()} results`
  }

  const getSearchTime = () => {
    // Simulate search time
    return Math.random() * 0.5 + 0.1
  }

  const highlightText = (text: string, query?: string) => {
    if (!query) return text

    const regex = new RegExp(`(${query})`, "gi")
    const parts = text.split(regex)

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-800 px-0.5 rounded">
          {part}
        </mark>
      ) : (
        part
      ),
    )
  }

  const ResultCard = ({ result }: { result: SearchResult }) => (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => onDocumentSelect(result)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-medium text-sm truncate">{highlightText(result.name, filters.search)}</h3>
          </div>
          <div className="flex items-center gap-1">
            {result.relevanceScore && (
              <Badge variant="outline" className="text-xs">
                {Math.round(result.relevanceScore * 100)}% match
              </Badge>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onDocumentPreview(result)}>
                  <Eye className="mr-2 h-4 w-4" />
                  Preview
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDocumentDownload(result)}>
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDocumentShare(result)}>
                  <Share className="mr-2 h-4 w-4" />
                  Share
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {result.snippet && (
          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
            {highlightText(result.snippet, filters.search)}
          </p>
        )}

        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            {result.author}
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {new Date(result.modified).toLocaleDateString()}
          </div>
          <span>{result.size}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex gap-1 flex-wrap">
            <Badge variant="secondary" className="text-xs">
              {result.status}
            </Badge>
            {result.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {result.tags.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{result.tags.length - 2}
              </Badge>
            )}
          </div>

          {result.matchedFields && result.matchedFields.length > 0 && (
            <div className="flex gap-1">
              {result.matchedFields.map((field) => (
                <Badge key={field} variant="outline" className="text-xs">
                  {field}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )

  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Searching documents...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Results Header */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <p className="font-medium">{getResultsText()}</p>
                {!isLoading && totalResults > 0 && (
                  <p className="text-sm text-muted-foreground">Found in {getSearchTime().toFixed(2)} seconds</p>
                )}
              </div>

              {filters.search && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">for</span>
                  <Badge variant="outline">"{filters.search}"</Badge>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Sort Controls */}
              <Select value={sortBy} onValueChange={handleSortChange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="size">Size</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="author">Author</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" size="sm" onClick={handleSortOrderToggle} className="p-2 bg-transparent">
                {sortOrder === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
              </Button>

              <Separator orientation="vertical" className="h-6" />

              {/* View Mode Toggle */}
              <div className="flex border rounded-md">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="rounded-r-none"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {totalResults === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="space-y-4">
              <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                <Filter className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-medium mb-2">No results found</h3>
                <p className="text-sm text-muted-foreground mb-4">Try adjusting your search terms or filters</p>
                <Button variant="outline" onClick={() => onFiltersChange({ search: "" })}>
                  Clear all filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className={cn(viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-2")}>
          {viewMode === "grid" ? (
            results.map((result) => <ResultCard key={result.id} result={result} />)
          ) : (
            <DocumentList
              documents={results}
              selectedDocuments={selectedDocuments}
              onSelectDocument={onSelectDocument}
              onSelectAll={onSelectAll}
              onPreview={onDocumentPreview}
              onDownload={onDocumentDownload}
              onShare={onDocumentShare}
              onDelete={onDocumentDelete}
              onEdit={onDocumentEdit}
              onSort={handleSortChange}
              sortBy={sortBy}
              sortOrder={sortOrder}
            />
          )}
        </div>
      )}
    </div>
  )
}
