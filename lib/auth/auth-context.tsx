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

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = async (userId: string) => {
    try {
      console.log("Fetching profile for user:", userId)

      // First, check if profile exists
      const { data, error, count } = await supabase.from("profiles").select("*", { count: "exact" }).eq("id", userId)

      console.log("Profile query result:", { data, error, count })

      if (error) {
        console.error("Error fetching profile:", error)
        return null
      }

      // If no profile exists, create one
      if (!data || data.length === 0) {
        console.log("No profile found, creating one...")
        return await createProfile(userId)
      }

      // If multiple profiles exist (shouldn't happen), use the first one
      if (data.length > 1) {
        console.warn("Multiple profiles found for user, using first one")
        return data[0]
      }

      return data[0]
    } catch (error) {
      console.error("Exception in fetchProfile:", error)
      return null
    }
  }

  const createProfile = async (userId: string) => {
    try {
      // Get user data from auth
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()

      if (!authUser) {
        console.error("No authenticated user found")
        return null
      }

      const profileData = {
        id: userId,
        email: authUser.email!,
        full_name: authUser.user_metadata?.full_name || null,
        avatar_url: authUser.user_metadata?.avatar_url || null,
        timezone: "UTC",
      }

      console.log("Creating profile with data:", profileData)

      const { data, error } = await supabase.from("profiles").insert(profileData).select().single()

      if (error) {
        console.error("Error creating profile:", error)
        return null
      }

      console.log("Profile created successfully:", data)
      return data
    } catch (error) {
      console.error("Exception in createProfile:", error)
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
    await supabase.auth.signOut()
  }

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Initial session:", session?.user?.id)
      setSession(session)
      setUser(session?.user ?? null)

      if (session?.user) {
        fetchProfile(session.user.id).then(setProfile)
      }

      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state change:", event, session?.user?.id)
      setSession(session)
      setUser(session?.user ?? null)

      if (session?.user) {
        const profileData = await fetchProfile(session.user.id)
        setProfile(profileData)
      } else {
        setProfile(null)
      }

      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

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
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
