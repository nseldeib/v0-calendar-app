import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  parseISO,
} from "date-fns"

export function getCalendarDays(date: Date) {
  const monthStart = startOfMonth(date)
  const monthEnd = endOfMonth(date)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 }) // Sunday
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })

  const days = []
  let currentDate = calendarStart

  while (currentDate <= calendarEnd) {
    days.push({
      date: new Date(currentDate),
      isCurrentMonth: isSameMonth(currentDate, date),
      isToday: isSameDay(currentDate, new Date()),
    })
    currentDate = addDays(currentDate, 1)
  }

  return days
}

export function formatEventTime(startTime: string, endTime: string, isAllDay: boolean) {
  if (isAllDay) {
    return "All day"
  }

  const start = parseISO(startTime)
  const end = parseISO(endTime)

  return `${format(start, "h:mm a")} - ${format(end, "h:mm a")}`
}

export const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]
