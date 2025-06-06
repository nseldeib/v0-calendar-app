"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import type { User, Session } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase/client"
import type { Database } from "@/lib/supabase/types"

type Profile = Database["public"]["Tables"]["profiles"]["Row"]

interface AuthContextType {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

// Default context value to prevent errors
const defaultContextValue: AuthContextType = {
  user: null,
  profile: null,
  session: null,
  loading: false,
  signOut: async () => {},
  refreshProfile: async () => {},
}

const AuthContext = createContext<AuthContextType>(defaultContextValue)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(false) // Start with false to avoid blocking
  const [initialized, setInitialized] = useState(false)

  // Simple profile fetch that won't block rendering
  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    try {
      const { data } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle()
      return data
    } catch (error) {
      console.error("Error fetching profile:", error)
      return null
    }
  }

  const refreshProfile = async () => {
    if (user) {
      const profileData = await fetchProfile(user.id)
      setProfile(profileData)
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  // Initialize auth state
  useEffect(() => {
    if (initialized) return

    const initAuth = async () => {
      try {
        // Get initial session
        const { data } = await supabase.auth.getSession()

        setSession(data.session)
        setUser(data.session?.user ?? null)

        if (data.session?.user) {
          // Fetch profile in background
          fetchProfile(data.session.user.id).then(setProfile)
        }
      } catch (error) {
        console.error("Auth initialization error:", error)
      } finally {
        setInitialized(true)
      }
    }

    initAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)
      setUser(session?.user ?? null)

      if (session?.user) {
        fetchProfile(session.user.id).then(setProfile)
      } else {
        setProfile(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [initialized])

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
