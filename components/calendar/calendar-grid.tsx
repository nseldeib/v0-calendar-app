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

  return (
    <div className="bg-card rounded-lg border">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b">
        {WEEKDAYS.map((day) => (
          <div key={day} className="p-4 text-center text-sm font-medium text-muted-foreground">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {days.map((day, index) => {
          const dayEvents = getEventsForDate(day.date)

          return (
            <div
              key={index}
              className={cn(
                "min-h-[120px] p-2 border-r border-b cursor-pointer hover:bg-accent/50 transition-colors",
                !day.isCurrentMonth && "bg-muted/30 text-muted-foreground",
                day.isToday && "bg-primary/10",
              )}
              onClick={() => onDateClick(day.date)}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={cn(
                    "text-sm font-medium",
                    day.isToday &&
                      "bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center",
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
                    className="text-xs p-1 rounded truncate cursor-pointer hover:opacity-80"
                    style={{ backgroundColor: event.color + "20", color: event.color }}
                    onClick={(e) => {
                      e.stopPropagation()
                      onEventClick(event)
                    }}
                  >
                    <div className="font-medium truncate">{event.title}</div>
                    <div className="opacity-75">
                      {formatEventTime(event.start_time, event.end_time, event.is_all_day)}
                    </div>
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-xs text-muted-foreground">+{dayEvents.length - 3} more</div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
