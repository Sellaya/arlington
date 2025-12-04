"use client"

import * as React from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { bookings } from "@/lib/data"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Filter } from "lucide-react"

export default function BookingsPage() {
  const [date, setDate] = React.useState<Date | undefined>(new Date())

  const appointmentsForDate = bookings.filter(b => date && format(b.dateTime, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">Bookings</h1>
          <p className="text-muted-foreground">
            View and manage your appointments.
          </p>
        </div>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Select a Date
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border"
              />
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>
                Appointments for {date ? format(date, 'PPP') : '...'}
              </CardTitle>
              <CardDescription>
                You have {appointmentsForDate.length} appointment(s) scheduled for this day.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {appointmentsForDate.length > 0 ? (
                  appointmentsForDate.map((booking) => (
                    <div key={booking.id} className="flex items-start justify-between rounded-lg border p-4">
                      <div>
                        <p className="font-semibold">{booking.service}</p>
                        <p className="text-sm text-muted-foreground">
                          with {booking.customer}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Staff: {booking.staff}
                        </p>
                        <p className="text-sm font-medium pt-2">
                          {format(booking.dateTime, 'p')}
                        </p>
                      </div>
                      <Badge variant={booking.status === 'Confirmed' ? 'default' : booking.status === 'Cancelled' ? 'destructive' : 'secondary'}>{booking.status}</Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    No appointments for this date.
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
