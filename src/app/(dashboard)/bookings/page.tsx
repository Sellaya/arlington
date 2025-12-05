"use client"

import * as React from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Booking } from "@/lib/types"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Filter } from "lucide-react"

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

  if (loading) {
    return (
      <div className="flex flex-col gap-4 sm:gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-headline">Bookings</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">View and manage your appointments.</p>
        </div>
        <div className="text-center py-12 sm:py-16 text-muted-foreground">
          <div className="inline-block animate-pulse">Loading bookings...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 sm:gap-6 lg:gap-8 xl:gap-10">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between lg:gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold font-headline">Bookings</h1>
          <p className="text-sm sm:text-base lg:text-lg text-muted-foreground mt-1 lg:mt-2">
            View and manage your appointments ({bookings.length} total)
          </p>
        </div>
        <Button variant="outline" className="w-full sm:w-auto lg:px-6 lg:h-11">
          <Filter className="mr-2 h-4 w-4 lg:h-5 lg:w-5" />
          <span className="hidden sm:inline lg:text-base">Filter</span>
          <span className="sm:hidden">Filter</span>
        </Button>
      </div>

      {/* Calendar and Appointments Grid */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-3 xl:gap-8 2xl:gap-10">
        {/* Calendar Card */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4 lg:top-6 xl:top-8">
            <CardHeader className="pb-3 sm:pb-4 lg:pb-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg lg:text-xl">
                <CalendarIcon className="h-5 w-5 lg:h-6 lg:w-6" />
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

        {/* Appointments Card */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3 sm:pb-4 lg:pb-6">
              <CardTitle className="text-base sm:text-lg lg:text-xl xl:text-2xl">
                Appointments for {date ? format(date, 'PPP') : '...'}
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm lg:text-base">
                You have {appointmentsForDate.length} appointment{appointmentsForDate.length !== 1 ? 's' : ''} scheduled for this day.
              </CardDescription>
            </CardHeader>
            <CardContent className="lg:p-6">
              <div className="space-y-3 sm:space-y-4 lg:space-y-5">
                {appointmentsForDate.length > 0 ? (
                  appointmentsForDate.map((booking) => (
                    <div 
                      key={booking.id} 
                      className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 lg:gap-6 rounded-xl border-2 border-border/60 bg-gradient-to-br from-card/90 to-card/80 backdrop-blur-sm p-4 sm:p-5 lg:p-6 shadow-3d-sm hover:shadow-3d-md hover:-translate-y-1 hover:border-primary/30 transition-all duration-200 touch-3d active:scale-[0.98] transform-gpu"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm sm:text-base lg:text-lg mb-1.5 lg:mb-2">{booking.service}</p>
                        <div className="space-y-1 lg:space-y-1.5 text-xs sm:text-sm lg:text-base text-muted-foreground">
                          <p>with {booking.customer}</p>
                          <p>Staff: {booking.staff}</p>
                          <p className="text-foreground font-medium pt-1 lg:pt-2">
                            {format(booking.dateTime, 'p')}
                          </p>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <Badge 
                          variant={booking.status === 'Confirmed' ? 'default' : booking.status === 'Cancelled' ? 'destructive' : 'secondary'}
                          className="text-xs sm:text-sm lg:text-base px-3 py-1"
                        >
                          {booking.status}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground py-8 sm:py-12">
                    <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm sm:text-base">No appointments for this date.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
