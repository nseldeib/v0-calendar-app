"use client"

import { cn } from "@/lib/utils"
import { getCalendarDays, WEEKDAYS, formatEventTime } from "@/lib/utils/date"
import type { Database } from "@/lib/supabase/types"

type Event = Database["public"]["Tables"]["events"]["Row"]

interface CalendarGridProps {
  currentDate: Date
  events: Event[]
  onDateClick: (date: Date) => void
  onEventClick: (event: Event) => void
}

const EVENT_COLORS = [
  "#4c1d95", // Monastery primary
  "#00e6e6", // Refined cyan
  "#e600e6", // Refined magenta
  "#72e600", // Refined chartreuse
  "#e63f00", // Refined orange
  "#c61239", // Refined crimson
]

export function CalendarGrid({ currentDate, events, onDateClick, onEventClick }: CalendarGridProps) {
  const days = getCalendarDays(currentDate)

  const getEventsForDate = (date: Date) => {
    return events.filter((event) => {
      const eventDate = new Date(event.start_time)
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      )
    })
  }

  const getEventStyle = (color: string) => {
    // Map the color to our monastery theme
    const colorMap: { [key: string]: string } = {
      "#3b82f6": "event-primary",
      "#10b981": "event-success",
      "#8b5cf6": "event-secondary",
      "#ef4444": "event-warning",
      "#f97316": "event-warning",
      "#ec4899": "event-secondary",
    }

    return colorMap[color] || "event-primary"
  }

  return (
    <div className="monastery-card rounded-2xl border-2 border-monastery-primary/20 shadow-ethereal overflow-hidden">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b border-monastery-primary/20 bg-monastery-surface/50">
        {WEEKDAYS.map((day) => (
          <div key={day} className="p-4 text-center text-sm font-semibold text-monastery-accent">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-px bg-monastery-primary/10">
        {days.map((day, index) => {
          const dayEvents = getEventsForDate(day.date)

          return (
            <div
              key={index}
              className={cn(
                "calendar-day min-h-[120px] p-3 cursor-pointer group",
                !day.isCurrentMonth && "opacity-40",
                day.isToday && "today",
              )}
              onClick={() => onDateClick(day.date)}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className={cn(
                    "text-sm font-semibold transition-all duration-200",
                    day.isToday
                      ? "bg-monastery-accent text-monastery-surface rounded-full w-7 h-7 flex items-center justify-center shadow-cyber cyber-glow"
                      : "text-monastery-ethereal group-hover:text-monastery-accent",
                  )}
                >
                  {day.date.getDate()}
                </span>
              </div>

              {/* Events */}
              <div className="space-y-1">
                {dayEvents.slice(0, 3).map((event) => (
                  <div
                    key={event.id}
                    className={cn(
                      "text-xs p-2 rounded-lg cursor-pointer transition-all duration-200 hover:scale-105",
                      getEventStyle(event.color),
                    )}
                    onClick={(e) => {
                      e.stopPropagation()
                      onEventClick(event)
                    }}
                  >
                    <div className="font-medium truncate">{event.title}</div>
                    <div className="opacity-80 text-xs">
                      {formatEventTime(event.start_time, event.end_time, event.is_all_day)}
                    </div>
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-xs text-monastery-accent/70 font-medium">+{dayEvents.length - 3} more</div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
