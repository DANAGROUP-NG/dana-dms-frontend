"use client"
import { BookmarkIcon, Star, Search } from "lucide-react"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { useSavedSearches } from "../../hooks/useSavedSearches"
import type { SavedSearch } from "../../store/slices/savedSearchesSlice"

interface SavedSearchQuickAccessProps {
  onLoadSearch?: (search: SavedSearch) => void
  className?: string
}

export function SavedSearchQuickAccess({ onLoadSearch, className }: SavedSearchQuickAccessProps) {
  const { searches, getDefaultSearch } = useSavedSearches()

  const defaultSearch = getDefaultSearch()
  const recentSearches = searches
    .filter((search) => !search.isDefault)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5)

  const handleLoadSearch = (search: SavedSearch) => {
    onLoadSearch?.(search)
  }

  if (searches.length === 0) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className={className}>
          <BookmarkIcon className="h-4 w-4 mr-2" />
          Saved Searches
          {searches.length > 0 && (
            <Badge variant="secondary" className="ml-2 text-xs">
              {searches.length}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Saved Searches</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {defaultSearch && (
          <>
            <DropdownMenuItem onClick={() => handleLoadSearch(defaultSearch)} className="flex items-center gap-2">
              <Star className="h-4 w-4 fill-current text-yellow-500" />
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{defaultSearch.name}</div>
                {defaultSearch.query && (
                  <div className="text-xs text-muted-foreground truncate">"{defaultSearch.query}"</div>
                )}
              </div>
              <Search className="h-4 w-4 text-muted-foreground" />
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        {recentSearches.length > 0 && (
          <>
            <DropdownMenuLabel className="text-xs text-muted-foreground">Recent</DropdownMenuLabel>
            {recentSearches.map((search) => (
              <DropdownMenuItem
                key={search.id}
                onClick={() => handleLoadSearch(search)}
                className="flex items-center gap-2"
              >
                <BookmarkIcon className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{search.name}</div>
                  {search.query && <div className="text-xs text-muted-foreground truncate">"{search.query}"</div>}
                </div>
                <Search className="h-4 w-4 text-muted-foreground" />
              </DropdownMenuItem>
            ))}
          </>
        )}

        {searches.length === 0 && (
          <div className="px-2 py-4 text-center text-sm text-muted-foreground">No saved searches yet</div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
