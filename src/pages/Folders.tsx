import { Folder, Plus, MoreHorizontal } from "lucide-react"
import { Button } from "../components/ui/button"
import { Card, CardContent } from "../components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu"

const mockFolders = [
  {
    id: "1",
    name: "Financial Reports",
    documentCount: 24,
    modified: "2024-01-15",
    color: "blue",
  },
  {
    id: "2",
    name: "Marketing Materials",
    documentCount: 18,
    modified: "2024-01-14",
    color: "green",
  },
  {
    id: "3",
    name: "HR Documents",
    documentCount: 32,
    modified: "2024-01-13",
    color: "purple",
  },
  {
    id: "4",
    name: "Project Files",
    documentCount: 45,
    modified: "2024-01-12",
    color: "orange",
  },
]

export function Folders() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Folders</h1>
          <p className="text-muted-foreground">Organize your documents into folders</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Folder
        </Button>
      </div>

      {/* Folders Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {mockFolders.map((folder) => (
          <Card key={folder.id} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Folder className={`h-8 w-8 text-${folder.color}-500`} />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Rename</DropdownMenuItem>
                      <DropdownMenuItem>Share</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div>
                  <h3 className="font-medium">{folder.name}</h3>
                  <p className="text-sm text-muted-foreground">{folder.documentCount} documents</p>
                  <p className="text-xs text-muted-foreground">Modified {folder.modified}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
