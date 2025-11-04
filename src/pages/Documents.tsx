import { useCallback, useMemo, useRef, useState } from "react"
import { Grid, List, Plus, Search, Upload, X, PanelLeft } from "lucide-react"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Separator } from "../components/ui/separator"
//
import { DocumentList } from "../components/documents/DocumentList"
import { DocumentGrid } from "../components/documents/DocumentGrid"
import { BulkActions } from "../components/documents/BulkActions"
import { useFolderMover } from "../hooks/useFolderMover"
import { cn } from "../lib/utils"
import type { Document, Folder } from "../data/mockData"
import { mockDocuments, mockFolders } from "../data/mockData"
import { useGetDocumentsQuery } from "../store/api/documentsApi"
import { Skeleton } from "../components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../components/ui/sheet"

type ViewMode = "grid" | "list"

export function Documents() {
  const [currentFolderId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const { isOpen: moverOpen, closeMover, moveMultiple } = useFolderMover()

  const allFolders: Folder[] = mockFolders
  const { data, isLoading, isError, refetch } = useGetDocumentsQuery(
    {
      page: 1,
      limit: 50,
      filters: {
        search: searchQuery || undefined,
        type: typeFilter !== "all" ? typeFilter : undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        folderId: currentFolderId || undefined,
      },
    },
    { refetchOnMountOrArgChange: true },
  )
  const apiDocuments = data?.documents ?? []
  const usingMock = !isLoading && (isError || apiDocuments.length === 0)
  const allDocuments: Document[] = usingMock ? mockDocuments : apiDocuments

  const documentsInScope = useMemo(() => {
    let docs = allDocuments
    if (currentFolderId) {
      docs = docs.filter((d) => d.folderId === currentFolderId)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      docs = docs.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.tags.some((t) => t.toLowerCase().includes(q)) ||
          (d.description?.toLowerCase().includes(q) ?? false),
      )
    }
    if (typeFilter !== "all") {
      docs = docs.filter((d) => d.type === typeFilter)
    }
    if (statusFilter !== "all") {
      docs = docs.filter((d) => d.status === statusFilter)
    }
    return docs
  }, [allDocuments, currentFolderId, searchQuery, typeFilter, statusFilter])

  const selectedDocuments = useMemo(
    () => documentsInScope.filter((d) => selectedIds.includes(d.id)),
    [documentsInScope, selectedIds],
  )

  const handleSelectDocument = useCallback((id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }, [])

  const handleSelectAll = useCallback((ids: string[]) => {
    setSelectedIds(ids)
  }, [])

  const clearSelection = useCallback(() => setSelectedIds([]), [])

  const handleBulkOperation = useCallback(
    (operation: string, data?: any) => {
      if (operation === "move") {
        moveMultiple([], selectedDocuments, "move")
        return
      }
      if (operation === "download") {
        // Simulate download
        console.log("Downloading:", selectedDocuments.map((d) => d.name))
        return
      }
      if (operation === "archive") {
        console.log("Archiving:", selectedDocuments.map((d) => d.name))
        clearSelection()
        return
      }
      if (operation === "delete") {
        console.log("Deleting:", selectedDocuments.map((d) => d.name))
        clearSelection()
        return
      }
      if (operation === "tag") {
        console.log("Tagging with:", data)
        return
      }
      if (operation === "share") {
        console.log("Sharing:", selectedDocuments.map((d) => d.name))
        return
      }
    },
    [clearSelection, moveMultiple, selectedDocuments],
  )

  const onUploadClick = useCallback(() => fileInputRef.current?.click(), [])
  const onFilesChosen = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    console.log("Uploading files:", Array.from(files).map((f) => f.name))
    e.target.value = ""
  }, [])

  return (
    <div className="flex h-full gap-4">

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header / Controls */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="lg:hidden">
                  <PanelLeft className="h-4 w-4 mr-1" /> Browse Folders
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] p-0">
                <SheetHeader className="p-4 pb-0">
                  <SheetTitle>Folders</SheetTitle>
                </SheetHeader>
              </SheetContent>
            </Sheet>
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                aria-label="Search documents"
                placeholder="Search documents, tags, descriptions..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="docx">DOCX</SelectItem>
                <SelectItem value="pptx">PPTX</SelectItem>
                <SelectItem value="xlsx">XLSX</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="review">In review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center rounded-md border">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                className={cn("gap-1", viewMode === "grid" && "bg-primary text-primary-foreground")}
                onClick={() => setViewMode("grid")}
                aria-pressed={viewMode === "grid"}
              >
                <Grid className="h-4 w-4" /> Grid
              </Button>
              <Separator orientation="vertical" className="h-5" />
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                className={cn("gap-1", viewMode === "list" && "bg-primary text-primary-foreground")}
                onClick={() => setViewMode("list")}
                aria-pressed={viewMode === "list"}
              >
                <List className="h-4 w-4" /> List
              </Button>
            </div>
            <input ref={fileInputRef} type="file" multiple className="hidden" onChange={onFilesChosen} />
            <Button onClick={onUploadClick}>
              <Upload className="h-4 w-4 mr-2" /> Upload
            </Button>
            <Button variant="default">
              <Plus className="h-4 w-4 mr-2" /> New
            </Button>
          </div>
        </div>

        {/* Bulk actions */}
        <div className="mt-3">
          <BulkActions
            selectedDocuments={selectedDocuments}
            folders={allFolders}
            onClearSelection={clearSelection}
            onBulkOperation={handleBulkOperation}
          />
        </div>

        {/* Connection/Mock notice */}
        {usingMock && (
          <div className="mt-3">
            <Alert>
              <AlertTitle>Showing demo data</AlertTitle>
              <AlertDescription>
                We couldn't load live documents right now. You can continue exploring with demo data.
                <Button variant="outline" size="sm" className="ml-2" onClick={() => refetch()}>
                  Try again
                </Button>
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Content */}
        <div className="mt-4 min-h-0 flex-1">
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)} className="h-full">
            <TabsList className="sr-only">
              <TabsTrigger value="grid">Grid</TabsTrigger>
              <TabsTrigger value="list">List</TabsTrigger>
            </TabsList>
            <TabsContent value="grid" className="mt-0 h-full">
              {isLoading ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="border rounded-md p-4">
                      <div className="flex items-start gap-3">
                        <Skeleton className="h-12 w-12 rounded" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-2/3" />
                          <Skeleton className="h-3 w-1/2" />
                          <div className="flex gap-2">
                            <Skeleton className="h-4 w-12" />
                            <Skeleton className="h-4 w-10" />
                            <Skeleton className="h-4 w-14" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : documentsInScope.length === 0 ? (
                <div className="h-full grid place-items-center text-center p-10 border rounded-md">
                  <div>
                    <div className="text-xl font-semibold">No documents found</div>
                    <p className="text-muted-foreground mt-1">Try adjusting filters or upload new documents.</p>
                  </div>
                </div>
              ) : (
                <DocumentGrid
                  documents={documentsInScope}
                  selectedIds={selectedIds}
                  onSelectDocument={handleSelectDocument}
                  onOpenDocument={(d) => console.log("open", d)}
                />
              )}
            </TabsContent>
            <TabsContent value="list" className="mt-0 h-full">
              {isLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="border rounded-md p-3">
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  ))}
                </div>
              ) : (
                <DocumentList
                  documents={documentsInScope}
                  selectedDocuments={selectedIds}
                  onSelectDocument={handleSelectDocument}
                  onSelectAll={(ids) => handleSelectAll(ids)}
                  onPreview={(d) => console.log("preview", d)}
                  onDownload={(d) => console.log("download", d)}
                  onShare={(d) => console.log("share", d)}
                  onDelete={(d) => console.log("delete", d)}
                  onEdit={(d) => console.log("edit", d)}
                  onSort={() => {}}
                  sortBy={"modified"}
                  sortOrder={"desc"}
                />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Minimal mover portal toggled by hook to avoid unused warnings */}
      {moverOpen && (
        <div className="sr-only" onClick={closeMover} aria-hidden>
          mover-open
        </div>
      )}
    </div>
  )
}


