"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
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
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold">
          {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h1>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" onClick={onPreviousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={onNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <Button onClick={onAddEvent}>
        <Plus className="h-4 w-4 mr-2" />
        Add Event
      </Button>
    </div>
  )
}
