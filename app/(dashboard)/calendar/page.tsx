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

  const { user, session, loading: authLoading } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  // Check authentication with better error handling
  useEffect(() => {
    console.log("Calendar page - Auth state:", {
      authLoading,
      hasUser: !!user,
      hasSession: !!session,
      userId: user?.id,
    })

    // Only redirect if auth is done loading and there's no user
    if (!authLoading) {
      if (!user || !session) {
        console.log("No authenticated user, redirecting to login")
        router.replace("/login")
        return
      }
    }
  }, [user, session, authLoading, router])

  // Fetch events
  const fetchEvents = async () => {
    if (!user) {
      console.log("No user, skipping event fetch")
      setLoading(false)
      return
    }

    try {
      console.log("Fetching events for user:", user.id)
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("user_id", user.id)
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
    // Only fetch events if we have a user and auth is not loading
    if (!authLoading && user) {
      fetchEvents()
    } else if (!authLoading && !user) {
      setLoading(false)
    }
  }, [user, authLoading])

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
    if (!user) return

    try {
      const dataWithUser = { ...eventData, user_id: user.id }

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

  // Show loading while auth is loading
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render if no user (will redirect)
  if (!user || !session) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Redirecting...</p>
        </div>
      </div>
    )
  }

  // Show loading while events are loading
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading calendar...</p>
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
