export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          timezone: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          timezone?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          timezone?: string
          created_at?: string
          updated_at?: string
        }
      }
      events: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          start_time: string
          end_time: string
          timezone: string
          location: string | null
          color: string
          is_all_day: boolean
          recurrence_rule: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          start_time: string
          end_time: string
          timezone?: string
          location?: string | null
          color?: string
          is_all_day?: boolean
          recurrence_rule?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          start_time?: string
          end_time?: string
          timezone?: string
          location?: string | null
          color?: string
          is_all_day?: boolean
          recurrence_rule?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      todos: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          completed: boolean
          priority: "low" | "medium" | "high"
          due_date: string | null
          event_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          completed?: boolean
          priority?: "low" | "medium" | "high"
          due_date?: string | null
          event_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          completed?: boolean
          priority?: "low" | "medium" | "high"
          due_date?: string | null
          event_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      meeting_requests: {
        Row: {
          id: string
          organizer_id: string
          title: string
          description: string | null
          duration_minutes: number
          buffer_minutes: number
          location: string | null
          meeting_type: "in-person" | "video" | "phone"
          is_active: boolean
          slug: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organizer_id: string
          title: string
          description?: string | null
          duration_minutes?: number
          buffer_minutes?: number
          location?: string | null
          meeting_type?: "in-person" | "video" | "phone"
          is_active?: boolean
          slug: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organizer_id?: string
          title?: string
          description?: string | null
          duration_minutes?: number
          buffer_minutes?: number
          location?: string | null
          meeting_type?: "in-person" | "video" | "phone"
          is_active?: boolean
          slug?: string
          created_at?: string
          updated_at?: string
        }
      }
      availability_slots: {
        Row: {
          id: string
          meeting_request_id: string
          day_of_week: number
          start_time: string
          end_time: string
          timezone: string
        }
        Insert: {
          id?: string
          meeting_request_id: string
          day_of_week: number
          start_time: string
          end_time: string
          timezone?: string
        }
        Update: {
          id?: string
          meeting_request_id?: string
          day_of_week?: number
          start_time?: string
          end_time?: string
          timezone?: string
        }
      }
      booked_meetings: {
        Row: {
          id: string
          meeting_request_id: string
          attendee_name: string
          attendee_email: string
          start_time: string
          end_time: string
          status: "confirmed" | "cancelled" | "rescheduled"
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          meeting_request_id: string
          attendee_name: string
          attendee_email: string
          start_time: string
          end_time: string
          status?: "confirmed" | "cancelled" | "rescheduled"
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          meeting_request_id?: string
          attendee_name?: string
          attendee_email?: string
          start_time?: string
          end_time?: string
          status?: "confirmed" | "cancelled" | "rescheduled"
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
