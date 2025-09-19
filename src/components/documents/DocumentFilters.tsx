"use client"

import { AlertCircle, Archive, Calendar, CheckCircle, Clock, FileText, Filter, X } from "lucide-react"
import { useState } from "react"
import type { DateRange } from "react-day-picker"
import type { Document } from "../../data/mockData"
import { cn } from "../../lib/utils"
import type { DocumentFilters as DocumentFiltersType } from "../../store/api/documentsApi"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { Calendar as CalendarComponent } from "../ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Checkbox } from "../ui/checkbox"
import { Label } from "../ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { Separator } from "../ui/separator"

interface DocumentFiltersProps {
  filters: DocumentFiltersType
  onFiltersChange: (filters: DocumentFiltersType) => void
  documents: Document[]
  className?: string
}

const FILE_TYPES = [
  { value: "pdf", label: "PDF", icon: FileText },
  { value: "docx", label: "Word", icon: FileText },
  { value: "xlsx", label: "Excel", icon: FileText },
  { value: "pptx", label: "PowerPoint", icon: FileText },
  { value: "txt", label: "Text", icon: FileText },
  { value: "image", label: "Images", icon: FileText },
]

const STATUSES = [
  { value: "draft", label: "Draft", icon: Clock, color: "text-gray-500" },
  { value: "review", label: "Review", icon: AlertCircle, color: "text-yellow-500" },
  { value: "approved", label: "Approved", icon: CheckCircle, color: "text-green-500" },
  { value: "archived", label: "Archived", icon: Archive, color: "text-red-500" },
]

export function DocumentFilters({ filters, onFiltersChange, documents, className }: DocumentFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)

  // Get unique authors and tags from documents
  const authors = Array.from(new Set(documents.map((doc) => doc.author))).sort()
  const allTags = Array.from(new Set(documents.flatMap((doc) => doc.tags))).sort()

  const updateFilters = (updates: Partial<DocumentFiltersType>) => {
    onFiltersChange({ ...filters, ...updates })
  }

  const toggleFileType = (type: string) => {
    const currentTypes = filters.type?.split(",") || []
    const newTypes = currentTypes.includes(type) ? currentTypes.filter((t) => t !== type) : [...currentTypes, type]

    updateFilters({ type: newTypes.length > 0 ? newTypes.join(",") : undefined })
  }

  const toggleStatus = (status: string) => {
    const currentStatuses = filters.status?.split(",") || []
    const newStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter((s) => s !== status)
      : [...currentStatuses, status]

    updateFilters({ status: newStatuses.length > 0 ? newStatuses.join(",") : undefined })
  }

  const toggleTag = (tag: string) => {
    const currentTags = filters.tags || []
    const newTags = currentTags.includes(tag) ? currentTags.filter((t) => t !== tag) : [...currentTags, tag]

    updateFilters({ tags: newTags.length > 0 ? newTags : undefined })
  }

  const clearFilters = () => {
    onFiltersChange({})
    setDateRange(undefined)
  }

  const hasActiveFilters = Object.keys(filters).some((key) => {
    const value = filters[key as keyof DocumentFiltersType]
    return value !== undefined && value !== "" && (Array.isArray(value) ? value.length > 0 : true)
  })

  const activeFilterCount = [filters.type, filters.status, filters.tags?.length, filters.dateRange].filter(
    Boolean,
  ).length

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className={cn("relative", className)}>
          <Filter className="h-4 w-4 mr-1" />
          Filters
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 text-xs">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Filters</CardTitle>
              <div className="flex items-center gap-2">
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear all
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* File Types */}
            <div>
              <Label className="text-sm font-medium mb-2 block">File Type</Label>
              <div className="grid grid-cols-2 gap-2">
                {FILE_TYPES.map((type) => {
                  const isSelected = filters.type?.split(",").includes(type.value) || false
                  return (
                    <div key={type.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`type-${type.value}`}
                        checked={isSelected}
                        onCheckedChange={() => toggleFileType(type.value)}
                      />
                      <Label htmlFor={`type-${type.value}`} className="text-sm cursor-pointer">
                        {type.label}
                      </Label>
                    </div>
                  )
                })}
              </div>
            </div>

            <Separator />

            {/* Status */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Status</Label>
              <div className="space-y-2">
                {STATUSES.map((status) => {
                  const isSelected = filters.status?.split(",").includes(status.value) || false
                  const Icon = status.icon
                  return (
                    <div key={status.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`status-${status.value}`}
                        checked={isSelected}
                        onCheckedChange={() => toggleStatus(status.value)}
                      />
                      <Label
                        htmlFor={`status-${status.value}`}
                        className="text-sm cursor-pointer flex items-center gap-2"
                      >
                        <Icon className={cn("h-3 w-3", status.color)} />
                        {status.label}
                      </Label>
                    </div>
                  )
                })}
              </div>
            </div>

            <Separator />

            {/* Tags */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Tags</Label>
              <div className="max-h-32 overflow-y-auto space-y-2">
                {allTags.slice(0, 10).map((tag) => {
                  const isSelected = filters.tags?.includes(tag) || false
                  return (
                    <div key={tag} className="flex items-center space-x-2">
                      <Checkbox id={`tag-${tag}`} checked={isSelected} onCheckedChange={() => toggleTag(tag)} />
                      <Label htmlFor={`tag-${tag}`} className="text-sm cursor-pointer">
                        {tag}
                      </Label>
                    </div>
                  )
                })}
              </div>
            </div>

            <Separator />

            {/* Date Range */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Date Range</Label>
              <div className="space-y-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                      <Calendar className="h-4 w-4 mr-2" />
                      {dateRange?.from
                        ? dateRange.to
                          ? `${dateRange.from.toLocaleDateString()} - ${dateRange.to.toLocaleDateString()}`
                          : dateRange.from.toLocaleDateString()
                        : "Select date range"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="range"
                      selected={dateRange}
                      onSelect={(range) => {
                        setDateRange(range)
                        if (range?.from && range?.to) {
                          updateFilters({
                            dateRange: {
                              start: range.from.toISOString(),
                              end: range.to.toISOString(),
                            },
                          })
                        }
                      }}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  )
}
