"use client"

import { useState } from "react"
import { Shield, Download, Filter, FileDown } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { AuditDashboard } from "../components/audit/AuditDashboard"
import { AuditEventList } from "../components/audit/AuditEventList"
import { AuditEventDetail } from "../components/audit/AuditEventDetail"
import { AuditFilters } from "../components/audit/AuditFilters"
import { ComplianceViolations } from "../components/audit/ComplianceViolations"
import { 
  mockAuditEvents, 
  mockAuditSummary, 
  mockAuditChartData, 
  mockComplianceViolations 
} from "../data/mockAudit"
import type { AuditEvent, AuditFilters as AuditFiltersType } from "../types/audit"

export function Audit() {
  const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [filters, setFilters] = useState<AuditFiltersType>({})

  const handleEventClick = (event: AuditEvent) => {
    setSelectedEvent(event)
    setIsDetailOpen(true)
  }

  const handleCloseDetail = () => {
    setIsDetailOpen(false)
    setSelectedEvent(null)
  }

  const handleResetFilters = () => {
    setFilters({})
  }

  const filteredEvents = mockAuditEvents.filter(event => {
    if (filters.actorType && event.actorType !== filters.actorType) return false
    if (filters.action && event.action !== filters.action) return false
    if (filters.targetType && event.targetType !== filters.targetType) return false
    if (filters.result && event.result !== filters.result) return false
    if (filters.startDate && new Date(event.timestamp) < new Date(filters.startDate)) return false
    if (filters.endDate && new Date(event.timestamp) > new Date(filters.endDate)) return false
    if (filters.search) {
      const search = filters.search.toLowerCase()
      return (
        event.actorName.toLowerCase().includes(search) ||
        event.action.toLowerCase().includes(search) ||
        event.targetName?.toLowerCase().includes(search)
      )
    }
    return true
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audit & Compliance</h1>
          <p className="text-muted-foreground">
            View audit logs, monitor compliance violations, and track document access history
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Main Content with Tabs */}
      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="events">Event Logs</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          <AuditDashboard summary={mockAuditSummary} chartData={mockAuditChartData} />
        </TabsContent>

        {/* Event Logs Tab */}
        <TabsContent value="events" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Filters Sidebar */}
            <div className="lg:col-span-1">
              <AuditFilters
                filters={filters}
                onFiltersChange={setFilters}
                onReset={handleResetFilters}
              />
            </div>

            {/* Events List */}
            <div className="lg:col-span-3">
              <AuditEventList
                events={filteredEvents}
                onEventClick={handleEventClick}
              />
            </div>
          </div>
        </TabsContent>

        {/* Compliance Tab */}
        <TabsContent value="compliance" className="space-y-6">
          <ComplianceViolations
            violations={mockComplianceViolations}
            onResolve={(id) => {
              console.log("Resolve violation:", id)
            }}
            onAssign={(id, userId) => {
              console.log("Assign violation:", id, userId)
            }}
          />
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileDown className="h-5 w-5" />
                  Generate Full Report
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Generate a comprehensive audit report with all events, filters, and compliance metrics.
                </p>
                <Button className="w-full">
                  Generate Full Report
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Compliance Report
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Generate a compliance-focused report highlighting violations and security events.
                </p>
                <Button className="w-full" variant="outline">
                  Generate Compliance Report
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Custom Report
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Create a custom report with specific criteria and date ranges.
                </p>
                <Button className="w-full" variant="outline">
                  Create Custom Report
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Report Templates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Quick Reports</p>
                  <Button variant="ghost" className="w-full justify-start">
                    Daily Summary
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    Weekly Summary
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    Monthly Summary
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    Security Events Only
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    User Activity Report
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Reports</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between p-2 rounded hover:bg-muted/50">
                    <span>Report_2024_01_15.pdf</span>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded hover:bg-muted/50">
                    <span>Compliance_2024_01_14.pdf</span>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded hover:bg-muted/50">
                    <span>Daily_2024_01_15.csv</span>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Report Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Auto-generate Reports</label>
                  <p className="text-xs text-muted-foreground">
                    Configure automatic report generation schedule
                  </p>
                  <Button variant="outline" className="w-full justify-start">
                    Configure Schedule
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Event Detail Dialog */}
      {selectedEvent && (
        <AuditEventDetail
          event={selectedEvent}
          isOpen={isDetailOpen}
          onClose={handleCloseDetail}
        />
      )}
    </div>
  )
}

