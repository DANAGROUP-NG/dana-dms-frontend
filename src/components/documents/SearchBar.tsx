"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Search, X, Clock, FileText, User, Tag } from "lucide-react"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { Card, CardContent } from "../ui/card"
import { Badge } from "../ui/badge"
import { cn } from "../../lib/utils"
import type { Document } from "../../data/mockData"

interface SearchSuggestion {
  id: string
  type: "document" | "author" | "tag" | "recent"
  title: string
  subtitle?: string
  icon: React.ComponentType<{ className?: string }>
}

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  onFocus?: () => void
  onBlur?: () => void
  placeholder?: string
  documents?: Document[]
  recentSearches?: string[]
  className?: string
}

export function SearchBar({
  value,
  onChange,
  onFocus,
  onBlur,
  placeholder = "Search documents...",
  documents = [],
  recentSearches = [],
  className,
}: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!value.trim()) {
      // Show recent searches when no query
      const recentSuggestions: SearchSuggestion[] = recentSearches.slice(0, 5).map((search, index) => ({
        id: `recent-${index}`,
        type: "recent",
        title: search,
        icon: Clock,
      }))
      setSuggestions(recentSuggestions)
      return
    }

    // Generate suggestions based on query
    const query = value.toLowerCase()
    const newSuggestions: SearchSuggestion[] = []

    // Document name matches
    const documentMatches = documents
      .filter((doc) => doc.name.toLowerCase().includes(query))
      .slice(0, 3)
      .map((doc) => ({
        id: `doc-${doc.id}`,
        type: "document" as const,
        title: doc.name,
        subtitle: `${doc.size} • ${doc.author}`,
        icon: FileText,
      }))

    // Author matches
    const authors = Array.from(new Set(documents.map((doc) => doc.author)))
    const authorMatches = authors
      .filter((author) => author.toLowerCase().includes(query))
      .slice(0, 2)
      .map((author, index) => ({
        id: `author-${index}`,
        type: "author" as const,
        title: author,
        subtitle: "Author",
        icon: User,
      }))

    // Tag matches
    const allTags = Array.from(new Set(documents.flatMap((doc) => doc.tags)))
    const tagMatches = allTags
      .filter((tag) => tag.toLowerCase().includes(query))
      .slice(0, 3)
      .map((tag, index) => ({
        id: `tag-${index}`,
        type: "tag" as const,
        title: tag,
        subtitle: "Tag",
        icon: Tag,
      }))

    newSuggestions.push(...documentMatches, ...authorMatches, ...tagMatches)
    setSuggestions(newSuggestions.slice(0, 8))
  }, [value, documents, recentSearches])

  const handleFocus = () => {
    setIsFocused(true)
    onFocus?.()
  }

  const handleBlur = (e: React.FocusEvent) => {
    // Don't blur if clicking on suggestions
    if (suggestionsRef.current?.contains(e.relatedTarget as Node)) {
      return
    }
    setIsFocused(false)
    onBlur?.()
  }

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    if (suggestion.type === "recent" || suggestion.type === "tag" || suggestion.type === "author") {
      onChange(suggestion.title)
    } else if (suggestion.type === "document") {
      onChange(suggestion.title)
    }
    setIsFocused(false)
    inputRef.current?.blur()
  }

  const clearSearch = () => {
    onChange("")
    inputRef.current?.focus()
  }

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          className="pl-10 pr-10"
        />
        {value && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 p-0 hover:bg-muted"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {isFocused && suggestions.length > 0 && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-1 shadow-lg">
          <CardContent className="p-0" ref={suggestionsRef}>
            <div className="max-h-80 overflow-y-auto">
              {suggestions.map((suggestion) => {
                const Icon = suggestion.icon
                return (
                  <button
                    key={suggestion.id}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="flex w-full items-center gap-3 p-3 text-left hover:bg-muted transition-colors"
                  >
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{suggestion.title}</p>
                      {suggestion.subtitle && (
                        <p className="text-sm text-muted-foreground truncate">{suggestion.subtitle}</p>
                      )}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {suggestion.type}
                    </Badge>
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
