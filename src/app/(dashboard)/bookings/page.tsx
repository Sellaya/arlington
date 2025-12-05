"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import type { Booking } from "@/lib/types"
import { format, isToday, isPast } from "date-fns"
import { 
  Calendar as CalendarIcon, 
  Filter, 
  Clock, 
  User, 
  Briefcase, 
  Search,
  MoreVertical,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  MapPin,
  Phone,
  Mail,
  Grid3x3,
  List,
  X
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SavedFilters } from "@/components/saved-filters"
import { getDefaultView, getCurrentUserRole, type FilterType } from "@/lib/filter-service"

type FilterStatus = 'all' | 'Confirmed' | 'Pending' | 'Cancelled'
type SortOption = 'date-asc' | 'date-desc' | 'customer-asc' | 'customer-desc' | 'service-asc' | 'service-desc'
type ViewMode = 'cards' | 'table'

export default function BookingsPage() {
  const { toast } = useToast()
  const [bookings, setBookings] = React.useState<Booking[]>([])
  const [loading, setLoading] = React.useState(true)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<FilterStatus>('all')
  const [sortOption, setSortOption] = React.useState<SortOption>('date-asc')
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(null)
  const [expandedCards, setExpandedCards] = React.useState<Set<string>>(new Set())
  const [viewMode, setViewMode] = React.useState<ViewMode>('cards')
  const [filtersOpen, setFiltersOpen] = React.useState(false)
  const [activeFilters, setActiveFilters] = React.useState<Record<string, any>>({
    status: statusFilter,
    search: searchQuery,
    date: selectedDate,
    sort: sortOption,
  })
  
  // Dialog states
  const [selectedBooking, setSelectedBooking] = React.useState<Booking | null>(null)
  const [viewDetailsOpen, setViewDetailsOpen] = React.useState(false)
  const [editDialogOpen, setEditDialogOpen] = React.useState(false)
  const [cancelDialogOpen, setCancelDialogOpen] = React.useState(false)
  const [editFormData, setEditFormData] = React.useState({
    service: '',
    staff: '',
    dateTime: '',
    status: 'Pending' as 'Confirmed' | 'Pending' | 'Cancelled',
    notes: '',
  })

  // Apply default view on mount
  React.useEffect(() => {
    const role = getCurrentUserRole()
    const defaultView = getDefaultView(role, 'bookings' as FilterType)
    if (defaultView) {
      setActiveFilters(defaultView.filters)
      if (defaultView.filters.status) setStatusFilter(defaultView.filters.status)
      if (defaultView.filters.sort) setSortOption(defaultView.filters.sort)
    }
  }, [])

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

  // Filter and sort bookings
  const filteredAndSortedBookings = React.useMemo(() => {
    let filtered = bookings

    // Filter by selected date
    if (selectedDate) {
      filtered = filtered.filter(b => {
        const bookingDate = b.dateTime instanceof Date ? b.dateTime : new Date(b.dateTime)
        return format(bookingDate, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
      })
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

    // Sort bookings
    filtered.sort((a, b) => {
      const aDate = a.dateTime instanceof Date ? a.dateTime : new Date(a.dateTime)
      const bDate = b.dateTime instanceof Date ? b.dateTime : new Date(b.dateTime)

      switch (sortOption) {
        case 'date-asc':
          return aDate.getTime() - bDate.getTime()
        case 'date-desc':
          return bDate.getTime() - aDate.getTime()
        case 'customer-asc':
          return a.customer.localeCompare(b.customer)
        case 'customer-desc':
          return b.customer.localeCompare(a.customer)
        case 'service-asc':
          return a.service.localeCompare(b.service)
        case 'service-desc':
          return b.service.localeCompare(a.service)
        default:
          return 0
      }
    })

    return filtered
  }, [bookings, selectedDate, statusFilter, searchQuery, sortOption])

  // Group bookings by date
  const groupedBookings = React.useMemo(() => {
    const groups: Record<string, Booking[]> = {}
    
    filteredAndSortedBookings.forEach(booking => {
      const bookingDate = booking.dateTime instanceof Date ? booking.dateTime : new Date(booking.dateTime)
      const dateKey = format(bookingDate, 'yyyy-MM-dd')
      
      if (!groups[dateKey]) {
        groups[dateKey] = []
      }
      groups[dateKey].push(booking)
    })

    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b))
  }, [filteredAndSortedBookings])

  // Get unique dates from bookings
  const availableDates = React.useMemo(() => {
    const dates = new Set<string>()
    bookings.forEach(booking => {
      const bookingDate = booking.dateTime instanceof Date ? booking.dateTime : new Date(booking.dateTime)
      dates.add(format(bookingDate, 'yyyy-MM-dd'))
    })
    return Array.from(dates).sort()
  }, [bookings])

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

  // Toggle card expansion
  const toggleCard = (bookingId: string) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev)
      if (newSet.has(bookingId)) {
        newSet.delete(bookingId)
      } else {
        newSet.add(bookingId)
      }
      return newSet
    })
  }

  // Handle view details
  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking)
    setViewDetailsOpen(true)
  }

  // Handle edit booking
  const handleEditBooking = (booking: Booking) => {
    setSelectedBooking(booking)
    const bookingDate = booking.dateTime instanceof Date ? booking.dateTime : new Date(booking.dateTime)
    setEditFormData({
      service: booking.service,
      staff: booking.staff,
      dateTime: format(bookingDate, "yyyy-MM-dd'T'HH:mm"),
      status: booking.status,
      notes: '',
    })
    setEditDialogOpen(true)
  }

  // Handle save edit
  const handleSaveEdit = () => {
    if (!selectedBooking) return
    
    // Update booking in state
    setBookings(prev => prev.map(b => 
      b.id === selectedBooking.id 
        ? {
            ...b,
            service: editFormData.service,
            staff: editFormData.staff,
            dateTime: new Date(editFormData.dateTime),
            status: editFormData.status,
          }
        : b
    ))
    
    toast({
      title: 'Booking updated',
      description: 'Booking details have been updated successfully',
    })
    
    setEditDialogOpen(false)
    setSelectedBooking(null)
  }

  // Handle cancel booking
  const handleCancelBooking = () => {
    if (!selectedBooking) return
    
    // Update booking status to Cancelled
    setBookings(prev => prev.map(b => 
      b.id === selectedBooking.id 
        ? { ...b, status: 'Cancelled' as const }
        : b
    ))
    
    toast({
      title: 'Booking cancelled',
      description: 'The booking has been cancelled successfully',
      variant: 'default',
    })
    
    setCancelDialogOpen(false)
    setSelectedBooking(null)
  }

  // Open cancel dialog
  const handleCancelClick = (booking: Booking) => {
    setSelectedBooking(booking)
    setCancelDialogOpen(true)
  }

  // Count active filters
  const activeFiltersCount = React.useMemo(() => {
    let count = 0
    if (searchQuery.trim()) count++
    if (statusFilter !== 'all') count++
    if (selectedDate) count++
    return count
  }, [searchQuery, statusFilter, selectedDate])

  // Enhanced Appointment Card Component - Clean Single-Line Layout
  const AppointmentCard = ({ booking }: { booking: Booking }) => {
    const bookingDate = booking.dateTime instanceof Date ? booking.dateTime : new Date(booking.dateTime)
    const isPastBooking = isPast(bookingDate) && !isToday(bookingDate)
    const isTodayBooking = isToday(bookingDate)
    const isExpanded = expandedCards.has(booking.id)
    
    return (
      <Card
        className={`group w-full border-2 transition-all duration-300 hover:shadow-3d-md hover:-translate-y-1 touch-3d active:scale-[0.98] transform-gpu ${
          isPastBooking 
            ? 'border-border/40 bg-muted/20 opacity-75' 
            : isTodayBooking
            ? 'border-primary/40 bg-primary/5'
            : 'border-border/60 bg-gradient-to-br from-card/95 to-card/90 backdrop-blur-sm hover:border-primary/30'
        }`}
      >
        <CardContent className="p-4 sm:p-5 md:p-6">
          <div className="flex flex-col gap-3">
            {/* Top Row: Service Name, Today Badge, Status, Actions */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <h3 
                    className="font-bold text-foreground break-words"
                    style={{ fontSize: 'clamp(1rem, 0.875rem + 0.5vw, 1.25rem)' }}
                  >
                    {booking.service}
                  </h3>
                  {isTodayBooking && (
                    <Badge variant="default" className="text-xs flex-shrink-0">
                      Today
                    </Badge>
                  )}
                  <Badge 
                    variant={booking.status === 'Confirmed' ? 'default' : booking.status === 'Cancelled' ? 'destructive' : 'secondary'}
                    className="text-xs font-medium px-2 py-0.5 flex items-center gap-1 flex-shrink-0"
                  >
                    {getStatusIcon(booking.status)}
                    {booking.status}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <Collapsible open={isExpanded} onOpenChange={() => toggleCard(booking.id)}>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                </Collapsible>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleViewDetails(booking)}>
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleEditBooking(booking)}>
                      Edit Booking
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-destructive"
                      onClick={() => handleCancelClick(booking)}
                    >
                      Cancel Booking
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Details Row - Single line layout */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-2 border-t border-border/40">
              {/* Customer */}
              <div className="flex items-center gap-2 min-w-0 flex-1 sm:flex-initial">
                <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span 
                  className="font-medium text-foreground truncate"
                  style={{ fontSize: 'clamp(0.875rem, 0.75rem + 0.5vw, 1rem)' }}
                >
                  {booking.customer}
                </span>
              </div>

              {/* Staff */}
              <div className="flex items-center gap-2 min-w-0 flex-1 sm:flex-initial">
                <Briefcase className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span 
                  className="font-medium text-foreground truncate"
                  style={{ fontSize: 'clamp(0.875rem, 0.75rem + 0.5vw, 1rem)' }}
                >
                  {booking.staff}
                </span>
              </div>

              {/* Date & Time */}
              <div className="flex items-center gap-2 min-w-0 flex-1 sm:flex-initial">
                <Clock className="h-4 w-4 text-primary flex-shrink-0" />
                <span 
                  className="font-semibold text-foreground whitespace-nowrap"
                  style={{ fontSize: 'clamp(0.875rem, 0.75rem + 0.5vw, 1rem)' }}
                >
                  {format(bookingDate, 'MMM d')} • {format(bookingDate, 'p')}
                </span>
              </div>
            </div>

            {/* Expanded Details */}
            <Collapsible open={isExpanded} onOpenChange={() => toggleCard(booking.id)}>
              <CollapsibleContent className="space-y-3 pt-2 border-t border-border/40">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground mb-0.5">Location</p>
                      <p className="text-sm font-medium">Event Venue</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground mb-0.5">Contact</p>
                      <p className="text-sm font-medium">+1 (555) 123-4567</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground mb-0.5">Notes</p>
                    <p className="text-sm text-muted-foreground">No additional notes</p>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Table View Component for Desktop
  const TableView = () => {
    if (filteredAndSortedBookings.length === 0) return null

    return (
      <Card className="w-full border-border/60 bg-card/95 backdrop-blur-sm shadow-3d-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border/60">
                  <TableHead className="min-w-[200px] font-semibold" style={{ fontSize: 'clamp(0.75rem, 0.625rem + 0.5vw, 0.875rem)' }}>
                    Service
                  </TableHead>
                  <TableHead className="min-w-[150px] font-semibold" style={{ fontSize: 'clamp(0.75rem, 0.625rem + 0.5vw, 0.875rem)' }}>
                    Customer
                  </TableHead>
                  <TableHead className="min-w-[150px] font-semibold hidden lg:table-cell" style={{ fontSize: 'clamp(0.75rem, 0.625rem + 0.5vw, 0.875rem)' }}>
                    Staff
                  </TableHead>
                  <TableHead className="min-w-[180px] font-semibold" style={{ fontSize: 'clamp(0.75rem, 0.625rem + 0.5vw, 0.875rem)' }}>
                    Date & Time
                  </TableHead>
                  <TableHead className="min-w-[120px] font-semibold" style={{ fontSize: 'clamp(0.75rem, 0.625rem + 0.5vw, 0.875rem)' }}>
                    Status
                  </TableHead>
                  <TableHead className="w-[60px] text-right font-semibold" style={{ fontSize: 'clamp(0.75rem, 0.625rem + 0.5vw, 0.875rem)' }}>
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedBookings.map((booking) => {
                  const bookingDate = booking.dateTime instanceof Date ? booking.dateTime : new Date(booking.dateTime)
                  const isTodayBooking = isToday(bookingDate)
                  const isPastBooking = isPast(bookingDate) && !isTodayBooking

                  return (
                    <TableRow 
                      key={booking.id}
                      className={`group border-border/40 hover:bg-muted/30 transition-colors ${
                        isPastBooking ? 'opacity-75' : ''
                      }`}
                    >
                      <TableCell className="py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 min-w-0">
                            <p 
                              className="font-semibold text-foreground truncate"
                              style={{ fontSize: 'clamp(0.875rem, 0.75rem + 0.5vw, 1rem)' }}
                            >
                              {booking.service}
                            </p>
                            {isTodayBooking && (
                              <Badge variant="default" className="text-xs mt-1">
                                Today
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8 flex-shrink-0 ring-2 ring-border/40">
                            <AvatarFallback className="text-xs">
                              {booking.customer.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <p 
                            className="font-medium text-foreground truncate"
                            style={{ fontSize: 'clamp(0.875rem, 0.75rem + 0.5vw, 1rem)' }}
                          >
                            {booking.customer}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 hidden lg:table-cell">
                        <p 
                          className="text-muted-foreground truncate"
                          style={{ fontSize: 'clamp(0.875rem, 0.75rem + 0.5vw, 1rem)' }}
                        >
                          {booking.staff}
                        </p>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex flex-col gap-0.5">
                          <p 
                            className="font-medium text-foreground"
                            style={{ fontSize: 'clamp(0.875rem, 0.75rem + 0.5vw, 1rem)' }}
                          >
                            {format(bookingDate, 'MMM d, yyyy')}
                          </p>
                          <p 
                            className="text-muted-foreground"
                            style={{ fontSize: 'clamp(0.75rem, 0.625rem + 0.5vw, 0.875rem)' }}
                          >
                            {format(bookingDate, 'p')}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge 
                          variant={booking.status === 'Confirmed' ? 'default' : booking.status === 'Cancelled' ? 'destructive' : 'secondary'}
                          className="text-xs font-medium"
                        >
                          <div className="flex items-center gap-1">
                            {getStatusIcon(booking.status)}
                            <span>{booking.status}</span>
                          </div>
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleViewDetails(booking)}>
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditBooking(booking)}>
                              Edit Booking
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => handleCancelClick(booking)}
                            >
                              Cancel Booking
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Filters Component - Reusable for mobile drawer and desktop
  const FiltersContent = ({ onClose }: { onClose?: () => void }) => (
    <div className="flex flex-col gap-4">
      {/* Saved Filters - Mobile */}
      <div className="lg:hidden">
        <SavedFilters
          type="bookings"
          currentFilters={activeFilters}
          onApplyFilter={(filters) => {
            setActiveFilters(filters)
            if (filters.status) setStatusFilter(filters.status)
            if (filters.search) setSearchQuery(filters.search)
            if (filters.sort) setSortOption(filters.sort)
            if (onClose) onClose()
          }}
        />
      </div>
      {/* Search Bar */}
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 lg:h-5 lg:w-5 text-muted-foreground" />
        <Input
          placeholder="Search bookings..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 lg:pl-12 h-11 lg:h-12"
          style={{ fontSize: 'clamp(0.875rem, 0.75rem + 0.5vw, 1rem)' }}
        />
      </div>

      {/* Filters Row */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 lg:gap-5">
        {/* Date Filter */}
        <Select 
          value={selectedDate ? format(selectedDate, 'yyyy-MM-dd') : 'all'} 
          onValueChange={(value) => {
            if (value === 'all') {
              setSelectedDate(null)
            } else {
              setSelectedDate(new Date(value))
            }
          }}
        >
          <SelectTrigger className="w-full sm:w-[200px] lg:w-[220px] h-11 lg:h-12">
            <CalendarIcon className="mr-2 h-4 w-4 lg:h-5 lg:w-5" />
            <SelectValue placeholder="Filter by date" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Dates</SelectItem>
            {availableDates.map(dateStr => {
              const date = new Date(dateStr)
              return (
                <SelectItem key={dateStr} value={dateStr}>
                  {format(date, 'PPP')}
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>

        {/* Status Filter */}
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as FilterStatus)}>
          <SelectTrigger className="w-full sm:w-[180px] lg:w-[200px] h-11 lg:h-12">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Confirmed">Confirmed</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort Filter */}
        <Select value={sortOption} onValueChange={(value) => setSortOption(value as SortOption)}>
          <SelectTrigger className="w-full sm:w-[180px] lg:w-[200px] h-11 lg:h-12">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date-asc">Date (Oldest First)</SelectItem>
            <SelectItem value="date-desc">Date (Newest First)</SelectItem>
            <SelectItem value="customer-asc">Customer (A-Z)</SelectItem>
            <SelectItem value="customer-desc">Customer (Z-A)</SelectItem>
            <SelectItem value="service-asc">Service (A-Z)</SelectItem>
            <SelectItem value="service-desc">Service (Z-A)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Clear Filters Button */}
      {activeFiltersCount > 0 && (
        <Button
          variant="outline"
          onClick={() => {
            setSearchQuery('')
            setStatusFilter('all')
            setSelectedDate(null)
            onClose?.()
          }}
          className="w-full sm:w-auto"
        >
          Clear All Filters
        </Button>
      )}
    </div>
  )

  // Skeleton Loader
  const AppointmentSkeleton = () => (
    <Card className="border-border/60 w-full">
      <CardContent className="p-4 sm:p-5 md:p-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
          <Skeleton className="h-16 w-full" />
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
          <Skeleton className="h-10 w-full mb-3" />
          <div className="flex flex-col sm:flex-row gap-3">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-full sm:w-32" />
            <Skeleton className="h-10 w-full sm:w-32" />
          </div>
        </section>

        {/* Appointments Skeleton */}
        <section className="w-full">
          <div className="flex flex-col gap-4 sm:gap-5 md:gap-6">
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
      {/* Page Header Section - Mobile First */}
      <section className="mb-3 sm:mb-4 md:mb-6 lg:mb-8 w-full">
        <div className="flex flex-col gap-2 sm:gap-3 lg:gap-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-3 lg:gap-4">
            <div className="flex-1 min-w-0">
              <h1 
                className="font-bold font-headline text-foreground mb-1 sm:mb-2"
                style={{ fontSize: 'clamp(1.5rem, 1.25rem + 1vw, 2.5rem)' }}
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
            {/* View Toggle + Saved Filters - Desktop Only */}
            <div className="hidden lg:flex items-center gap-2 flex-shrink-0">
              <SavedFilters
                type="bookings"
                currentFilters={activeFilters}
                onApplyFilter={(filters) => {
                  setActiveFilters(filters)
                  if (filters.status) setStatusFilter(filters.status)
                  if (filters.search) setSearchQuery(filters.search)
                  if (filters.sort) setSortOption(filters.sort)
                }}
              />
              <div className="flex items-center gap-1 rounded-lg border-2 border-border/60 bg-muted/30 p-1">
                <Button
                  variant={viewMode === 'cards' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('cards')}
                  className="h-8 px-3"
                >
                  <Grid3x3 className="h-4 w-4 mr-2" />
                  Cards
                </Button>
                <Button
                  variant={viewMode === 'table' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('table')}
                  className="h-8 px-3"
                >
                  <List className="h-4 w-4 mr-2" />
                  Table
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filter Section - Mobile First */}
      <section className="mb-3 sm:mb-4 md:mb-6 lg:mb-8 w-full">
        {/* Mobile: Filters Button + View Toggle */}
        <div className="flex items-center gap-2 mb-3 lg:hidden">
          <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="flex-1 h-11 justify-start">
                <Filter className="mr-2 h-4 w-4" />
                <span>Filters</span>
                {activeFiltersCount > 0 && (
                  <Badge variant="default" className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="top" className="h-auto max-h-[90vh] overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
                <SheetDescription>
                  Filter and search your bookings
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6">
                <FiltersContent onClose={() => setFiltersOpen(false)} />
              </div>
            </SheetContent>
          </Sheet>
          
          {/* Mobile View Toggle */}
          <div className="flex items-center gap-1 rounded-lg border-2 border-border/60 bg-muted/30 p-1">
            <Button
              variant={viewMode === 'cards' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('cards')}
              className="h-9 px-2"
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
              className="h-9 px-2"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Desktop: Always Visible Filters */}
        <div className="hidden lg:block">
          <FiltersContent />
        </div>
      </section>

      {/* Bookings List Section - Mobile First */}
      <section className="w-full">
        {filteredAndSortedBookings.length > 0 ? (
          viewMode === 'table' ? (
            <TableView />
          ) : (
            <div className="flex flex-col gap-3 sm:gap-4 md:gap-5 lg:gap-6 xl:gap-8">
              {/* Group by Date */}
              {groupedBookings.length > 0 ? (
                groupedBookings.map(([dateKey, dateBookings]) => {
                  const date = new Date(dateKey)
                  const isTodayDate = isToday(date)
                  const isPastDate = isPast(date) && !isTodayDate

                  return (
                    <div key={dateKey} className="flex flex-col gap-3 sm:gap-4 lg:gap-5">
                      {/* Date Header - Mobile First */}
                      <div className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 rounded-lg lg:rounded-xl ${
                        isTodayDate 
                          ? 'bg-primary/10 border-2 border-primary/20 shadow-3d-sm' 
                          : isPastDate
                          ? 'bg-muted/30 border border-border/40'
                          : 'bg-muted/20 border border-border/40'
                      }`}>
                        <CalendarIcon className={`h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 flex-shrink-0 ${
                          isTodayDate ? 'text-primary' : 'text-muted-foreground'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <h2 
                            className={`font-semibold truncate ${
                              isTodayDate ? 'text-primary' : 'text-foreground'
                            }`}
                            style={{ fontSize: 'clamp(0.875rem, 0.75rem + 0.5vw, 1.5rem)' }}
                          >
                            {isTodayDate ? 'Today' : isPastDate ? 'Past' : format(date, 'EEEE, MMMM d, yyyy')}
                          </h2>
                          <p 
                            className="text-muted-foreground truncate"
                            style={{ fontSize: 'clamp(0.75rem, 0.625rem + 0.5vw, 0.875rem)' }}
                          >
                            {dateBookings.length} appointment{dateBookings.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>

                      {/* Bookings Grid - Mobile First: Full Width, then Responsive Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
                        {dateBookings.map((booking) => (
                          <AppointmentCard key={booking.id} booking={booking} />
                        ))}
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
                  {filteredAndSortedBookings.map((booking) => (
                    <AppointmentCard key={booking.id} booking={booking} />
                  ))}
                </div>
              )}
            </div>
          )
        ) : (
          <Card className="w-full border-border/60 bg-card/95 backdrop-blur-sm">
            <CardContent className="p-8 sm:p-12 lg:p-16 xl:p-20">
              <div className="text-center text-muted-foreground">
                <div className="flex flex-col items-center gap-3 sm:gap-4">
                  <div className="rounded-full bg-muted/50 p-3 sm:p-4">
                    <CalendarIcon 
                      className="h-10 w-10 sm:h-12 sm:w-12 lg:h-16 lg:w-16 opacity-50"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <p 
                      className="font-semibold text-foreground"
                      style={{ fontSize: 'clamp(1rem, 0.875rem + 0.5vw, 1.25rem)' }}
                    >
                      {searchQuery || statusFilter !== 'all' || selectedDate
                        ? 'No bookings match your filters'
                        : 'No appointments found'
                      }
                    </p>
                    <p 
                      className="text-muted-foreground"
                      style={{ fontSize: 'clamp(0.875rem, 0.75rem + 0.5vw, 1rem)' }}
                    >
                      {searchQuery || statusFilter !== 'all' || selectedDate
                        ? 'Try adjusting your search or filter criteria'
                        : 'Create a new booking to get started'
                      }
                    </p>
                  </div>
                  {(searchQuery || statusFilter !== 'all' || selectedDate) && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchQuery('')
                        setStatusFilter('all')
                        setSelectedDate(null)
                      }}
                      className="mt-2"
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </section>

      {/* View Details Dialog */}
      <Dialog open={viewDetailsOpen} onOpenChange={setViewDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
            <DialogDescription>
              Complete information for this booking
            </DialogDescription>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Customer</Label>
                  <p className="font-semibold">{selectedBooking.customer}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Service</Label>
                  <p className="font-semibold">{selectedBooking.service}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Staff</Label>
                  <p className="font-semibold">{selectedBooking.staff}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <Badge 
                    variant={selectedBooking.status === 'Confirmed' ? 'default' : selectedBooking.status === 'Cancelled' ? 'destructive' : 'secondary'}
                  >
                    {selectedBooking.status}
                  </Badge>
                </div>
                <div className="col-span-2">
                  <Label className="text-muted-foreground">Date & Time</Label>
                  <p className="font-semibold">
                    {format(selectedBooking.dateTime instanceof Date ? selectedBooking.dateTime : new Date(selectedBooking.dateTime), 'PPpp')}
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDetailsOpen(false)}>
              Close
            </Button>
            <Button onClick={() => {
              setViewDetailsOpen(false)
              if (selectedBooking) handleEditBooking(selectedBooking)
            }}>
              Edit Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Booking Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Booking</DialogTitle>
            <DialogDescription>
              Update booking details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="service">Service</Label>
              <Input
                id="service"
                value={editFormData.service}
                onChange={(e) => setEditFormData(prev => ({ ...prev, service: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="staff">Staff</Label>
              <Input
                id="staff"
                value={editFormData.staff}
                onChange={(e) => setEditFormData(prev => ({ ...prev, staff: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateTime">Date & Time</Label>
              <Input
                id="dateTime"
                type="datetime-local"
                value={editFormData.dateTime}
                onChange={(e) => setEditFormData(prev => ({ ...prev, dateTime: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={editFormData.status}
                onValueChange={(value: 'Confirmed' | 'Pending' | 'Cancelled') => 
                  setEditFormData(prev => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Confirmed">Confirmed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={editFormData.notes}
                onChange={(e) => setEditFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
                placeholder="Add any additional notes..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Booking Confirmation Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this booking? This action cannot be undone.
              {selectedBooking && (
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <p className="font-semibold">{selectedBooking.service}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedBooking.customer} • {format(selectedBooking.dateTime instanceof Date ? selectedBooking.dateTime : new Date(selectedBooking.dateTime), 'PPpp')}
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Booking</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelBooking}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Cancel Booking
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
