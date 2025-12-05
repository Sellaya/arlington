"use client"

import * as React from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import type { Booking } from "@/lib/types"
import { format, addDays, isSameDay, isToday, isPast } from "date-fns"
import { Calendar as CalendarIcon, Filter, Clock, User, Briefcase } from "lucide-react"

export default function BookingsPage() {
  const [date, setDate] = React.useState<Date | undefined>(new Date())
  const [bookings, setBookings] = React.useState<Booking[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(data => {
        setBookings(data.bookings || [])
        setLoading(false)
      })
      .catch(err => {
        console.error('Error fetching bookings:', err)
        setLoading(false)
      })
  }, [])

  const appointmentsForDate = bookings.filter(b => date && format(b.dateTime, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'));

  // Generate dates for horizontal scrollable picker (next 14 days)
  const upcomingDates = React.useMemo(() => {
    const dates = []
    const today = new Date()
    for (let i = 0; i < 14; i++) {
      dates.push(addDays(today, i))
    }
    return dates
  }, [])

  // Get appointments count for each date
  const getAppointmentCount = (checkDate: Date) => {
    return bookings.filter(b => format(b.dateTime, 'yyyy-MM-dd') === format(checkDate, 'yyyy-MM-dd')).length
  }

  // Mobile: Horizontal Scrollable Date Picker
  const MobileDatePicker = () => (
    <div className="block sm:hidden">
      <div className="mb-4">
        <h3 
          className="font-semibold text-foreground mb-3"
          style={{ fontSize: 'clamp(0.875rem, 0.75rem + 0.5vw, 1rem)' }}
        >
          Select a Date
        </h3>
      </div>
      <div className="overflow-x-auto -mx-4 px-4 pb-2 scrollbar-hide">
        <div className="flex gap-2 min-w-max">
          {upcomingDates.map((day) => {
            const isSelected = date && isSameDay(day, date)
            const isTodayDate = isToday(day)
            const appointmentCount = getAppointmentCount(day)
            const isPastDate = isPast(day) && !isTodayDate

            return (
              <button
                key={day.toISOString()}
                onClick={() => setDate(day)}
                aria-label={`Select ${format(day, 'EEEE, MMMM d')}${appointmentCount > 0 ? `, ${appointmentCount} appointment${appointmentCount !== 1 ? 's' : ''}` : ''}`}
                aria-pressed={isSelected}
                disabled={isPastDate}
                className={`flex flex-col items-center justify-center gap-1.5 px-4 py-3 rounded-xl border-2 transition-all duration-200 min-w-[70px] touch-3d active:scale-95 ${
                  isSelected
                    ? 'border-primary bg-primary text-primary-foreground shadow-3d-md'
                    : isPastDate
                    ? 'border-border/40 bg-muted/30 text-muted-foreground opacity-60 cursor-not-allowed'
                    : 'border-border/60 bg-card/95 text-foreground hover:border-primary/50 hover:shadow-3d-sm'
                }`}
              >
                <span 
                  className={`font-medium ${isTodayDate ? 'text-primary' : ''}`}
                  style={{ fontSize: 'clamp(0.625rem, 0.5rem + 0.5vw, 0.75rem)' }}
                >
                  {format(day, 'EEE')}
                </span>
                <span 
                  className={`font-bold ${isTodayDate && !isSelected ? 'text-primary' : ''}`}
                  style={{ fontSize: 'clamp(1rem, 0.875rem + 0.5vw, 1.25rem)' }}
                >
                  {format(day, 'd')}
                </span>
                {appointmentCount > 0 && (
                  <span 
                    className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${
                      isSelected
                        ? 'bg-primary-foreground/20 text-primary-foreground'
                        : 'bg-primary/10 text-primary'
                    }`}
                  >
                    {appointmentCount}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )

  // Tablet: Compact Calendar
  const TabletCalendar = () => (
    <div className="hidden sm:block lg:hidden">
      <Card className="border-border/60 bg-card/95 backdrop-blur-sm">
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle 
            className="flex items-center gap-2"
            style={{ fontSize: 'clamp(0.875rem, 0.75rem + 0.5vw, 1rem)' }}
          >
            <CalendarIcon 
              style={{ 
                width: 'clamp(1rem, 0.875rem + 0.5vw, 1.25rem)',
                height: 'clamp(1rem, 0.875rem + 0.5vw, 1.25rem)'
              }}
            />
            Select a Date
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-4">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-xl w-full"
            classNames={{
              months: "flex flex-col",
              month: "space-y-3",
              caption: "flex justify-center pt-1 relative items-center mb-2",
              caption_label: "text-sm font-medium",
              nav: "space-x-1 flex items-center",
              table: "w-full border-collapse space-y-1",
              head_row: "flex",
              head_cell: "text-muted-foreground rounded-md w-8 font-normal text-xs",
              row: "flex w-full mt-1",
              cell: "h-8 w-8 text-center text-xs p-0 relative",
              day: "h-8 w-8 p-0 font-normal rounded-lg transition-all duration-200 touch-3d hover:scale-110 active:scale-95",
            }}
          />
        </CardContent>
      </Card>
    </div>
  )

  // Desktop: Full Sidebar Calendar
  const DesktopCalendar = () => (
    <div className="hidden lg:block">
      <Card className="sticky top-4 lg:top-6 xl:top-8 border-border/60 bg-card/95 backdrop-blur-sm">
        <CardHeader className="pb-3 sm:pb-4 lg:pb-6">
          <CardTitle 
            className="flex items-center gap-2"
            style={{ fontSize: 'clamp(1rem, 0.875rem + 0.5vw, 1.25rem)' }}
          >
            <CalendarIcon 
              style={{ 
                width: 'clamp(1.125rem, 1rem + 0.5vw, 1.5rem)',
                height: 'clamp(1.125rem, 1rem + 0.5vw, 1.5rem)'
              }}
            />
            Select a Date
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center p-4 sm:p-6 lg:p-8">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-xl border-2 border-border/60 shadow-3d-md bg-card/90 backdrop-blur-sm w-full"
          />
        </CardContent>
      </Card>
    </div>
  )

  // Appointment Card Component
  const AppointmentCard = ({ booking }: { booking: Booking }) => (
    <Card
      className="group border-border/60 bg-card/95 backdrop-blur-sm transition-all duration-300 hover:shadow-3d-md hover:-translate-y-1 hover:border-primary/30 touch-3d active:scale-[0.98] transform-gpu"
    >
      <CardContent className="p-4 sm:p-5 md:p-6">
        <div className="flex flex-col gap-3 sm:gap-4">
          {/* Header: Service & Status */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 
                className="font-bold text-foreground mb-2 truncate"
                style={{ fontSize: 'clamp(1rem, 0.875rem + 0.5vw, 1.25rem)' }}
              >
                {booking.service}
              </h3>
            </div>
            <Badge 
              variant={booking.status === 'Confirmed' ? 'default' : booking.status === 'Cancelled' ? 'destructive' : 'secondary'}
              className="flex-shrink-0 text-xs sm:text-sm font-medium px-3 py-1"
            >
              {booking.status}
            </Badge>
          </div>

          {/* Details */}
          <div className="flex flex-col gap-2.5 sm:gap-3">
            <div className="flex items-center gap-2.5 text-muted-foreground">
              <User 
                style={{ 
                  width: 'clamp(0.875rem, 0.75rem + 0.5vw, 1rem)',
                  height: 'clamp(0.875rem, 0.75rem + 0.5vw, 1rem)'
                }}
                className="flex-shrink-0"
              />
              <span 
                className="truncate"
                style={{ fontSize: 'clamp(0.875rem, 0.75rem + 0.5vw, 1rem)' }}
              >
                {booking.customer}
              </span>
            </div>
            <div className="flex items-center gap-2.5 text-muted-foreground">
              <Briefcase 
                style={{ 
                  width: 'clamp(0.875rem, 0.75rem + 0.5vw, 1rem)',
                  height: 'clamp(0.875rem, 0.75rem + 0.5vw, 1rem)'
                }}
                className="flex-shrink-0"
              />
              <span 
                className="truncate"
                style={{ fontSize: 'clamp(0.875rem, 0.75rem + 0.5vw, 1rem)' }}
              >
                {booking.staff}
              </span>
            </div>
            <div className="flex items-center gap-2.5 text-foreground font-semibold pt-1 border-t border-border/40">
              <Clock 
                style={{ 
                  width: 'clamp(1rem, 0.875rem + 0.5vw, 1.25rem)',
                  height: 'clamp(1rem, 0.875rem + 0.5vw, 1.25rem)'
                }}
                className="flex-shrink-0 text-primary"
              />
              <span 
                style={{ fontSize: 'clamp(0.875rem, 0.75rem + 0.5vw, 1rem)' }}
              >
                {format(booking.dateTime, 'p')}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  // Skeleton Loader
  const AppointmentSkeleton = () => (
    <Card className="border-border/60">
      <CardContent className="p-4 sm:p-5 md:p-6">
        <div className="flex flex-col gap-3 sm:gap-4">
          <div className="flex items-start justify-between gap-3">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-5 w-20" />
          </div>
          <div className="flex flex-col gap-2.5">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/2 mt-2 pt-2 border-t border-border/40" />
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <div className="flex flex-col w-full">
        {/* Page Header Skeleton */}
        <section className="mb-4 sm:mb-6 md:mb-8 lg:mb-10">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </section>

        {/* Date Picker Skeleton */}
        <section className="mb-4 sm:mb-6 md:mb-8">
          <Skeleton className="h-24 w-full sm:h-64 lg:h-auto lg:w-80" />
        </section>

        {/* Appointments Skeleton */}
        <section>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
            {[...Array(6)].map((_, i) => (
              <AppointmentSkeleton key={i} />
            ))}
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="flex flex-col w-full">
      {/* Page Header Section */}
      <section className="mb-4 sm:mb-6 md:mb-8 lg:mb-10">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
          <div className="flex-1 min-w-0">
            <h1 
              className="font-bold font-headline text-foreground mb-2"
              style={{ fontSize: 'clamp(1.75rem, 1.5rem + 1.5vw, 2.5rem)' }}
            >
              Bookings
            </h1>
            <p 
              className="text-muted-foreground font-normal"
              style={{ fontSize: 'clamp(0.875rem, 0.75rem + 0.5vw, 1rem)' }}
            >
              View and manage your appointments ({bookings.length} total)
            </p>
          </div>
          {/* Sticky Filter Button on Mobile */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <Button 
              variant="outline" 
              className="w-full sm:w-auto sticky top-20 sm:static z-10 bg-background/95 backdrop-blur-sm"
              style={{ 
                fontSize: 'clamp(0.75rem, 0.625rem + 0.5vw, 0.875rem)',
                height: 'clamp(2.25rem, 2rem + 0.5vw, 2.75rem)'
              }}
            >
              <Filter 
                style={{ 
                  width: 'clamp(0.875rem, 0.75rem + 0.5vw, 1rem)',
                  height: 'clamp(0.875rem, 0.75rem + 0.5vw, 1rem)'
                }}
                className="mr-2"
              />
              <span className="hidden sm:inline">Filter</span>
              <span className="sm:hidden">Filter</span>
            </Button>
          </div>
        </div>
      </section>

      {/* Calendar Section - Responsive Layouts */}
      <section className="mb-4 sm:mb-6 md:mb-8">
        <MobileDatePicker />
        <TabletCalendar />
        <DesktopCalendar />
      </section>

      {/* Appointments Section */}
      <section>
        <Card className="border-border/60 bg-card/95 backdrop-blur-sm">
          <CardHeader className="pb-4 sm:pb-5 md:pb-6">
            <div className="flex flex-col gap-1 sm:gap-2">
              <CardTitle 
                className="font-bold"
                style={{ fontSize: 'clamp(1.125rem, 1rem + 0.75vw, 1.5rem)' }}
              >
                Appointments for {date ? format(date, 'PPP') : '...'}
              </CardTitle>
              <CardDescription 
                style={{ fontSize: 'clamp(0.75rem, 0.625rem + 0.5vw, 0.875rem)' }}
              >
                You have {appointmentsForDate.length} appointment{appointmentsForDate.length !== 1 ? 's' : ''} scheduled for this day.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-5 md:p-6 lg:p-8">
            {appointmentsForDate.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
                {appointmentsForDate.map((booking) => (
                  <AppointmentCard key={booking.id} booking={booking} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 sm:py-16 text-muted-foreground">
                <CalendarIcon 
                  className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 opacity-50"
                  style={{ 
                    width: 'clamp(3rem, 2.5rem + 2vw, 4rem)',
                    height: 'clamp(3rem, 2.5rem + 2vw, 4rem)'
                  }}
                />
                <p 
                  className="font-medium mb-1"
                  style={{ fontSize: 'clamp(1rem, 0.875rem + 0.5vw, 1.25rem)' }}
                >
                  No appointments for this date
                </p>
                <p 
                  style={{ fontSize: 'clamp(0.875rem, 0.75rem + 0.5vw, 1rem)' }}
                >
                  Select another date to view appointments
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
