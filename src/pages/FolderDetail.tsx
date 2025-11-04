import { useMemo, useRef, useState, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Grid, List, PanelLeft, Plus, Search, Upload, FolderOpen, ArrowLeft } from "lucide-react"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Separator } from "../components/ui/separator"
import { Skeleton } from "../components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../components/ui/sheet"
import { cn } from "../lib/utils"
import { DocumentGrid } from "../components/documents/DocumentGrid"
import { DocumentList } from "../components/documents/DocumentList"
import { BulkActions } from "../components/documents/BulkActions"
import { FolderTree } from "../components/folders/FolderTree"
import { FolderBreadcrumbs } from "../components/documents/FolderBreadcrumbs"
import { useGetFolderQuery, useGetFolderTreeQuery } from "../store/api/foldersApi"
import { useGetDocumentsQuery } from "../store/api/documentsApi"
import type { Document, Folder } from "../data/mockData"
import { mockDocuments, mockFolders } from "../data/mockData"

type ViewMode = "grid" | "list"

export default function FolderDetail() {
  const { id = "" } = useParams()
  const navigate = useNavigate()
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const { data: folder, isLoading: folderLoading, isError: folderError } = useGetFolderQuery(id)
  const { data: folderTree = [], isLoading: treeLoading } = useGetFolderTreeQuery()
  const { data, isLoading: docsLoading, isError: docsError, refetch } = useGetDocumentsQuery(
    {
      page: 1,
      limit: 50,
      filters: { folderId: id, search: searchQuery || undefined },
    },
    { refetchOnMountOrArgChange: true },
  )
  const apiDocuments: Document[] = data?.documents ?? []
  const usingMock = !docsLoading && (docsError || apiDocuments.length === 0)
  const documentsInFolder = useMemo(() => {
    const source = usingMock ? mockDocuments : apiDocuments
    return source.filter((d) => d.folderId === id)
  }, [usingMock, apiDocuments, id])

  // Resolve folder from API or fallback to mock
  const resolvedFolder = useMemo(() => {
    if (folder) return folder
    // fallback to mock when API fails or has no data
    const findFolder = (nodes: Folder[]): Folder | null => {
      for (const n of nodes) {
        if (n.id === id) return n
        if (n.children) {
          const found = findFolder(n.children)
          if (found) return found
        }
      }
      return null
    }
    return findFolder(mockFolders) || null
  }, [folder, id])

  const breadcrumbs = useMemo(() => {
    // Build a lightweight breadcrumb using the tree if available
    const path: { id: string; name: string }[] = []
    const buildPath = (nodes: Folder[], targetId: string, acc: { id: string; name: string }[]): boolean => {
      for (const node of nodes) {
        const next = [...acc, { id: node.id, name: node.name }]
        if (node.id === targetId) {
          path.push(...next)
          return true
        }
        if (node.children && buildPath(node.children, targetId, next)) return true
      }
      return false
    }
    if (folderTree?.length) buildPath(folderTree, id, [])
    if (!path.length && resolvedFolder) path.push({ id: resolvedFolder.id, name: resolvedFolder.name })
    return path
  }, [folderTree, resolvedFolder, id])

  const filteredDocuments = useMemo(() => {
    if (!searchQuery.trim()) return documentsInFolder
    const q = searchQuery.toLowerCase()
    return documentsInFolder.filter((d) =>
      d.name.toLowerCase().includes(q) ||
      d.tags.some((t) => t.toLowerCase().includes(q)) ||
      (d.description?.toLowerCase().includes(q) ?? false),
    )
  }, [documentsInFolder, searchQuery])

  const onSelectDocument = useCallback((docId: string) => {
    setSelectedIds((prev) => (prev.includes(docId) ? prev.filter((x) => x !== docId) : [...prev, docId]))
  }, [])

  const onSelectAll = useCallback((ids: string[]) => {
    setSelectedIds(ids)
  }, [])

  const clearSelection = useCallback(() => setSelectedIds([]), [])

  const onOpenDocument = useCallback((doc: Document) => {
    navigate(`/documents/${doc.id}`)
  }, [navigate])

  const onUploadClick = () => fileInputRef.current?.click()

  const leftSidebar = (
    <div className="p-4 w-72 border-r h-full overflow-auto">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-sm font-medium"><FolderOpen className="h-4 w-4" />Folders</div>
      </div>
      {treeLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-6" />
          <Skeleton className="h-6" />
          <Skeleton className="h-6" />
        </div>
      ) : (
        <FolderTree
          folders={folderTree}
          currentFolderId={id}
          expandedFolders={[]}
          onFolderSelect={(folderId) => navigate(`/folders/${folderId}`)}
          onFolderExpand={() => {}}
          onFolderCreate={() => {}}
          onFolderContextMenu={() => {}}
        />
      )}
    </div>
  )

  const header = (
    <div className="flex items-center justify-between">
      <div className="min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-semibold tracking-tight truncate">{resolvedFolder?.name ?? "Folder"}</h1>
        </div>
        <FolderBreadcrumbs
          items={breadcrumbs.map((b) => ({ id: b.id, label: b.name }))}
          onNavigate={(folderId) => navigate(`/folders/${folderId}`)}
        />
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={onUploadClick}>
          <Upload className="mr-2 h-4 w-4" /> Upload
        </Button>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> New
        </Button>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden" aria-label="Toggle folders">
              <PanelLeft className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-80">
            <SheetHeader className="px-4 py-3 border-b">
              <SheetTitle>Folders</SheetTitle>
            </SheetHeader>
            {leftSidebar}
          </SheetContent>
        </Sheet>
        <Button variant="ghost" size="icon" className="hidden md:inline-flex" onClick={() => setSidebarOpen((v) => !v)} aria-label="Toggle folders">
          <PanelLeft className={cn("h-5 w-5", sidebarOpen && "text-primary")} />
        </Button>
      </div>
    </div>
  )

  const toolbar = (
    <div className="flex flex-col md:flex-row md:items-center gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search in this folder..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8"
        />
      </div>
      <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
        <TabsList>
          <TabsTrigger value="grid"><Grid className="h-4 w-4 mr-2" />Grid</TabsTrigger>
          <TabsTrigger value="list"><List className="h-4 w-4 mr-2" />List</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  )

  return (
    <div className="flex h-full">
      {/* Desktop sidebar */}
      {sidebarOpen && (
        <div className="hidden md:block h-full">{leftSidebar}</div>
      )}
      {/* Main content */}
      <div className="flex-1 p-4 md:p-6 space-y-4">
        {header}
        <Separator />
        {toolbar}
        {selectedIds.length > 0 && (
          <BulkActions
            selectedCount={selectedIds.length}
            onClearSelection={clearSelection}
            onDeleteSelected={() => {}}
            onMoveSelected={() => {}}
            onDownloadSelected={() => {}}
          />
        )}

        {/* Hidden file input for uploads */}
        <input ref={fileInputRef} type="file" multiple className="hidden" />

        {folderLoading || docsLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-36" />
            ))}
          </div>
        ) : (!resolvedFolder) ? (
          <Alert variant="destructive">
            <AlertTitle>Could not load folder</AlertTitle>
            <AlertDescription>
              There was an issue loading this folder. <Button variant="link" onClick={() => refetch()}>Try again</Button>
            </AlertDescription>
          </Alert>
        ) : filteredDocuments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FolderOpen className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-lg font-medium">No documents found</p>
            <p className="text-muted-foreground">Try adjusting your search or upload a new document</p>
            <div className="mt-4 flex items-center gap-2">
              <Button onClick={onUploadClick}><Upload className="mr-2 h-4 w-4" />Upload</Button>
              <Button variant="outline" onClick={() => setSearchQuery("")}>Clear search</Button>
            </div>
          </div>
        ) : (
          <div>
            {viewMode === "grid" ? (
              <DocumentGrid
                documents={filteredDocuments}
                selectedIds={selectedIds}
                onSelectDocument={onSelectDocument}
                onOpenDocument={onOpenDocument}
              />
            ) : (
              <DocumentList
                documents={filteredDocuments}
                selectedDocuments={selectedIds}
                onSelectDocument={onSelectDocument}
                onSelectAll={(ids) => onSelectAll(ids)}
                onPreview={onOpenDocument}
                onDownload={() => {}}
                onShare={() => {}}
                onDelete={() => {}}
                onEdit={() => {}}
                onSort={() => {}}
                sortBy="name"
                sortOrder="asc"
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}


