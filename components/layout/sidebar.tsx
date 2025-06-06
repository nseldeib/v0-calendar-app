"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth/auth-context"
import { Calendar, CheckSquare, Users, Settings, LogOut, Menu, X, Zap } from "lucide-react"
import { useState } from "react"

const navigation = [
  {
    name: "Calendar",
    href: "/calendar",
    icon: Calendar,
  },
  {
    name: "Todos",
    href: "/todos",
    icon: CheckSquare,
  },
  {
    name: "Meetings",
    href: "/meetings",
    icon: Users,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const { signOut, profile, user } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
  }

  // Safely access user data with fallbacks
  const displayName = profile?.full_name || user?.user_metadata?.full_name || "Digital Monk"
  const displayEmail = profile?.email || user?.email || ""
  const displayInitial = displayName.charAt(0) || displayEmail.charAt(0) || "⚡"

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="monastery-card border-monastery-primary/30 hover:bg-monastery-primary/10"
        >
          {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 monastery-card border-r-2 border-monastery-primary/30 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center gap-3 p-6 border-b border-monastery-primary/20">
            <div className="relative">
              <Zap className="h-8 w-8 text-monastery-accent cyber-glow" />
              <div className="absolute inset-0 h-8 w-8 text-monastery-primary animate-glow-pulse">
                <Zap className="h-8 w-8" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold monastery-title">Calendar Pro</h1>
              <p className="text-xs text-monastery-accent/70">Digital Monastery</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname?.startsWith(item.href)
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium monastery-nav-item",
                    isActive ? "active" : "text-monastery-ethereal/80 hover:text-monastery-ethereal",
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-monastery-primary/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-cyber-accent flex items-center justify-center shadow-cyber">
                <span className="text-sm font-bold text-monastery-surface">{displayInitial}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate ethereal-text">{displayName}</p>
                <p className="text-xs text-monastery-accent/70 truncate">{displayEmail}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full monastery-card border-monastery-danger/30 text-monastery-danger hover:bg-monastery-danger/10 hover:border-monastery-danger/50"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
