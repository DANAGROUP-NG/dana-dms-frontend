export interface NavigationItem {
    id: string
    label: string
    icon: string
    path: string
    badge?: number
    children?: NavigationItem[]
  }
  
  export interface BreadcrumbItem {
    label: string
    path?: string
  }
  
  export interface QuickAction {
    id: string
    label: string
    icon: string
    action: () => void
  }
  