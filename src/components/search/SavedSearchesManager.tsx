"use client"

import { useState } from "react"
import { Search, Star, StarOff, Edit, Trash2, Plus, Clock, Filter, BookmarkIcon, MoreVertical } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Badge } from "../ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { Textarea } from "../ui/textarea"
import { ScrollArea } from "../ui/scroll-area"
import { cn } from "../../lib/utils"
import { useSavedSearches } from "../../hooks/useSavedSearches"
import type { SavedSearch } from "../../store/slices/savedSearchesSlice"

interface SavedSearchesManagerProps {
  onLoadSearch?: (search: SavedSearch) => void
  currentQuery?: string
  currentFilters?: SavedSearch["filters"]
  className?: string
}

interface SaveSearchDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: (name: string, description?: string) => void
  existingSearch?: SavedSearch
  searchExists: (name: string) => boolean
}

function SaveSearchDialog({ isOpen, onClose, onSave, existingSearch, searchExists }: SaveSearchDialogProps) {
  const [name, setName] = useState(existingSearch?.name || "")
  const [description, setDescription] = useState("")
  const [error, setError] = useState("")

  const handleSave = () => {
    if (!name.trim()) {
      setError("Search name is required")
      return
    }

    if (!existingSearch && searchExists(name.trim())) {
      setError("A search with this name already exists")
      return
    }

    onSave(name.trim(), description.trim() || undefined)
    setName("")
    setDescription("")
    setError("")
    onClose()
  }

  const handleClose = () => {
    setName(existingSearch?.name || "")
    setDescription("")
    setError("")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{existingSearch ? "Edit Saved Search" : "Save Search"}</DialogTitle>
          <DialogDescription>
            {existingSearch ? "Update the name of your saved search." : "Give your search a name to save it for later."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="search-name">Search Name</Label>
            <Input
              id="search-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setError("")
              }}
              placeholder="Enter search name..."
              className={error ? "border-red-500" : ""}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
          {!existingSearch && (
            <div className="space-y-2">
              <Label htmlFor="search-description">Description (Optional)</Label>
              <Textarea
                id="search-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what this search is for..."
                rows={3}
              />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>{existingSearch ? "Update" : "Save"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function SavedSearchesManager({
  onLoadSearch,
  currentQuery = "",
  currentFilters = {},
  className,
}: SavedSearchesManagerProps) {
  const { searches, saveSearch, updateSearch, deleteSearch, setAsDefault, clearDefault, searchExists } =
    useSavedSearches()
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [editingSearch, setEditingSearch] = useState<SavedSearch | null>(null)
  const [searchFilter, setSearchFilter] = useState("")

  const filteredSearches = searches.filter((search) => search.name.toLowerCase().includes(searchFilter.toLowerCase()))

  const handleSaveCurrentSearch = (name: string, description?: string) => {
    saveSearch({
      name,
      query: currentQuery,
      filters: currentFilters,
    })
  }

  const handleUpdateSearch = (name: string) => {
    if (editingSearch) {
      updateSearch(editingSearch.id, { name })
      setEditingSearch(null)
    }
  }

  const handleLoadSearch = (search: SavedSearch) => {
    onLoadSearch?.(search)
  }

  const handleToggleDefault = (search: SavedSearch) => {
    if (search.isDefault) {
      clearDefault()
    } else {
      setAsDefault(search.id)
    }
  }

  const getFilterSummary = (filters: SavedSearch["filters"]) => {
    const parts: string[] = []
    if (filters.type?.length) parts.push(`${filters.type.length} type${filters.type.length > 1 ? "s" : ""}`)
    if (filters.author?.length) parts.push(`${filters.author.length} author${filters.author.length > 1 ? "s" : ""}`)
    if (filters.dateRange) parts.push("date range")
    if (filters.tags?.length) parts.push(`${filters.tags.length} tag${filters.tags.length > 1 ? "s" : ""}`)
    if (filters.folder) parts.push("folder")
    return parts.join(", ")
  }

  const canSaveCurrentSearch = currentQuery.trim() || Object.keys(currentFilters).length > 0

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BookmarkIcon className="h-5 w-5" />
            Saved Searches
          </CardTitle>
          <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" disabled={!canSaveCurrentSearch}>
                <Plus className="h-4 w-4 mr-2" />
                Save Current
              </Button>
            </DialogTrigger>
            <SaveSearchDialog
              isOpen={saveDialogOpen}
              onClose={() => setSaveDialogOpen(false)}
              onSave={handleSaveCurrentSearch}
              searchExists={searchExists}
            />
          </Dialog>
        </div>
        {searches.length > 3 && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Filter saved searches..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="pl-10"
            />
          </div>
        )}
      </CardHeader>
      <CardContent>
        {searches.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <BookmarkIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">No saved searches yet</p>
            <p className="text-sm">Save your frequently used searches for quick access</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {filteredSearches.map((search) => (
                <div
                  key={search.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium truncate">{search.name}</h4>
                      {search.isDefault && (
                        <Badge variant="secondary" className="text-xs">
                          Default
                        </Badge>
                      )}
                    </div>
                    {search.query && <p className="text-sm text-muted-foreground truncate mb-1">"{search.query}"</p>}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(search.updatedAt).toLocaleDateString()}
                      </span>
                      {Object.keys(search.filters).length > 0 && (
                        <span className="flex items-center gap-1">
                          <Filter className="h-3 w-3" />
                          {getFilterSummary(search.filters)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={() => handleLoadSearch(search)} className="h-8 w-8 p-0">
                      <Search className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleDefault(search)}
                      className="h-8 w-8 p-0"
                    >
                      {search.isDefault ? (
                        <Star className="h-4 w-4 fill-current text-yellow-500" />
                      ) : (
                        <StarOff className="h-4 w-4" />
                      )}
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditingSearch(search)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Rename
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => deleteSearch(search.id)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        {editingSearch && (
          <SaveSearchDialog
            isOpen={!!editingSearch}
            onClose={() => setEditingSearch(null)}
            onSave={handleUpdateSearch}
            existingSearch={editingSearch}
            searchExists={searchExists}
          />
        )}
      </CardContent>
    </Card>
  )
}
