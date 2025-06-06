"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { Sidebar } from "./sidebar"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [authChecked, setAuthChecked] = useState(false)
  const router = useRouter()

  // Client-side auth protection for dashboard layout
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session?.user) {
          console.log("Dashboard layout: No session, redirecting to login")
          router.replace("/login")
          return
        }

        console.log("Dashboard layout: Valid session found")
        setAuthChecked(true)
      } catch (error) {
        console.error("Dashboard layout auth check error:", error)
        router.replace("/login")
      }
    }

    checkAuth()
  }, [router])

  // Show loading while checking auth
  if (!authChecked) {
    return (
      <div className="flex h-screen bg-background items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-hidden lg:ml-0">
        <div className="h-full pt-16 lg:pt-0 px-4 lg:px-8 py-6">{children}</div>
      </main>
    </div>
  )
}
