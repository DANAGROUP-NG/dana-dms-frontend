"use client"

import { Grid, List, LayoutGrid } from "lucide-react"
import { Button } from "../ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { cn } from "../../lib/utils"

interface ViewToggleProps {
  viewMode: "grid" | "list"
  gridDensity: "compact" | "comfortable" | "spacious"
  onViewModeChange: (mode: "grid" | "list") => void
  onGridDensityChange: (density: "compact" | "comfortable" | "spacious") => void
}

export function ViewToggle({ viewMode, gridDensity, onViewModeChange, onGridDensityChange }: ViewToggleProps) {
  return (
    <div className="flex items-center border rounded-md">
      <Button
        variant={viewMode === "grid" ? "default" : "ghost"}
        size="sm"
        onClick={() => onViewModeChange("grid")}
        className="rounded-r-none"
      >
        <Grid className="h-4 w-4" />
      </Button>
      <Button
        variant={viewMode === "list" ? "default" : "ghost"}
        size="sm"
        onClick={() => onViewModeChange("list")}
        className="rounded-l-none rounded-r-none border-l border-r"
      >
        <List className="h-4 w-4" />
      </Button>

      {viewMode === "grid" && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="rounded-l-none">
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => onGridDensityChange("compact")}
              className={cn(gridDensity === "compact" && "bg-accent")}
            >
              Compact
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onGridDensityChange("comfortable")}
              className={cn(gridDensity === "comfortable" && "bg-accent")}
            >
              Comfortable
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onGridDensityChange("spacious")}
              className={cn(gridDensity === "spacious" && "bg-accent")}
            >
              Spacious
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  )
}
