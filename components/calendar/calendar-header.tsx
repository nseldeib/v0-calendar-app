"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Plus, Sparkles } from "lucide-react"
import { MONTHS } from "@/lib/utils/date"

interface CalendarHeaderProps {
  currentDate: Date
  onPreviousMonth: () => void
  onNextMonth: () => void
  onAddEvent: () => void
}

export function CalendarHeader({ currentDate, onPreviousMonth, onNextMonth, onAddEvent }: CalendarHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold monastery-title flex items-center gap-2">
            {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
            <Sparkles className="h-6 w-6 text-monastery-accent cyber-glow" />
          </h1>
          <p className="text-monastery-accent/70 text-sm mt-1">Digital Zen Calendar</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={onPreviousMonth}
            className="monastery-card border-monastery-primary/30 hover:bg-monastery-primary/10 hover:border-monastery-primary/50"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={onNextMonth}
            className="monastery-card border-monastery-primary/30 hover:bg-monastery-primary/10 hover:border-monastery-primary/50"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <Button onClick={onAddEvent} className="cyber-button">
        <Plus className="h-4 w-4 mr-2" />
        Add Event
        <Sparkles className="h-4 w-4 ml-2" />
      </Button>
    </div>
  )
}
