import { ChevronRight, Home } from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import type { BreadcrumbItem } from "../../types"

const routeLabels: Record<string, string> = {
  "/": "Dashboard",
  "/documents": "Documents",
  "/folders": "Folders",
  "/assignments": "Assignments",
  "/workflows": "Workflows",
  "/audit": "Audit",
}

export function Breadcrumbs() {
  const location = useLocation()
  const pathSegments = location.pathname.split("/").filter(Boolean)

  const breadcrumbs: BreadcrumbItem[] = [{ label: "Home", path: "/" }]

  let currentPath = ""
  for (const segment of pathSegments) {
    currentPath += `/${segment}`
    const label = routeLabels[currentPath] || segment.charAt(0).toUpperCase() + segment.slice(1)
    breadcrumbs.push({ label, path: currentPath })
  }

  // Don't show breadcrumbs for home page
  if (breadcrumbs.length <= 1) {
    return null
  }

  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground">
      {breadcrumbs.map((item, index) => (
        <div key={item.path} className="flex items-center">
          {index > 0 && <ChevronRight className="mx-1 h-4 w-4" />}
          {index === 0 && <Home className="mr-1 h-4 w-4" />}
          {index === breadcrumbs.length - 1 ? (
            <span className="font-medium text-foreground">{item.label}</span>
          ) : (
            <Link to={item.path!} className="hover:text-foreground transition-colors">
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  )
}
