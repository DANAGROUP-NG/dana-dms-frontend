import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

export interface ReportTemplate {
  id: string
  name: string
  description: string
  type: "document-usage" | "user-activity" | "storage-analysis" | "workflow-performance" | "security-audit" | "custom"
  parameters: {
    dateRange: {
      start: string
      end: string
    }
    filters: {
      authors?: string[]
      documentTypes?: string[]
      folders?: string[]
      tags?: string[]
      status?: string[]
    }
    metrics: string[]
    groupBy?: string
    sortBy?: string
    sortOrder?: "asc" | "desc"
  }
  schedule?: {
    enabled: boolean
    frequency: "daily" | "weekly" | "monthly" | "quarterly"
    time: string
    recipients: string[]
  }
  format: "pdf" | "csv" | "excel" | "json"
  createdBy: string
  createdDate: string
  lastModified: string
}

export interface GeneratedReport {
  id: string
  templateId: string
  templateName: string
  status: "generating" | "completed" | "failed"
  progress: number
  generatedDate: string
  generatedBy: string
  fileUrl?: string
  fileSize?: number
  parameters: ReportTemplate["parameters"]
  format: string
  error?: string
}

interface ReportsState {
  templates: ReportTemplate[]
  generatedReports: GeneratedReport[]
  isGenerating: boolean
  currentReport: GeneratedReport | null
}

const initialState: ReportsState = {
  templates: [
    {
      id: "1",
      name: "Monthly Document Usage",
      description: "Comprehensive report on document views, downloads, and shares",
      type: "document-usage",
      parameters: {
        dateRange: { start: "", end: "" },
        filters: {},
        metrics: ["views", "downloads", "shares", "comments"],
        groupBy: "month",
        sortBy: "views",
        sortOrder: "desc",
      },
      format: "pdf",
      createdBy: "System",
      createdDate: new Date().toISOString(),
      lastModified: new Date().toISOString(),
    },
    {
      id: "2",
      name: "User Activity Summary",
      description: "User engagement and activity patterns",
      type: "user-activity",
      parameters: {
        dateRange: { start: "", end: "" },
        filters: {},
        metrics: ["logins", "uploads", "downloads", "collaborations"],
        groupBy: "user",
        sortBy: "activity",
        sortOrder: "desc",
      },
      format: "excel",
      createdBy: "System",
      createdDate: new Date().toISOString(),
      lastModified: new Date().toISOString(),
    },
  ],
  generatedReports: [],
  isGenerating: false,
  currentReport: null,
}

const reportsSlice = createSlice({
  name: "reports",
  initialState,
  reducers: {
    addTemplate: (state, action: PayloadAction<Omit<ReportTemplate, "id" | "createdDate" | "lastModified">>) => {
      const template: ReportTemplate = {
        ...action.payload,
        id: Date.now().toString(),
        createdDate: new Date().toISOString(),
        lastModified: new Date().toISOString(),
      }
      state.templates.push(template)
    },
    updateTemplate: (state, action: PayloadAction<ReportTemplate>) => {
      const index = state.templates.findIndex((t) => t.id === action.payload.id)
      if (index !== -1) {
        state.templates[index] = {
          ...action.payload,
          lastModified: new Date().toISOString(),
        }
      }
    },
    deleteTemplate: (state, action: PayloadAction<string>) => {
      state.templates = state.templates.filter((t) => t.id !== action.payload)
    },
    startReportGeneration: (state, action: PayloadAction<GeneratedReport>) => {
      state.isGenerating = true
      state.currentReport = action.payload
      state.generatedReports.unshift(action.payload)
    },
    updateReportProgress: (state, action: PayloadAction<{ id: string; progress: number }>) => {
      const report = state.generatedReports.find((r) => r.id === action.payload.id)
      if (report) {
        report.progress = action.payload.progress
      }
      if (state.currentReport?.id === action.payload.id) {
        state.currentReport.progress = action.payload.progress
      }
    },
    completeReportGeneration: (state, action: PayloadAction<{ id: string; fileUrl: string; fileSize: number }>) => {
      const report = state.generatedReports.find((r) => r.id === action.payload.id)
      if (report) {
        report.status = "completed"
        report.progress = 100
        report.fileUrl = action.payload.fileUrl
        report.fileSize = action.payload.fileSize
      }
      state.isGenerating = false
      state.currentReport = null
    },
    failReportGeneration: (state, action: PayloadAction<{ id: string; error: string }>) => {
      const report = state.generatedReports.find((r) => r.id === action.payload.id)
      if (report) {
        report.status = "failed"
        report.error = action.payload.error
      }
      state.isGenerating = false
      state.currentReport = null
    },
    deleteGeneratedReport: (state, action: PayloadAction<string>) => {
      state.generatedReports = state.generatedReports.filter((r) => r.id !== action.payload)
    },
  },
})

export const {
  addTemplate,
  updateTemplate,
  deleteTemplate,
  startReportGeneration,
  updateReportProgress,
  completeReportGeneration,
  failReportGeneration,
  deleteGeneratedReport,
} = reportsSlice.actions

export default reportsSlice.reducer
