import * as React from "react"
import { cn } from "../../lib/utils"

export interface ChartConfig {
  [key: string]: {
    label?: string
    color?: string
    [key: string]: any
  }
}

export function ChartContainer({ 
  config, 
  children, 
  className, 
  ...props 
}: { config?: ChartConfig; children: React.ReactNode; className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("w-full", className)} {...props}>
      {children}
    </div>
  )
}

export function ChartTooltip() {
  // Recharts tooltip wrapper
  return null
}

export function ChartTooltipContent({ ...props }: any) {
  // Recharts Tooltip wrapper
  return <span {...props} />
}

export function ChartLegend() {
  // Recharts Legend wrapper
  return null
}

export function ChartLegendContent({ ...props }: any) {
  // Recharts LegendContent wrapper
  return <span {...props} />
}

