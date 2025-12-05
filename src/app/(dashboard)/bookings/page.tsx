"use client"

import * as React from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Booking } from "@/lib/types"
import { format, addDays, isSameDay, isToday, isPast, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns"
import { 
  Calendar as CalendarIcon, 
  Filter, 
  Clock, 
  User, 
  Briefcase, 
  Search,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  CheckCircle2,
  XCircle,
  AlertCircle
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type FilterStatus = 'all' | 'Confirmed' | 'Pending' | 'Cancelled'

export default function BookingsPage() {
  const [date, setDate] = React.useState<Date | undefined>(new Date())
  const [bookings, setBookings] = React.useState<Booking[]>([])
  const [loading, setLoading] = React.useState(true)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<FilterStatus>('all')
  const [viewMode, setViewMode] = React.useState<'day' | 'week' | 'month'>('day')

  React.useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(data => {
        // Convert dateTime strings back to Date objects
        const processedBookings = (data.bookings || []).map((booking: any) => ({
          ...booking,
          dateTime: booking.dateTime ? new Date(booking.dateTime) : new Date(),
        }))
        setBookings(processedBookings)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error fetching bookings:', err)
        setLoading(false)
      })
  }, [])

  // Filter bookings based on selected date and filters
  const filteredBookings = React.useMemo(() => {
    let filtered = bookings

    // Filter by date based on view mode
    if (date) {
      if (viewMode === 'day') {
        filtered = filtered.filter(b => 
          format(b.dateTime, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
        )
      } else if (viewMode === 'week') {
        const weekStart = startOfWeek(date, { weekStartsOn: 1 })
        const weekEnd = endOfWeek(date, { weekStartsOn: 1 })
        filtered = filtered.filter(b => {
          const bookingDate = b.dateTime
          return bookingDate >= weekStart && bookingDate <= weekEnd
        })
      } else if (viewMode === 'month') {
        const monthStart = startOfMonth(date)
        const monthEnd = endOfMonth(date)
        filtered = filtered.filter(b => {
          const bookingDate = b.dateTime
          return bookingDate >= monthStart && bookingDate <= monthEnd
        })
      }
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(b => b.status === statusFilter)
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(b => 
        b.customer.toLowerCase().includes(query) ||
        b.service.toLowerCase().includes(query) ||
        b.staff.toLowerCase().includes(query)
      )
    }

    // Sort by dateTime
    return filtered.sort((a, b) => {
      const aTime = a.dateTime instanceof Date ? a.dateTime.getTime() : new Date(a.dateTime).getTime()
      const bTime = b.dateTime instanceof Date ? b.dateTime.getTime() : new Date(b.dateTime).getTime()
      return aTime - bTime
    })
  }, [bookings, date, statusFilter, searchQuery, viewMode])

  // Generate dates for horizontal scrollable picker (next 21 days)
  const upcomingDates = React.useMemo(() => {
    const dates = []
    const today = new Date()
    for (let i = 0; i < 21; i++) {
      dates.push(addDays(today, i))
    }
    return dates
  }, [])

  // Get appointments count for each date
  const getAppointmentCount = (checkDate: Date) => {
    return bookings.filter(b => {
      const bookingDate = b.dateTime instanceof Date ? b.dateTime : new Date(b.dateTime)
      return format(bookingDate, 'yyyy-MM-dd') === format(checkDate, 'yyyy-MM-dd')
    }).length
  }

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return <CheckCircle2 className="h-4 w-4" />
      case 'Cancelled':
        return <XCircle className="h-4 w-4" />
      case 'Pending':
        return <AlertCircle className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  // Horizontal Scrollable Date Picker (Mobile & Web)
  const HorizontalDatePicker = () => (
    <div className="w-full">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 
            className="font-semibold text-foreground"
            style={{ fontSize: 'clamp(0.875rem, 0.75rem + 0.5vw, 1rem)' }}
          >
            Select Date
          </h3>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => {
                if (date) {
                  setDate(addDays(date, -1))
                }
              }}
              aria-label="Previous day"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setDate(new Date())}
              aria-label="Today"
            >
              <span className="text-xs">Today</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => {
                if (date) {
                  setDate(addDays(date, 1))
                }
              }}
              aria-label="Next day"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      <div 
        className="w-full overflow-x-auto overflow-y-hidden scrollbar-hide pb-2 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8" 
        style={{ 
          scrollbarWidth: 'none', 
          msOverflowStyle: 'none',
          scrollBehavior: 'smooth',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        <div className="flex gap-2 sm:gap-3 min-w-max">
          {loading ? (
            Array.from({ length: 21 }).map((_, i) => (
              <Skeleton key={i} className="h-[90px] sm:h-[100px] w-[70px] sm:w-[80px] rounded-xl flex-shrink-0" />
            ))
          ) : (
            upcomingDates.map((day) => {
              const isSelected = date && isSameDay(day, date)
              const isTodayDate = isToday(day)
              const appointmentCount = getAppointmentCount(day)
              const isPastDate = isPast(day) && !isTodayDate

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => !isPastDate && setDate(day)}
                  disabled={isPastDate}
                  aria-label={`Select ${format(day, 'EEEE, MMMM d')}${appointmentCount > 0 ? `, ${appointmentCount} appointment${appointmentCount !== 1 ? 's' : ''}` : ''}`}
                  aria-pressed={isSelected}
                  className={`flex flex-col items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-3 sm:py-4 rounded-xl border-2 transition-all duration-200 min-w-[70px] sm:min-w-[80px] flex-shrink-0 touch-3d active:scale-95 ${
                    isSelected
                      ? 'border-primary bg-gradient-to-br from-primary to-primary/90 text-primary-foreground shadow-3d-md scale-105 z-10'
                      : isPastDate
                      ? 'border-border/40 bg-muted/30 text-muted-foreground opacity-50 cursor-not-allowed'
                      : 'border-border/60 bg-card/95 text-foreground hover:border-primary/50 hover:shadow-3d-sm hover:bg-card hover:scale-105'
                  }`}
                >
                  <span 
                    className={`font-medium whitespace-nowrap ${isTodayDate && !isSelected ? 'text-primary font-semibold' : ''}`}
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
                      className={`px-1.5 sm:px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${
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
            })
          )}
        </div>
      </div>
    </div>
  )

  // Tablet/Desktop: Full Calendar
  const DesktopCalendar = () => (
    <div className="hidden lg:block">
      <Card className="sticky top-4 lg:top-6 xl:top-8 border-border/60 bg-card/95 backdrop-blur-sm shadow-3d-md">
        <CardHeader className="pb-3 lg:pb-4">
          <div className="flex items-center justify-between">
            <CardTitle 
              className="flex items-center gap-2 text-foreground"
              style={{ fontSize: 'clamp(1rem, 0.875rem + 0.5vw, 1.25rem)' }}
            >
              <CalendarIcon className="h-5 w-5" />
              Calendar
            </CardTitle>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => {
                  if (date) {
                    setDate(addDays(date, -1))
                  }
                }}
                aria-label="Previous day"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setDate(new Date())}
                aria-label="Today"
              >
                <span className="text-xs">Today</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => {
                  if (date) {
                    setDate(addDays(date, 1))
                  }
                }}
                aria-label="Next day"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 lg:p-6">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-xl w-full"
            modifiers={{
              hasAppointments: bookings.map(b => {
                const bookingDate = b.dateTime instanceof Date ? b.dateTime : new Date(b.dateTime)
                return bookingDate
              })
            }}
            modifiersClassNames={{
              hasAppointments: "bg-primary/10 border-primary/30"
            }}
          />
        </CardContent>
      </Card>
    </div>
  )

  // Enhanced Appointment Card Component
  const AppointmentCard = ({ booking }: { booking: Booking }) => {
    const bookingDate = booking.dateTime instanceof Date ? booking.dateTime : new Date(booking.dateTime)
    const isPastBooking = isPast(bookingDate) && !isToday(bookingDate)
    
    return (
      <Card
        className={`group border-2 transition-all duration-300 hover:shadow-3d-md hover:-translate-y-1 touch-3d active:scale-[0.98] transform-gpu ${
          isPastBooking 
            ? 'border-border/40 bg-muted/20 opacity-75' 
            : 'border-border/60 bg-gradient-to-br from-card/95 to-card/90 backdrop-blur-sm hover:border-primary/30'
        }`}
      >
        <CardContent className="p-4 sm:p-5 lg:p-6">
          <div className="flex flex-col gap-4">
            {/* Header: Service & Status */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h3 
                  className="font-bold text-foreground mb-1.5 line-clamp-2"
                  style={{ fontSize: 'clamp(1rem, 0.875rem + 0.5vw, 1.25rem)' }}
                >
                  {booking.service}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  {getStatusIcon(booking.status)}
                  <Badge 
                    variant={booking.status === 'Confirmed' ? 'default' : booking.status === 'Cancelled' ? 'destructive' : 'secondary'}
                    className="text-xs font-medium px-2 py-0.5"
                  >
                    {booking.status}
                  </Badge>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>View Details</DropdownMenuItem>
                  <DropdownMenuItem>Edit Booking</DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">Cancel Booking</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-border/60 to-transparent" />

            {/* Details Grid */}
            <div className="grid grid-cols-1 gap-3">
              {/* Customer */}
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-primary/10 p-2 flex-shrink-0">
                  <User 
                    className="h-4 w-4 text-primary"
                    style={{ 
                      width: 'clamp(0.875rem, 0.75rem + 0.5vw, 1rem)',
                      height: 'clamp(0.875rem, 0.75rem + 0.5vw, 1rem)'
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p 
                    className="text-muted-foreground text-xs font-medium mb-0.5"
                    style={{ fontSize: 'clamp(0.625rem, 0.5rem + 0.5vw, 0.75rem)' }}
                  >
                    Customer
                  </p>
                  <p 
                    className="font-semibold text-foreground truncate"
                    style={{ fontSize: 'clamp(0.875rem, 0.75rem + 0.5vw, 1rem)' }}
                  >
                    {booking.customer}
                  </p>
                </div>
              </div>

              {/* Staff */}
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-accent/10 p-2 flex-shrink-0">
                  <Briefcase 
                    className="h-4 w-4 text-accent"
                    style={{ 
                      width: 'clamp(0.875rem, 0.75rem + 0.5vw, 1rem)',
                      height: 'clamp(0.875rem, 0.75rem + 0.5vw, 1rem)'
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p 
                    className="text-muted-foreground text-xs font-medium mb-0.5"
                    style={{ fontSize: 'clamp(0.625rem, 0.5rem + 0.5vw, 0.75rem)' }}
                  >
                    Assigned Staff
                  </p>
                  <p 
                    className="font-semibold text-foreground truncate"
                    style={{ fontSize: 'clamp(0.875rem, 0.75rem + 0.5vw, 1rem)' }}
                  >
                    {booking.staff}
                  </p>
                </div>
              </div>

              {/* Date & Time */}
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-primary/10 p-2 flex-shrink-0">
                  <Clock 
                    className="h-4 w-4 text-primary"
                    style={{ 
                      width: 'clamp(0.875rem, 0.75rem + 0.5vw, 1rem)',
                      height: 'clamp(0.875rem, 0.75rem + 0.5vw, 1rem)'
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p 
                    className="text-muted-foreground text-xs font-medium mb-0.5"
                    style={{ fontSize: 'clamp(0.625rem, 0.5rem + 0.5vw, 0.75rem)' }}
                  >
                    Date & Time
                  </p>
                  <div className="flex flex-col gap-0.5">
                    <p 
                      className="font-semibold text-foreground"
                      style={{ fontSize: 'clamp(0.875rem, 0.75rem + 0.5vw, 1rem)' }}
                    >
                      {format(bookingDate, 'PPP')}
                    </p>
                    <p 
                      className="text-muted-foreground font-medium"
                      style={{ fontSize: 'clamp(0.75rem, 0.625rem + 0.5vw, 0.875rem)' }}
                    >
                      {format(bookingDate, 'p')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Skeleton Loader
  const AppointmentSkeleton = () => (
    <Card className="border-border/60">
      <CardContent className="p-4 sm:p-5 lg:p-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
          <Skeleton className="h-px w-full" />
          <div className="space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <div className="flex flex-col w-full max-w-none">
        {/* Page Header Skeleton */}
        <section className="mb-4 sm:mb-6 md:mb-8 lg:mb-10 w-full">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </section>

        {/* Filters Skeleton */}
        <section className="mb-4 sm:mb-6 md:mb-8 w-full">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-full sm:w-32" />
          </div>
        </section>

        {/* Date Picker Skeleton */}
        <section className="mb-4 sm:mb-6 md:mb-8 w-full">
          <Skeleton className="h-24 w-full lg:h-auto lg:w-80" />
        </section>

        {/* Appointments Skeleton */}
        <section className="w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <AppointmentSkeleton key={i} />
            ))}
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="flex flex-col w-full max-w-none">
      {/* Page Header Section */}
      <section className="mb-4 sm:mb-6 md:mb-8 lg:mb-10 w-full">
        <div className="flex flex-col gap-3 sm:gap-4">
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
                Manage and view all your appointments ({bookings.length} total)
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button 
                variant="outline" 
                className="w-full sm:w-auto"
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
                <span>Filter</span>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="mb-4 sm:mb-6 md:mb-8 w-full">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search bookings by customer, service, or staff..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11"
              style={{ fontSize: 'clamp(0.875rem, 0.75rem + 0.5vw, 1rem)' }}
            />
          </div>
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as FilterStatus)}>
            <SelectTrigger className="w-full sm:w-[180px] h-11">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Confirmed">Confirmed</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>

      {/* Calendar and Appointments Grid */}
      <section className="w-full">
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-4 xl:gap-8 2xl:gap-10">
          {/* Desktop Calendar */}
          <DesktopCalendar />

          {/* Appointments Section */}
          <div className="lg:col-span-3 w-full">
            {/* Horizontal Date Picker - Always visible, scrollable */}
            <div className="mb-4 sm:mb-6">
              <HorizontalDatePicker />
            </div>

            {/* Appointments Card */}
            <Card className="w-full border-border/60 bg-card/95 backdrop-blur-sm shadow-3d-sm">
              <CardHeader className="pb-4 sm:pb-5 md:pb-6">
                <div className="flex flex-col gap-1 sm:gap-2">
                  <CardTitle 
                    className="text-foreground flex items-center gap-2"
                    style={{ fontSize: 'clamp(1.125rem, 1rem + 0.75vw, 1.5rem)' }}
                  >
                    <CalendarIcon className="h-5 w-5" />
                    {date ? (
                      viewMode === 'day' ? (
                        <>Appointments for {format(date, 'PPP')}</>
                      ) : viewMode === 'week' ? (
                        <>Week of {format(startOfWeek(date, { weekStartsOn: 1 }), 'MMM d')}</>
                      ) : (
                        <>Appointments for {format(date, 'MMMM yyyy')}</>
                      )
                    ) : (
                      'Select a date'
                    )}
                  </CardTitle>
                  <CardDescription 
                    className="text-muted-foreground"
                    style={{ fontSize: 'clamp(0.75rem, 0.625rem + 0.5vw, 0.875rem)' }}
                  >
                    {filteredBookings.length === 0 
                      ? 'No appointments found'
                      : `${filteredBookings.length} appointment${filteredBookings.length !== 1 ? 's' : ''} scheduled`
                    }
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-5 md:p-6 lg:p-8">
                {filteredBookings.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
                    {filteredBookings.map((booking) => (
                      <AppointmentCard key={booking.id} booking={booking} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 sm:py-16 lg:py-20 text-muted-foreground">
                    <div className="flex flex-col items-center gap-4">
                      <div className="rounded-full bg-muted/50 p-4">
                        <CalendarIcon 
                          className="h-12 w-12 sm:h-16 sm:w-16 opacity-50"
                          style={{ 
                            width: 'clamp(3rem, 2.5rem + 2vw, 4rem)',
                            height: 'clamp(3rem, 2.5rem + 2vw, 4rem)'
                          }}
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <p 
                          className="font-semibold text-foreground"
                          style={{ fontSize: 'clamp(1rem, 0.875rem + 0.5vw, 1.25rem)' }}
                        >
                          {searchQuery || statusFilter !== 'all' 
                            ? 'No bookings match your filters'
                            : 'No appointments found'
                          }
                        </p>
                        <p 
                          className="text-muted-foreground"
                          style={{ fontSize: 'clamp(0.875rem, 0.75rem + 0.5vw, 1rem)' }}
                        >
                          {searchQuery || statusFilter !== 'all'
                            ? 'Try adjusting your search or filter criteria'
                            : 'Select another date or create a new booking'
                          }
                        </p>
                      </div>
                      {(searchQuery || statusFilter !== 'all') && (
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSearchQuery('')
                            setStatusFilter('all')
                          }}
                          className="mt-2"
                        >
                          Clear Filters
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
