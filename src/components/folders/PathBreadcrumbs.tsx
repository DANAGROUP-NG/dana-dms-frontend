"use client"

import { ChevronRight, Home } from "lucide-react"

interface PathBreadcrumbsProps {
  path: Array<{ id: string; name: string; path: string }>
  onNavigate?: (folderId: string | null) => void
}

export default function PathBreadcrumbs({ path, onNavigate }: PathBreadcrumbsProps) {
  if (!path || path.length === 0) return null

  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground">
      <button className="flex items-center hover:text-foreground" onClick={() => onNavigate?.(null)}>
        <Home className="mr-1 h-4 w-4" />
        <span>Home</span>
      </button>
      {path.map((item, index) => (
        <div key={item.id} className="flex items-center">
          <ChevronRight className="mx-1 h-4 w-4" />
          {index === path.length - 1 ? (
            <span className="font-medium text-foreground">{item.name}</span>
          ) : (
            <button className="hover:text-foreground" onClick={() => onNavigate?.(item.id)}>
              {item.name}
            </button>
          )}
        </div>
      ))}
    </nav>
  )
}


