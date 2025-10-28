"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Outlet } from "react-router-dom"
import { Sidebar } from "./Sidebar"
import { TopBar } from "./TopBar"

interface AppShellProps {
  children?: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  // Handle window resize to manage mobile state
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        // Desktop view: close mobile menu
        setMobileOpen(false)
      }
    }

    window.addEventListener("resize", handleResize)
    handleResize() // Check on mount

    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [mobileOpen])

  const handleMenuToggle = () => {
    // On mobile, toggle the drawer
    if (window.innerWidth < 768) {
      setMobileOpen((prev) => !prev)
    } else {
      // On desktop, toggle collapse
      setSidebarCollapsed((prev) => !prev)
    }
  }

  const handleMobileClose = () => {
    setMobileOpen(false)
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileOpen}
        onMobileClose={handleMobileClose}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Bar */}
        <TopBar onMenuToggle={handleMenuToggle} />

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-muted/10 p-4 md:p-6">
          <div className="mx-auto max-w-7xl">{children || <Outlet />}</div>
        </main>
      </div>
    </div>
  )
}

