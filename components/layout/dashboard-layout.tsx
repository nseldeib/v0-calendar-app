"use client"

import type React from "react"
import { Sidebar } from "./sidebar"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-hidden lg:ml-0">
        <div className="h-full pt-16 lg:pt-0 px-4 lg:px-8 py-6">{children}</div>
      </main>
    </div>
  )
}
