"use client"

import type { Tenant } from "@/store/slices/authSlice"
import { setCurrentTenant } from "@/store/slices/authSlice"
import { Check, ChevronsUpDown } from "lucide-react"
import { useState } from "react"
import { useAppDispatch, useAppSelector } from "../../hooks/redux"
import { cn } from "../../lib/utils"
import { Button } from "../ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"

// Mock tenant hierarchy data
const mockTenants: Tenant[] = [
  {
    id: "1",
    name: "Dana Group",
    type: "group",
    children: [
      {
        id: "2",
        name: "Dana House",
        type: "subsidiary",
        parentId: "1",
        children: [
          {
            id: "3",
            name: "Lagos",
            type: "location",
            parentId: "2",
            children: [
              {
                id: "4",
                name: "Engineering",
                type: "department",
                parentId: "3",
              },
              {
                id: "5",
                name: "Marketing",
                type: "department",
                parentId: "3",
              },
            ],
          },
        ],
      },
    ],
  },
]

function flattenTenants(tenants: Tenant[], level = 0): (Tenant & { level: number })[] {
  const result: (Tenant & { level: number })[] = []

  for (const tenant of tenants) {
    result.push({ ...tenant, level })
    if (tenant.children) {
      result.push(...flattenTenants(tenant.children, level + 1))
    }
  }

  return result
}

export function TenantSwitcher() {
  const [open, setOpen] = useState(false)
  const dispatch = useAppDispatch()
  const currentTenant = useAppSelector((state) => state.auth.currentTenant)

  const flatTenants = flattenTenants(mockTenants)
  const selectedTenant = currentTenant || flatTenants[0]

  const handleTenantSelect = (tenant: Tenant) => {
    dispatch(setCurrentTenant(tenant))
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-white text-foreground hover:bg-gray-50 border-border"
        >
          <div className="flex items-center gap-2">
            <img src="/dgc-logo.png" alt="Dana Group Logo"/>
            {/* <span className="truncate">{selectedTenant?.name}</span> */}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0">
        <Command>
          <CommandInput placeholder="Search tenants..." />
          <CommandList>
            <CommandEmpty>No tenant found.</CommandEmpty>
            <CommandGroup>
              {flatTenants.map((tenant) => (
                <CommandItem key={tenant.id} value={tenant.name} onSelect={() => handleTenantSelect(tenant)}>
                  <div className="flex items-center gap-2" style={{ paddingLeft: `${tenant.level * 12}px` }}>
                    <Check className={cn("h-4 w-4", selectedTenant?.id === tenant.id ? "opacity-100" : "opacity-0")} />
                    <span className="truncate">{tenant.name}</span>
                    <span className="ml-auto text-xs text-muted-foreground capitalize">{tenant.type}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
