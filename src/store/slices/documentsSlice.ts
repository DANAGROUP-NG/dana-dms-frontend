import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { Document } from "../../data/mockData"
import type { DocumentFilters, UploadProgress } from "../api/documentsApi"

export interface DocumentsState {
  viewMode: "grid" | "list"
  gridDensity: "compact" | "comfortable" | "spacious"
  selectedDocuments: string[]
  filters: DocumentFilters
  sortBy: "name" | "modified" | "size" | "type"
  sortOrder: "asc" | "desc"
  uploadQueue: UploadProgress[]
  previewDocument: Document | null
  isPreviewOpen: boolean
}

const initialState: DocumentsState = {
  viewMode: "grid",
  gridDensity: "comfortable",
  selectedDocuments: [],
  filters: {},
  sortBy: "modified",
  sortOrder: "desc",
  uploadQueue: [],
  previewDocument: null,
  isPreviewOpen: false,
}

const documentsSlice = createSlice({
  name: "documents",
  initialState,
  reducers: {
    setViewMode: (state, action: PayloadAction<"grid" | "list">) => {
      state.viewMode = action.payload
    },

    setGridDensity: (state, action: PayloadAction<"compact" | "comfortable" | "spacious">) => {
      state.gridDensity = action.payload
    },

    toggleDocumentSelection: (state, action: PayloadAction<string>) => {
      const id = action.payload
      const index = state.selectedDocuments.indexOf(id)
      if (index > -1) {
        state.selectedDocuments.splice(index, 1)
      } else {
        state.selectedDocuments.push(id)
      }
    },

    selectAllDocuments: (state, action: PayloadAction<string[]>) => {
      state.selectedDocuments = action.payload
    },

    clearSelection: (state) => {
      state.selectedDocuments = []
    },

    setFilters: (state, action: PayloadAction<DocumentFilters>) => {
      state.filters = action.payload
    },

    updateFilters: (state, action: PayloadAction<Partial<DocumentFilters>>) => {
      state.filters = { ...state.filters, ...action.payload }
    },

    clearFilters: (state) => {
      state.filters = {}
    },

    setSorting: (state, action: PayloadAction<{ sortBy: string; sortOrder: "asc" | "desc" }>) => {
      state.sortBy = action.payload.sortBy as any
      state.sortOrder = action.payload.sortOrder
    },

    addToUploadQueue: (state, action: PayloadAction<UploadProgress>) => {
      state.uploadQueue.push(action.payload)
    },

    updateUploadProgress: (state, action: PayloadAction<{ id: string; progress: number; status?: string }>) => {
      const upload = state.uploadQueue.find((u) => u.id === action.payload.id)
      if (upload) {
        upload.progress = action.payload.progress
        if (action.payload.status) {
          upload.status = action.payload.status as any
        }
      }
    },

    removeFromUploadQueue: (state, action: PayloadAction<string>) => {
      state.uploadQueue = state.uploadQueue.filter((u) => u.id !== action.payload)
    },

    clearUploadQueue: (state) => {
      state.uploadQueue = []
    },

    openPreview: (state, action: PayloadAction<Document>) => {
      state.previewDocument = action.payload
      state.isPreviewOpen = true
    },

    closePreview: (state) => {
      state.previewDocument = null
      state.isPreviewOpen = false
    },
  },
})

export const {
  setViewMode,
  setGridDensity,
  toggleDocumentSelection,
  selectAllDocuments,
  clearSelection,
  setFilters,
  updateFilters,
  clearFilters,
  setSorting,
  addToUploadQueue,
  updateUploadProgress,
  removeFromUploadQueue,
  clearUploadQueue,
  openPreview,
  closePreview,
} = documentsSlice.actions

export default documentsSlice.reducer
