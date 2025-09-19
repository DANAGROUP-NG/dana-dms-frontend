"use client"

import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import type { RootState } from "../../store"
import { addTemplate, startReportGeneration } from "../../store/slices/reportsSlice"
import type { ReportTemplate, GeneratedReport } from "../../store/slices/reportsSlice"
import { Button } from "../ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Textarea } from "../ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Checkbox } from "../ui/checkbox"
import { Badge } from "../ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog"
import { Progress } from "../ui/progress"
import { format } from "date-fns"
import {
  FileText,
  Download,
  Clock,
  Users,
  BarChart3,
  Settings,
  Play,
  Trash2,
  Edit,
  Copy,
  Filter,
  FileSpreadsheet,
} from "lucide-react"

const REPORT_TYPES = [
  { value: "document-usage", label: "Document Usage", icon: FileText },
  { value: "user-activity", label: "User Activity", icon: Users },
  { value: "storage-analysis", label: "Storage Analysis", icon: BarChart3 },
  { value: "workflow-performance", label: "Workflow Performance", icon: Clock },
  { value: "security-audit", label: "Security Audit", icon: Settings },
  { value: "custom", label: "Custom Report", icon: Filter },
]

const METRICS_OPTIONS = {
  "document-usage": ["views", "downloads", "shares", "comments", "versions", "collaborators"],
  "user-activity": ["logins", "uploads", "downloads", "collaborations", "time-spent", "documents-created"],
  "storage-analysis": ["total-size", "file-types", "folder-distribution", "growth-rate", "duplicate-files"],
  "workflow-performance": ["approval-time", "bottlenecks", "completion-rate", "step-duration"],
  "security-audit": ["permissions", "access-logs", "sharing-activity", "failed-attempts"],
  custom: ["views", "downloads", "shares", "comments", "uploads", "collaborations"],
}

const FORMAT_OPTIONS = [
  { value: "pdf", label: "PDF", icon: FileText },
  { value: "excel", label: "Excel", icon: FileSpreadsheet },
  { value: "csv", label: "CSV", icon: FileText },
  { value: "json", label: "JSON", icon: FileText },
]

export default function ReportGenerationInterface() {
  const dispatch = useDispatch()
  const { templates, generatedReports, isGenerating, currentReport } = useSelector((state: RootState) => state.reports)

  const [activeTab, setActiveTab] = useState("templates")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<ReportTemplate | null>(null)
  const [newTemplate, setNewTemplate] = useState<Partial<ReportTemplate>>({
    name: "",
    description: "",
    type: "document-usage",
    parameters: {
      dateRange: { start: "", end: "" },
      filters: {},
      metrics: [],
      groupBy: "month",
      sortBy: "views",
      sortOrder: "desc",
    },
    format: "pdf",
    createdBy: "Current User",
  })

  const handleCreateTemplate = () => {
    if (newTemplate.name && newTemplate.type) {
      dispatch(addTemplate(newTemplate as Omit<ReportTemplate, "id" | "createdDate" | "lastModified">))
      setNewTemplate({
        name: "",
        description: "",
        type: "document-usage",
        parameters: {
          dateRange: { start: "", end: "" },
          filters: {},
          metrics: [],
          groupBy: "month",
          sortBy: "views",
          sortOrder: "desc",
        },
        format: "pdf",
        createdBy: "Current User",
      })
      setIsCreateDialogOpen(false)
    }
  }

  const handleGenerateReport = (template: ReportTemplate) => {
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

    // Simulate report generation progress
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 20
      if (progress >= 100) {
        progress = 100
        clearInterval(interval)
        // Simulate completion after progress reaches 100%
        setTimeout(() => {
          dispatch({
            type: "reports/completeReportGeneration",
            payload: {
              id: report.id,
              fileUrl: `/reports/${report.id}.${template.format}`,
              fileSize: Math.floor(Math.random() * 5000000) + 100000,
            },
          })
        }, 1000)
      }
      dispatch({
        type: "reports/updateReportProgress",
        payload: { id: report.id, progress: Math.min(progress, 100) },
      })
    }, 500)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Report Generation</h1>
          <p className="text-muted-foreground">Create and manage document management reports</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <FileText className="mr-2 h-4 w-4" />
              Create Report Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Report Template</DialogTitle>
              <DialogDescription>Configure a new report template with custom parameters and filters.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Report Name</Label>
                  <Input
                    id="name"
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                    placeholder="Monthly Usage Report"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Report Type</Label>
                  <Select
                    value={newTemplate.type}
                    onValueChange={(value) =>
                      setNewTemplate({
                        ...newTemplate,
                        type: value as ReportTemplate["type"],
                        parameters: {
                          ...newTemplate.parameters!,
                          metrics: [],
                        },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {REPORT_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center">
                            <type.icon className="mr-2 h-4 w-4" />
                            {type.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newTemplate.description}
                  onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                  placeholder="Describe what this report will analyze..."
                />
              </div>

              <div className="space-y-2">
                <Label>Metrics to Include</Label>
                <div className="grid grid-cols-2 gap-2">
                  {METRICS_OPTIONS[newTemplate.type as keyof typeof METRICS_OPTIONS]?.map((metric) => (
                    <div key={metric} className="flex items-center space-x-2">
                      <Checkbox
                        id={metric}
                        checked={newTemplate.parameters?.metrics.includes(metric)}
                        onCheckedChange={(checked) => {
                          const currentMetrics = newTemplate.parameters?.metrics || []
                          const updatedMetrics = checked
                            ? [...currentMetrics, metric]
                            : currentMetrics.filter((m) => m !== metric)
                          setNewTemplate({
                            ...newTemplate,
                            parameters: {
                              ...newTemplate.parameters!,
                              metrics: updatedMetrics,
                            },
                          })
                        }}
                      />
                      <Label htmlFor={metric} className="text-sm capitalize">
                        {metric.replace("-", " ")}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="format">Export Format</Label>
                  <Select
                    value={newTemplate.format}
                    onValueChange={(value) =>
                      setNewTemplate({ ...newTemplate, format: value as ReportTemplate["format"] })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FORMAT_OPTIONS.map((format) => (
                        <SelectItem key={format.value} value={format.value}>
                          <div className="flex items-center">
                            <format.icon className="mr-2 h-4 w-4" />
                            {format.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="groupBy">Group By</Label>
                  <Select
                    value={newTemplate.parameters?.groupBy}
                    onValueChange={(value) =>
                      setNewTemplate({
                        ...newTemplate,
                        parameters: { ...newTemplate.parameters!, groupBy: value },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="day">Day</SelectItem>
                      <SelectItem value="week">Week</SelectItem>
                      <SelectItem value="month">Month</SelectItem>
                      <SelectItem value="quarter">Quarter</SelectItem>
                      <SelectItem value="year">Year</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="document">Document</SelectItem>
                      <SelectItem value="folder">Folder</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateTemplate}>Create Template</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="templates">Report Templates</TabsTrigger>
          <TabsTrigger value="generated">Generated Reports</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => {
              const TypeIcon = REPORT_TYPES.find((t) => t.value === template.type)?.icon || FileText
              return (
                <Card key={template.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <TypeIcon className="h-5 w-5" />
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                      </div>
                      <Badge variant="secondary">{template.format.toUpperCase()}</Badge>
                    </div>
                    <CardDescription>{template.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-1">
                        {template.parameters.metrics.slice(0, 3).map((metric) => (
                          <Badge key={metric} variant="outline" className="text-xs">
                            {metric.replace("-", " ")}
                          </Badge>
                        ))}
                        {template.parameters.metrics.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{template.parameters.metrics.length - 3} more
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>Group by: {template.parameters.groupBy}</span>
                        <span>Modified: {format(new Date(template.lastModified), "MMM dd")}</span>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" onClick={() => handleGenerateReport(template)} disabled={isGenerating}>
                          <Play className="mr-1 h-3 w-3" />
                          Generate
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="mr-1 h-3 w-3" />
                          Edit
                        </Button>
                        <Button size="sm" variant="outline">
                          <Copy className="mr-1 h-3 w-3" />
                          Clone
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="generated" className="space-y-4">
          {currentReport && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 animate-spin" />
                  <span>Generating: {currentReport.templateName}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{Math.round(currentReport.progress)}%</span>
                  </div>
                  <Progress value={currentReport.progress} />
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
            {generatedReports.map((report) => (
              <Card key={report.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h3 className="font-semibold">{report.templateName}</h3>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>Generated: {format(new Date(report.generatedDate), "MMM dd, yyyy HH:mm")}</span>
                        <span>By: {report.generatedBy}</span>
                        <span>Format: {report.format.toUpperCase()}</span>
                        {report.fileSize && <span>Size: {formatFileSize(report.fileSize)}</span>}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {report.status === "generating" && (
                        <Badge variant="secondary">
                          <Clock className="mr-1 h-3 w-3 animate-spin" />
                          Generating ({Math.round(report.progress)}%)
                        </Badge>
                      )}
                      {report.status === "completed" && (
                        <>
                          <Badge variant="default">Completed</Badge>
                          <Button size="sm">
                            <Download className="mr-1 h-3 w-3" />
                            Download
                          </Button>
                        </>
                      )}
                      {report.status === "failed" && <Badge variant="destructive">Failed</Badge>}
                      <Button size="sm" variant="outline">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Reports</CardTitle>
              <CardDescription>Manage automated report generation schedules</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">No scheduled reports configured yet.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
