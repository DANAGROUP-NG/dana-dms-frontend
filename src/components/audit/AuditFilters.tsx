"use client"

import { CalendarIcon, X } from "lucide-react"
import { format } from "date-fns"
import { Button } from "../ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { DatePickerWithRange } from "../ui/date-picker-with-range"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { Badge } from "../ui/badge"
import type { AuditFilters, AuditActorType, AuditActionType, AuditTargetType, AuditResult } from "../../types/audit"

interface AuditFiltersProps {
  filters: AuditFilters
  onFiltersChange: (filters: AuditFilters) => void
  onReset: () => void
}

export function AuditFilters({ filters, onFiltersChange, onReset }: AuditFiltersProps) {

  const handleFilterChange = (key: keyof AuditFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const clearFilter = (key: keyof AuditFilters) => {
    const newFilters = { ...filters }
    delete newFilters[key]
    onFiltersChange(newFilters)
  }

  const hasActiveFilters = Object.keys(filters).filter(key => key !== 'search').length > 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Date Range */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Date Range</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.startDate && filters.endDate
                  ? `${format(new Date(filters.startDate), "MMM d")} - ${format(new Date(filters.endDate), "MMM d, yyyy")}`
                  : "Select date range"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <DatePickerWithRange
                value={
                  filters.startDate && filters.endDate
                    ? { from: new Date(filters.startDate), to: new Date(filters.endDate) }
                    : undefined
                }
                onChange={(range) => {
                  if (range?.from && range?.to) {
                    handleFilterChange("startDate", range.from.toISOString())
                    handleFilterChange("endDate", range.to.toISOString())
                  }
                }}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Actor Type */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Actor Type</label>
          <Select
            value={filters.actorType || "all"}
            onValueChange={(value) =>
              handleFilterChange("actorType", value === "all" ? undefined : (value as AuditActorType))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="All actor types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actor Types</SelectItem>
              <SelectItem value="USER">User</SelectItem>
              <SelectItem value="SYSTEM">System</SelectItem>
              <SelectItem value="INTEGRATION">Integration</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Action Type */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Action Type</label>
          <Select
            value={filters.action || "all"}
            onValueChange={(value) =>
              handleFilterChange("action", value === "all" ? undefined : (value as AuditActionType))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="All actions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="document.create">Create Document</SelectItem>
              <SelectItem value="document.read">Read Document</SelectItem>
              <SelectItem value="document.update">Update Document</SelectItem>
              <SelectItem value="document.delete">Delete Document</SelectItem>
              <SelectItem value="document.share">Share Document</SelectItem>
              <SelectItem value="document.download">Download Document</SelectItem>
              <SelectItem value="permission.grant">Grant Permission</SelectItem>
              <SelectItem value="permission.revoke">Revoke Permission</SelectItem>
              <SelectItem value="workflow.create">Create Workflow</SelectItem>
              <SelectItem value="user.login">User Login</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Target Type */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Target Type</label>
          <Select
            value={filters.targetType || "all"}
            onValueChange={(value) =>
              handleFilterChange("targetType", value === "all" ? undefined : (value as AuditTargetType))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="All targets" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Targets</SelectItem>
              <SelectItem value="DOCUMENT">Document</SelectItem>
              <SelectItem value="FOLDER">Folder</SelectItem>
              <SelectItem value="USER">User</SelectItem>
              <SelectItem value="WORKFLOW">Workflow</SelectItem>
              <SelectItem value="PERMISSION">Permission</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Result */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Result</label>
          <Select
            value={filters.result || "all"}
            onValueChange={(value) =>
              handleFilterChange("result", value === "all" ? undefined : (value as AuditResult))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="All results" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Results</SelectItem>
              <SelectItem value="SUCCESS">Success</SelectItem>
              <SelectItem value="FAILURE">Failure</SelectItem>
              <SelectItem value="UNAUTHORIZED">Unauthorized</SelectItem>
              <SelectItem value="ERROR">Error</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="space-y-2 pt-4 border-t">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Active Filters</label>
              <Button variant="ghost" size="sm" onClick={onReset}>
                Clear All
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {filters.actorType && (
                <Badge variant="secondary" className="gap-1">
                  {filters.actorType}
                  <button onClick={() => clearFilter("actorType")}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.action && (
                <Badge variant="secondary" className="gap-1">
                  {filters.action}
                  <button onClick={() => clearFilter("action")}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.targetType && (
                <Badge variant="secondary" className="gap-1">
                  {filters.targetType}
                  <button onClick={() => clearFilter("targetType")}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.result && (
                <Badge variant="secondary" className="gap-1">
                  {filters.result}
                  <button onClick={() => clearFilter("result")}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

