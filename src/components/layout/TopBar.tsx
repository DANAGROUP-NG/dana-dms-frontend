"use client"

import { useState } from "react"
import { Search, Menu, Bell, Settings } from "lucide-react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { UserMenu } from "./UserMenu"
import { Breadcrumbs } from "./Breadcrumbs"
import { QuickActions } from "./QuickActions"
import { ThemeToggle } from "./ThemeToggle"

interface TopBarProps {
  onMenuToggle: () => void
}

export function TopBar({ onMenuToggle }: TopBarProps) {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        {/* Mobile Menu Toggle */}
        <Button variant="ghost" size="sm" onClick={onMenuToggle} className="md:hidden">
          <Menu className="h-4 w-4" />
        </Button>

        {/* Breadcrumbs */}
        <Breadcrumbs />
      </div>

      {/* Center Section - Search */}
      <div className="flex-1 max-w-md mx-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search documents, folders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        <QuickActions />

        {/* Notifications */}
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-destructive"></span>
        </Button>

        {/* Theme Toggle */}
        <ThemeToggle />

        <Button variant="ghost" size="sm">
          <Settings className="h-4 w-4" />
        </Button>

        {/* User Menu */}
        <UserMenu />
      </div>
    </header>
  )
}
