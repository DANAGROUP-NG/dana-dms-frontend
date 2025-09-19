import { useSelector, useDispatch } from "react-redux"
import type { RootState } from "../store"
import {
  addTemplate,
  updateTemplate,
  deleteTemplate,
  startReportGeneration,
  completeReportGeneration,
  failReportGeneration,
  deleteGeneratedReport,
} from "../store/slices/reportsSlice"
import type { ReportTemplate, GeneratedReport } from "../store/slices/reportsSlice"

export const useReports = () => {
  const dispatch = useDispatch()
  const { templates, generatedReports, isGenerating, currentReport } = useSelector((state: RootState) => state.reports)

  const createTemplate = (template: Omit<ReportTemplate, "id" | "createdDate" | "lastModified">) => {
    dispatch(addTemplate(template))
  }

  const editTemplate = (template: ReportTemplate) => {
    dispatch(updateTemplate(template))
  }

  const removeTemplate = (templateId: string) => {
    dispatch(deleteTemplate(templateId))
  }

  const generateReport = async (template: ReportTemplate) => {
    const report: GeneratedReport = {
      id: Date.now().toString(),
      templateId: template.id,
      templateName: template.name,
      status: "generating",
      progress: 0,
      generatedDate: new Date().toISOString(),
      generatedBy: "Current User",
      parameters: template.parameters,
      format: template.format,
    }

    dispatch(startReportGeneration(report))

    try {
      // Simulate API call for report generation
      await new Promise((resolve) => {
        let progress = 0
        const interval = setInterval(() => {
          progress += Math.random() * 15 + 5
          if (progress >= 100) {
            progress = 100
            clearInterval(interval)
            resolve(undefined)
          }
          dispatch({
            type: "reports/updateReportProgress",
            payload: { id: report.id, progress: Math.min(progress, 100) },
          })
        }, 300)
      })

      // Complete the report
      dispatch(
        completeReportGeneration({
          id: report.id,
          fileUrl: `/api/reports/${report.id}/download`,
          fileSize: Math.floor(Math.random() * 5000000) + 100000,
        }),
      )

      return report
    } catch (error) {
      dispatch(
        failReportGeneration({
          id: report.id,
          error: error instanceof Error ? error.message : "Unknown error occurred",
        }),
      )
      throw error
    }
  }

  const downloadReport = (reportId: string) => {
    const report = generatedReports.find((r) => r.id === reportId)
    if (report?.fileUrl) {
      // Create download link
      const link = document.createElement("a")
      link.href = report.fileUrl
      link.download = `${report.templateName}.${report.format}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const removeGeneratedReport = (reportId: string) => {
    dispatch(deleteGeneratedReport(reportId))
  }

  const getReportsByTemplate = (templateId: string) => {
    return generatedReports.filter((report) => report.templateId === templateId)
  }

  const getRecentReports = (limit = 10) => {
    return generatedReports
      .sort((a, b) => new Date(b.generatedDate).getTime() - new Date(a.generatedDate).getTime())
      .slice(0, limit)
  }

  return {
    templates,
    generatedReports,
    isGenerating,
    currentReport,
    createTemplate,
    editTemplate,
    removeTemplate,
    generateReport,
    downloadReport,
    removeGeneratedReport,
    getReportsByTemplate,
    getRecentReports,
  }
}
