import { apiSlice } from "./apiSlice"
import type { Document } from "../../data/mockData"

export interface DocumentFilters {
  search?: string
  type?: string
  status?: string
  tags?: string[]
  dateRange?: {
    start: string
    end: string
  }
  folderId?: string
}

export interface DocumentsResponse {
  documents: Document[]
  total: number
  page: number
  limit: number
}

export interface UploadProgress {
  id: string
  name: string
  progress: number
  status: "uploading" | "completed" | "error"
  error?: string
}

export const documentsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDocuments: builder.query<
      DocumentsResponse,
      {
        page?: number
        limit?: number
        filters?: DocumentFilters
      }
    >({
      query: ({ page = 1, limit = 20, filters = {} }) => ({
        url: "/documents",
        params: { page, limit, ...filters },
      }),
      providesTags: ["Document"],
    }),

    getDocument: builder.query<Document, string>({
      query: (id) => `/documents/${id}`,
      providesTags: (result, error, id) => [{ type: "Document", id }],
    }),

    uploadDocument: builder.mutation<Document, FormData>({
      query: (formData) => ({
        url: "/documents/upload",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Document"],
    }),

    updateDocument: builder.mutation<Document, { id: string; updates: Partial<Document> }>({
      query: ({ id, updates }) => ({
        url: `/documents/${id}`,
        method: "PATCH",
        body: updates,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Document", id }],
    }),

    deleteDocument: builder.mutation<void, string>({
      query: (id) => ({
        url: `/documents/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Document"],
    }),

    bulkDeleteDocuments: builder.mutation<void, string[]>({
      query: (ids) => ({
        url: "/documents/bulk-delete",
        method: "POST",
        body: { ids },
      }),
      invalidatesTags: ["Document"],
    }),

    moveDocuments: builder.mutation<void, { ids: string[]; folderId: string }>({
      query: ({ ids, folderId }) => ({
        url: "/documents/move",
        method: "POST",
        body: { ids, folderId },
      }),
      invalidatesTags: ["Document"],
    }),

    getDocumentPreview: builder.query<{ url: string; type: string }, string>({
      query: (id) => `/documents/${id}/preview`,
    }),
  }),
})

export const {
  useGetDocumentsQuery,
  useGetDocumentQuery,
  useUploadDocumentMutation,
  useUpdateDocumentMutation,
  useDeleteDocumentMutation,
  useBulkDeleteDocumentsMutation,
  useMoveDocumentsMutation,
  useGetDocumentPreviewQuery,
} = documentsApi
