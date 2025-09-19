"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  Search,
  Filter,
  Calendar,
  User,
  Tag,
  FileType,
  SlidersHorizontal,
  X,
  ChevronDown,
  ChevronUp,
  Save,
  History,
  TrendingUp,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Badge } from "../ui/badge"
import { Separator } from "../ui/separator"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { DatePickerWithRange } from "../ui/date-picker-with-range"
import { Checkbox } from "../ui/checkbox"
import { Label } from "../ui/label"
import { Slider } from "../ui/slider"
import { cn } from "../../lib/utils"
import type { Document } from "../../data/mockData"
import type { DocumentFilters } from "../../store/api/documentsApi"

export interface AdvancedSearchFilters extends DocumentFilters {
  sizeRange?: [number, number]
  authors?: string[]
  fileTypes?: string[]
  hasAttachments?: boolean
  isShared?: boolean
  lastModifiedBy?: string
  contentSearch?: string
  exactPhrase?: string
  excludeWords?: string
  sortBy?: "relevance" | "date" | "size" | "name" | "author"
  sortOrder?: "asc" | "desc"
}

interface SearchFacet {
  name: string
  count: number
  selected: boolean
}

interface SearchFacets {
  authors: SearchFacet[]
  fileTypes: SearchFacet[]
  tags: SearchFacet[]
  status: SearchFacet[]
  folders: SearchFacet[]
}

interface AdvancedSearchInterfaceProps {
  documents: Document[]
  filters: AdvancedSearchFilters
  onFiltersChange: (filters: AdvancedSearchFilters) => void
  onSaveSearch?: (name: string, filters: AdvancedSearchFilters) => void
  savedSearches?: Array<{ id: string; name: string; filters: AdvancedSearchFilters }>
  className?: string
}

export function AdvancedSearchInterface({
  documents,
  filters,
  onFiltersChange,
  onSaveSearch,
  savedSearches = [],
  className,
}: AdvancedSearchInterfaceProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [facets, setFacets] = useState<SearchFacets>({
    authors: [],
    fileTypes: [],
    tags: [],
    status: [],
    folders: [],
  })
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [searchName, setSearchName] = useState("")

  // Calculate facets from documents
  useEffect(() => {
    const authorCounts = new Map<string, number>()
    const typeCounts = new Map<string, number>()
    const tagCounts = new Map<string, number>()
    const statusCounts = new Map<string, number>()
    const folderCounts = new Map<string, number>()

    documents.forEach((doc) => {
      // Authors
      authorCounts.set(doc.author, (authorCounts.get(doc.author) || 0) + 1)

      // File types
      typeCounts.set(doc.type, (typeCounts.get(doc.type) || 0) + 1)

      // Tags
      doc.tags.forEach((tag) => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1)
      })

      // Status
      statusCounts.set(doc.status, (statusCounts.get(doc.status) || 0) + 1)

      // Folders
      if (doc.folderId) {
        folderCounts.set(doc.folderId, (folderCounts.get(doc.folderId) || 0) + 1)
      }
    })

    setFacets({
      authors: Array.from(authorCounts.entries())
        .map(([name, count]) => ({
          name,
          count,
          selected: filters.authors?.includes(name) || false,
        }))
        .sort((a, b) => b.count - a.count),

      fileTypes: Array.from(typeCounts.entries())
        .map(([name, count]) => ({
          name,
          count,
          selected: filters.fileTypes?.includes(name) || false,
        }))
        .sort((a, b) => b.count - a.count),

      tags: Array.from(tagCounts.entries())
        .map(([name, count]) => ({
          name,
          count,
          selected: filters.tags?.includes(name) || false,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 20), // Limit to top 20 tags

      status: Array.from(statusCounts.entries())
        .map(([name, count]) => ({
          name,
          count,
          selected: filters.status?.split(",").includes(name) || false,
        }))
        .sort((a, b) => b.count - a.count),

      folders: Array.from(folderCounts.entries())
        .map(([name, count]) => ({
          name,
          count,
          selected: filters.folderId === name,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10), // Limit to top 10 folders
    })
  }, [documents, filters])

  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value })
  }

  const handleFacetToggle = (facetType: keyof SearchFacets, facetName: string) => {
    const newFilters = { ...filters }

    switch (facetType) {
      case "authors":
        const currentAuthors = newFilters.authors || []
        if (currentAuthors.includes(facetName)) {
          newFilters.authors = currentAuthors.filter((a) => a !== facetName)
        } else {
          newFilters.authors = [...currentAuthors, facetName]
        }
        break

      case "fileTypes":
        const currentTypes = newFilters.fileTypes || []
        if (currentTypes.includes(facetName)) {
          newFilters.fileTypes = currentTypes.filter((t) => t !== facetName)
        } else {
          newFilters.fileTypes = [...currentTypes, facetName]
        }
        break

      case "tags":
        const currentTags = newFilters.tags || []
        if (currentTags.includes(facetName)) {
          newFilters.tags = currentTags.filter((t) => t !== facetName)
        } else {
          newFilters.tags = [...currentTags, facetName]
        }
        break

      case "status":
        const currentStatuses = newFilters.status?.split(",") || []
        if (currentStatuses.includes(facetName)) {
          const filtered = currentStatuses.filter((s) => s !== facetName)
          newFilters.status = filtered.length > 0 ? filtered.join(",") : undefined
        } else {
          newFilters.status = [...currentStatuses, facetName].join(",")
        }
        break
    }

    onFiltersChange(newFilters)
  }

  const handleSaveSearch = () => {
    if (searchName.trim() && onSaveSearch) {
      onSaveSearch(searchName.trim(), filters)
      setSearchName("")
      setShowSaveDialog(false)
    }
  }

  const clearAllFilters = () => {
    onFiltersChange({ search: filters.search || "" })
  }

  const getActiveFilterCount = () => {
    let count = 0
    if (filters.authors?.length) count += filters.authors.length
    if (filters.fileTypes?.length) count += filters.fileTypes.length
    if (filters.tags?.length) count += filters.tags.length
    if (filters.status) count += filters.status.split(",").length
    if (filters.dateRange) count += 1
    if (filters.sizeRange) count += 1
    return count
  }

  const FacetSection = ({
    title,
    facets: sectionFacets,
    facetType,
    icon: Icon,
  }: {
    title: string
    facets: SearchFacet[]
    facetType: keyof SearchFacets
    icon: React.ComponentType<{ className?: string }>
  }) => {
    const [isOpen, setIsOpen] = useState(true)
    const selectedCount = sectionFacets.filter((f) => f.selected).length

    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-2 h-auto">
            <div className="flex items-center gap-2">
              <Icon className="h-4 w-4" />
              <span className="font-medium">{title}</span>
              {selectedCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {selectedCount}
                </Badge>
              )}
            </div>
            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 px-2 pb-2">
          {sectionFacets.slice(0, 8).map((facet) => (
            <div key={facet.name} className="flex items-center space-x-2">
              <Checkbox
                id={`${facetType}-${facet.name}`}
                checked={facet.selected}
                onCheckedChange={() => handleFacetToggle(facetType, facet.name)}
              />
              <Label
                htmlFor={`${facetType}-${facet.name}`}
                className="flex-1 text-sm cursor-pointer flex items-center justify-between"
              >
                <span className="truncate">{facet.name}</span>
                <span className="text-muted-foreground text-xs">({facet.count})</span>
              </Label>
            </div>
          ))}
          {sectionFacets.length > 8 && (
            <Button variant="ghost" size="sm" className="w-full text-xs">
              Show {sectionFacets.length - 8} more
            </Button>
          )}
        </CollapsibleContent>
      </Collapsible>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Main Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search documents, content, authors..."
                value={filters.search || ""}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" onClick={() => setIsExpanded(!isExpanded)} className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              Advanced
              {getActiveFilterCount() > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {getActiveFilterCount()}
                </Badge>
              )}
            </Button>
          </div>

          {/* Active Filters */}
          {getActiveFilterCount() > 0 && (
            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t">
              {filters.authors?.map((author) => (
                <Badge key={author} variant="secondary" className="text-xs">
                  Author: {author}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-1"
                    onClick={() => handleFacetToggle("authors", author)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
              {filters.fileTypes?.map((type) => (
                <Badge key={type} variant="secondary" className="text-xs">
                  Type: {type.toUpperCase()}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-1"
                    onClick={() => handleFacetToggle("fileTypes", type)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
              {filters.tags?.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  Tag: {tag}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-1"
                    onClick={() => handleFacetToggle("tags", tag)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
              <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-xs text-muted-foreground">
                Clear all
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Advanced Filters Panel */}
      {isExpanded && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Search Options */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Search className="h-4 w-4" />
                Search Options
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="exact-phrase" className="text-xs">
                  Exact phrase
                </Label>
                <Input
                  id="exact-phrase"
                  placeholder="&quot;exact phrase&quot;"
                  value={filters.exactPhrase || ""}
                  onChange={(e) => onFiltersChange({ ...filters, exactPhrase: e.target.value })}
                  className="text-sm"
                />
              </div>
              <div>
                <Label htmlFor="exclude-words" className="text-xs">
                  Exclude words
                </Label>
                <Input
                  id="exclude-words"
                  placeholder="word1 word2"
                  value={filters.excludeWords || ""}
                  onChange={(e) => onFiltersChange({ ...filters, excludeWords: e.target.value })}
                  className="text-sm"
                />
              </div>
              <div>
                <Label className="text-xs">Sort by</Label>
                <Select
                  value={filters.sortBy || "relevance"}
                  onValueChange={(value) => onFiltersChange({ ...filters, sortBy: value as any })}
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Relevance</SelectItem>
                    <SelectItem value="date">Date Modified</SelectItem>
                    <SelectItem value="size">File Size</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="author">Author</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Faceted Filters */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <FacetSection title="Authors" facets={facets.authors} facetType="authors" icon={User} />
              <Separator />
              <FacetSection title="File Types" facets={facets.fileTypes} facetType="fileTypes" icon={FileType} />
              <Separator />
              <FacetSection title="Status" facets={facets.status} facetType="status" icon={TrendingUp} />
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Tags
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FacetSection title="Popular Tags" facets={facets.tags} facetType="tags" icon={Tag} />
            </CardContent>
          </Card>

          {/* Date & Size Filters */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Date & Size
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs">Date Range</Label>
                <DatePickerWithRange
                  value={
                    filters.dateRange
                      ? {
                          from: new Date(filters.dateRange.start),
                          to: new Date(filters.dateRange.end),
                        }
                      : undefined
                  }
                  onChange={(range) => {
                    if (range?.from && range?.to) {
                      onFiltersChange({
                        ...filters,
                        dateRange: {
                          start: range.from.toISOString(),
                          end: range.to.toISOString(),
                        },
                      })
                    } else {
                      onFiltersChange({ ...filters, dateRange: undefined })
                    }
                  }}
                />
              </div>

              <div>
                <Label className="text-xs">File Size (MB)</Label>
                <div className="px-2 py-4">
                  <Slider
                    value={filters.sizeRange || [0, 100]}
                    onValueChange={(value) => onFiltersChange({ ...filters, sizeRange: value as [number, number] })}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>{filters.sizeRange?.[0] || 0} MB</span>
                    <span>{filters.sizeRange?.[1] || 100} MB</span>
                  </div>
                </div>
              </div>

              {/* Save Search */}
              <Separator />
              <div className="space-y-2">
                {!showSaveDialog ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSaveDialog(true)}
                    className="w-full text-xs"
                  >
                    <Save className="h-3 w-3 mr-1" />
                    Save Search
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <Input
                      placeholder="Search name"
                      value={searchName}
                      onChange={(e) => setSearchName(e.target.value)}
                      className="text-sm"
                    />
                    <div className="flex gap-1">
                      <Button size="sm" onClick={handleSaveSearch} className="flex-1 text-xs">
                        Save
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setShowSaveDialog(false)} className="text-xs">
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {/* Saved Searches */}
                {savedSearches.length > 0 && (
                  <div className="space-y-1">
                    <Label className="text-xs flex items-center gap-1">
                      <History className="h-3 w-3" />
                      Saved Searches
                    </Label>
                    {savedSearches.slice(0, 3).map((saved) => (
                      <Button
                        key={saved.id}
                        variant="ghost"
                        size="sm"
                        onClick={() => onFiltersChange(saved.filters)}
                        className="w-full justify-start text-xs h-auto p-1"
                      >
                        {saved.name}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
