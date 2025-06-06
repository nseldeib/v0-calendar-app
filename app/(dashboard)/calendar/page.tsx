"use client"

import { useState, useEffect } from "react"
import { CalendarHeader } from "@/components/calendar/calendar-header"
import { CalendarGrid } from "@/components/calendar/calendar-grid"
import { EventDialog } from "@/components/calendar/event-dialog"
import { useAuth } from "@/lib/auth/auth-context"
import { supabase } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { addMonths, subMonths } from "date-fns"
import type { Database } from "@/lib/supabase/types"
import { useRouter } from "next/navigation"

type Event = Database["public"]["Tables"]["events"]["Row"]
type EventInsert = Database["public"]["Tables"]["events"]["Insert"]

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState<Event[]>([])
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [eventDialogOpen, setEventDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [authChecked, setAuthChecked] = useState(false)

  const { user, session } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  // Client-side auth protection
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Double-check session directly with Supabase
        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession()

        console.log("Calendar page auth check:", {
          hasAuthUser: !!user,
          hasAuthSession: !!session,
          hasDirectSession: !!currentSession,
        })

        if (!currentSession?.user) {
          console.log("No valid session found, redirecting to login")
          router.replace("/login")
          return
        }

        console.log("Valid session found, staying on calendar")
        setAuthChecked(true)
      } catch (error) {
        console.error("Auth check error:", error)
        router.replace("/login")
      }
    }

    // Add a small delay to avoid race conditions
    const timer = setTimeout(checkAuth, 100)
    return () => clearTimeout(timer)
  }, [router, user, session])

  // Fetch events only after auth is confirmed
  const fetchEvents = async () => {
    try {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession()

      if (!currentSession?.user) {
        console.log("No session for fetching events")
        return
      }

      console.log("Fetching events for user:", currentSession.user.id)
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("user_id", currentSession.user.id)
        .order("start_time", { ascending: true })

      if (error) {
        console.error("Error fetching events:", error)
        throw error
      }

      console.log("Events fetched:", data?.length || 0)
      setEvents(data || [])
    } catch (error) {
      console.error("Error fetching events:", error)
      toast({
        title: "Error",
        description: "Failed to load events",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (authChecked) {
      fetchEvents()
    }
  }, [authChecked])

  // Navigation handlers
  const handlePreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1))
  }

  // Event handlers
  const handleAddEvent = () => {
    setSelectedEvent(null)
    setSelectedDate(new Date())
    setEventDialogOpen(true)
  }

  const handleDateClick = (date: Date) => {
    setSelectedEvent(null)
    setSelectedDate(date)
    setEventDialogOpen(true)
  }

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event)
    setSelectedDate(null)
    setEventDialogOpen(true)
  }

  const handleSaveEvent = async (eventData: EventInsert) => {
    try {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession()

      if (!currentSession?.user) {
        toast({
          title: "Error",
          description: "You must be logged in to save events",
          variant: "destructive",
        })
        return
      }

      const dataWithUser = { ...eventData, user_id: currentSession.user.id }

      if (selectedEvent) {
        // Update existing event
        const { error } = await supabase.from("events").update(dataWithUser).eq("id", selectedEvent.id)

        if (error) throw error

        toast({
          title: "Success",
          description: "Event updated successfully",
        })
      } else {
        // Create new event
        const { error } = await supabase.from("events").insert(dataWithUser)

        if (error) throw error

        toast({
          title: "Success",
          description: "Event created successfully",
        })
      }

      fetchEvents()
    } catch (error) {
      console.error("Error saving event:", error)
      toast({
        title: "Error",
        description: "Failed to save event",
        variant: "destructive",
      })
    }
  }

  const handleDeleteEvent = async (eventId: string) => {
    try {
      const { error } = await supabase.from("events").delete().eq("id", eventId)

      if (error) throw error

      toast({
        title: "Success",
        description: "Event deleted successfully",
      })

      fetchEvents()
    } catch (error) {
      console.error("Error deleting event:", error)
      toast({
        title: "Error",
        description: "Failed to delete event",
        variant: "destructive",
      })
    }
  }

  // Show loading while checking auth or loading events
  if (!authChecked || loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{!authChecked ? "Checking authentication..." : "Loading calendar..."}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <CalendarHeader
        currentDate={currentDate}
        onPreviousMonth={handlePreviousMonth}
        onNextMonth={handleNextMonth}
        onAddEvent={handleAddEvent}
      />

      <div className="flex-1 overflow-auto">
        <CalendarGrid
          currentDate={currentDate}
          events={events}
          onDateClick={handleDateClick}
          onEventClick={handleEventClick}
        />
      </div>

      <EventDialog
        open={eventDialogOpen}
        onOpenChange={setEventDialogOpen}
        event={selectedEvent}
        selectedDate={selectedDate}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
      />
    </div>
  )
}
