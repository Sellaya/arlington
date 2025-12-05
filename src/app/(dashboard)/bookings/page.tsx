"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { Booking } from "@/lib/types";
import { format, isToday, isPast, formatDistanceToNow } from "date-fns";
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
  MapPin,
  Phone,
  Mail,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SavedFilters } from "@/components/saved-filters";
import { getDefaultView, getCurrentUserRole, type FilterType } from "@/lib/filter-service";

type FilterStatus = "all" | "Confirmed" | "Pending" | "Cancelled";
type SortField = "date" | "customer" | "service" | "status";
type SortDirection = "asc" | "desc";

export default function BookingsPage() {
  const { toast } = useToast();
  const [bookings, setBookings] = React.useState<Booking[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<FilterStatus>("all");
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(null);
  const [sortField, setSortField] = React.useState<SortField>("date");
  const [sortDirection, setSortDirection] = React.useState<SortDirection>("asc");
  const [filtersOpen, setFiltersOpen] = React.useState(false);
  const [activeFilters, setActiveFilters] = React.useState<Record<string, any>>({
    status: statusFilter,
    search: searchQuery,
    date: selectedDate,
    sort: sortField,
  });

  // Dialog states
  const [selectedBooking, setSelectedBooking] = React.useState<Booking | null>(null);
  const [viewDetailsOpen, setViewDetailsOpen] = React.useState(false);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = React.useState(false);
  const [editFormData, setEditFormData] = React.useState({
    service: "",
    staff: "",
    dateTime: "",
    status: "Pending" as "Confirmed" | "Pending" | "Cancelled",
    notes: "",
  });

  // Apply default view on mount
  React.useEffect(() => {
    const role = getCurrentUserRole();
    const defaultView = getDefaultView(role, "bookings" as FilterType);
    if (defaultView) {
      setActiveFilters(defaultView.filters);
      if (defaultView.filters.status) setStatusFilter(defaultView.filters.status);
      if (defaultView.filters.sort) setSortField(defaultView.filters.sort);
    }
  }, []);

  React.useEffect(() => {
    fetch("/api/data")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch data");
        }
        return res.json();
      })
      .then((data) => {
        const processedBookings = (data.bookings || []).map((booking: any) => ({
          ...booking,
          dateTime: booking.dateTime ? new Date(booking.dateTime) : new Date(),
        }));
        setBookings(processedBookings);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching bookings:", err);
        setLoading(false);
      });
  }, []);

  // Get unique dates from bookings
  const availableDates = React.useMemo(() => {
    const dates = new Set<string>();
    bookings.forEach((booking) => {
      const bookingDate =
        booking.dateTime instanceof Date
          ? booking.dateTime
          : new Date(booking.dateTime);
      dates.add(format(bookingDate, "yyyy-MM-dd"));
    });
    return Array.from(dates).sort();
  }, [bookings]);

  // Filter and sort bookings
  const filteredAndSortedBookings = React.useMemo(() => {
    let filtered = bookings;

    // Filter by selected date
    if (selectedDate) {
      filtered = filtered.filter((b) => {
        const bookingDate =
          b.dateTime instanceof Date ? b.dateTime : new Date(b.dateTime);
        return format(bookingDate, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd");
      });
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((b) => b.status === statusFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.customer.toLowerCase().includes(query) ||
          b.service.toLowerCase().includes(query) ||
          b.staff.toLowerCase().includes(query)
      );
    }

    // Sort bookings
    filtered.sort((a, b) => {
      const aDate =
        a.dateTime instanceof Date ? a.dateTime : new Date(a.dateTime);
      const bDate =
        b.dateTime instanceof Date ? b.dateTime : new Date(b.dateTime);

      let comparison = 0;
      switch (sortField) {
        case "date":
          comparison = aDate.getTime() - bDate.getTime();
          break;
        case "customer":
          comparison = a.customer.localeCompare(b.customer);
          break;
        case "service":
          comparison = a.service.localeCompare(b.service);
          break;
        case "status":
          comparison = a.status.localeCompare(b.status);
          break;
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [bookings, selectedDate, statusFilter, searchQuery, sortField, sortDirection]);

  // Group bookings by date
  const groupedBookings = React.useMemo(() => {
    const groups: Record<string, Booking[]> = {};

    filteredAndSortedBookings.forEach((booking) => {
      const bookingDate =
        booking.dateTime instanceof Date
          ? booking.dateTime
          : new Date(booking.dateTime);
      const dateKey = format(bookingDate, "yyyy-MM-dd");

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(booking);
    });

    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [filteredAndSortedBookings]);

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Confirmed":
        return <CheckCircle2 className="h-4 w-4" />;
      case "Cancelled":
        return <XCircle className="h-4 w-4" />;
      case "Pending":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  // Toggle sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Get sort icon
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4 opacity-50" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="h-4 w-4" />
    ) : (
      <ArrowDown className="h-4 w-4" />
    );
  };

  // Handle view details
  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setViewDetailsOpen(true);
  };

  // Handle edit booking
  const handleEditBooking = (booking: Booking) => {
    setSelectedBooking(booking);
    const bookingDate =
      booking.dateTime instanceof Date
        ? booking.dateTime
        : new Date(booking.dateTime);
    setEditFormData({
      service: booking.service,
      staff: booking.staff,
      dateTime: format(bookingDate, "yyyy-MM-dd'T'HH:mm"),
      status: booking.status,
      notes: "",
    });
    setEditDialogOpen(true);
  };

  // Handle save edit
  const handleSaveEdit = () => {
    if (!selectedBooking) return;

    setBookings((prev) =>
      prev.map((b) =>
        b.id === selectedBooking.id
          ? {
              ...b,
              service: editFormData.service,
              staff: editFormData.staff,
              dateTime: new Date(editFormData.dateTime),
              status: editFormData.status,
            }
          : b
      )
    );

    toast({
      title: "Booking updated",
      description: "Booking details have been updated successfully",
    });

    setEditDialogOpen(false);
    setSelectedBooking(null);
  };

  // Handle cancel booking
  const handleCancelBooking = () => {
    if (!selectedBooking) return;

    setBookings((prev) =>
      prev.map((b) =>
        b.id === selectedBooking.id
          ? { ...b, status: "Cancelled" as const }
          : b
      )
    );

    toast({
      title: "Booking cancelled",
      description: "The booking has been cancelled successfully",
      variant: "default",
    });

    setCancelDialogOpen(false);
    setSelectedBooking(null);
  };

  // Open cancel dialog
  const handleCancelClick = (booking: Booking) => {
    setSelectedBooking(booking);
    setCancelDialogOpen(true);
  };

  // Count active filters
  const activeFiltersCount = React.useMemo(() => {
    let count = 0;
    if (searchQuery.trim()) count++;
    if (statusFilter !== "all") count++;
    if (selectedDate) count++;
    return count;
  }, [searchQuery, statusFilter, selectedDate]);

  // Mobile Card Component
  const MobileCard = ({ booking }: { booking: Booking }) => {
    const bookingDate =
      booking.dateTime instanceof Date
        ? booking.dateTime
        : new Date(booking.dateTime);
    const isPastBooking = isPast(bookingDate) && !isToday(bookingDate);
    const isTodayBooking = isToday(bookingDate);

    return (
      <Card
        className={`w-full border-2 transition-all duration-200 hover:shadow-3d-md active:scale-[0.98] ${
          isPastBooking
            ? "border-border/40 bg-muted/20 opacity-75"
            : isTodayBooking
            ? "border-primary/40 bg-primary/5"
            : "border-border/60 bg-card/95 hover:border-primary/30"
        }`}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <h3
                  className="font-semibold text-foreground truncate"
                  style={{
                    fontSize: "clamp(0.875rem, 0.75rem + 0.5vw, 1rem)",
                  }}
                >
                  {booking.service}
                </h3>
                {isTodayBooking && (
                  <Badge variant="default" className="text-xs flex-shrink-0">
                    Today
                  </Badge>
                )}
                <Badge
                  variant={
                    booking.status === "Confirmed"
                      ? "default"
                      : booking.status === "Cancelled"
                      ? "destructive"
                      : "secondary"
                  }
                  className="text-xs font-medium px-2 py-0.5 flex items-center gap-1 flex-shrink-0"
                >
                  {getStatusIcon(booking.status)}
                  {booking.status}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                <span
                  className="text-xs"
                  style={{
                    fontSize: "clamp(0.75rem, 0.625rem + 0.5vw, 0.875rem)",
                  }}
                >
                  {format(bookingDate, "MMM d")} • {format(bookingDate, "p")}
                </span>
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
          <div className="flex items-center gap-4 pt-3 border-t border-border/40">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <Avatar className="h-8 w-8 flex-shrink-0 ring-2 ring-border/40">
                <AvatarFallback className="text-xs">
                  {booking.customer
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p
                  className="font-medium text-foreground truncate"
                  style={{
                    fontSize: "clamp(0.875rem, 0.75rem + 0.5vw, 1rem)",
                  }}
                >
                  {booking.customer}
                </p>
                <p
                  className="text-muted-foreground truncate"
                  style={{
                    fontSize: "clamp(0.75rem, 0.625rem + 0.5vw, 0.875rem)",
                  }}
                >
                  {booking.staff}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Tablet Card Component
  const TabletCard = ({ booking }: { booking: Booking }) => {
    const bookingDate =
      booking.dateTime instanceof Date
        ? booking.dateTime
        : new Date(booking.dateTime);
    const isPastBooking = isPast(bookingDate) && !isToday(bookingDate);
    const isTodayBooking = isToday(bookingDate);

    return (
      <Card
        className={`w-full border-2 transition-all duration-200 hover:shadow-3d-md ${
          isPastBooking
            ? "border-border/40 bg-muted/20 opacity-75"
            : isTodayBooking
            ? "border-primary/40 bg-primary/5"
            : "border-border/60 bg-card/95 hover:border-primary/30"
        }`}
      >
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h3
                  className="font-semibold text-foreground"
                  style={{
                    fontSize: "clamp(0.875rem, 0.75rem + 0.5vw, 1rem)",
                  }}
                >
                  {booking.service}
                </h3>
                {isTodayBooking && (
                  <Badge variant="default" className="text-xs">
                    Today
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-4 text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  <span
                    className="text-sm"
                    style={{
                      fontSize: "clamp(0.75rem, 0.625rem + 0.5vw, 0.875rem)",
                    }}
                  >
                    {format(bookingDate, "MMM d, yyyy")} • {format(bookingDate, "p")}
                  </span>
                </div>
              </div>
            </div>
            <Badge
              variant={
                booking.status === "Confirmed"
                  ? "default"
                  : booking.status === "Cancelled"
                  ? "destructive"
                  : "secondary"
              }
              className="text-xs font-medium px-2 py-0.5 flex items-center gap-1"
            >
              {getStatusIcon(booking.status)}
              {booking.status}
            </Badge>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-border/40">
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9 flex-shrink-0 ring-2 ring-border/40">
                <AvatarFallback className="text-xs">
                  {booking.customer
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p
                  className="font-medium text-foreground"
                  style={{
                    fontSize: "clamp(0.875rem, 0.75rem + 0.5vw, 1rem)",
                  }}
                >
                  {booking.customer}
                </p>
                <p
                  className="text-muted-foreground"
                  style={{
                    fontSize: "clamp(0.75rem, 0.625rem + 0.5vw, 0.875rem)",
                  }}
                >
                  {booking.staff}
                </p>
              </div>
            </div>
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
        </CardContent>
      </Card>
    );
  };

  // Desktop Table Component
  const DesktopTable = () => {
    if (filteredAndSortedBookings.length === 0) return null;

    return (
      <Card className="w-full border-border/60 bg-card/95 backdrop-blur-sm shadow-3d-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border/60">
                  <TableHead
                    className="min-w-[200px] font-semibold cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => handleSort("service")}
                    style={{
                      fontSize: "clamp(0.75rem, 0.625rem + 0.5vw, 0.875rem)",
                    }}
                  >
                    <div className="flex items-center gap-2">
                      Service
                      {getSortIcon("service")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="min-w-[150px] font-semibold cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => handleSort("customer")}
                    style={{
                      fontSize: "clamp(0.75rem, 0.625rem + 0.5vw, 0.875rem)",
                    }}
                  >
                    <div className="flex items-center gap-2">
                      Customer
                      {getSortIcon("customer")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="min-w-[150px] font-semibold"
                    style={{
                      fontSize: "clamp(0.75rem, 0.625rem + 0.5vw, 0.875rem)",
                    }}
                  >
                    Staff
                  </TableHead>
                  <TableHead
                    className="min-w-[180px] font-semibold cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => handleSort("date")}
                    style={{
                      fontSize: "clamp(0.75rem, 0.625rem + 0.5vw, 0.875rem)",
                    }}
                  >
                    <div className="flex items-center gap-2">
                      Date & Time
                      {getSortIcon("date")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="min-w-[120px] font-semibold cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => handleSort("status")}
                    style={{
                      fontSize: "clamp(0.75rem, 0.625rem + 0.5vw, 0.875rem)",
                    }}
                  >
                    <div className="flex items-center gap-2">
                      Status
                      {getSortIcon("status")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="w-[60px] text-right font-semibold"
                    style={{
                      fontSize: "clamp(0.75rem, 0.625rem + 0.5vw, 0.875rem)",
                    }}
                  >
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedBookings.map((booking) => {
                  const bookingDate =
                    booking.dateTime instanceof Date
                      ? booking.dateTime
                      : new Date(booking.dateTime);
                  const isTodayBooking = isToday(bookingDate);
                  const isPastBooking = isPast(bookingDate) && !isTodayBooking;

                  return (
                    <TableRow
                      key={booking.id}
                      className={`group border-border/40 hover:bg-muted/30 transition-colors ${
                        isPastBooking ? "opacity-75" : ""
                      }`}
                    >
                      <TableCell className="py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 min-w-0">
                            <p
                              className="font-semibold text-foreground truncate"
                              style={{
                                fontSize: "clamp(0.875rem, 0.75rem + 0.5vw, 1rem)",
                              }}
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
                              {booking.customer
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .slice(0, 2)
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <p
                            className="font-medium text-foreground truncate"
                            style={{
                              fontSize: "clamp(0.875rem, 0.75rem + 0.5vw, 1rem)",
                            }}
                          >
                            {booking.customer}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <p
                          className="text-muted-foreground truncate"
                          style={{
                            fontSize: "clamp(0.875rem, 0.75rem + 0.5vw, 1rem)",
                          }}
                        >
                          {booking.staff}
                        </p>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex flex-col gap-0.5">
                          <p
                            className="font-medium text-foreground"
                            style={{
                              fontSize: "clamp(0.875rem, 0.75rem + 0.5vw, 1rem)",
                            }}
                          >
                            {format(bookingDate, "MMM d, yyyy")}
                          </p>
                          <p
                            className="text-muted-foreground"
                            style={{
                              fontSize: "clamp(0.75rem, 0.625rem + 0.5vw, 0.875rem)",
                            }}
                          >
                            {format(bookingDate, "p")}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge
                          variant={
                            booking.status === "Confirmed"
                              ? "default"
                              : booking.status === "Cancelled"
                              ? "destructive"
                              : "secondary"
                          }
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
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleViewDetails(booking)}
                            >
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleEditBooking(booking)}
                            >
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
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Filters Component
  const FiltersContent = ({ onClose }: { onClose?: () => void }) => (
    <div className="flex flex-col gap-4">
      {/* Saved Filters - Mobile */}
      <div className="lg:hidden">
        <SavedFilters
          type="bookings"
          currentFilters={activeFilters}
          onApplyFilter={(filters) => {
            setActiveFilters(filters);
            if (filters.status) setStatusFilter(filters.status);
            if (filters.search !== undefined) setSearchQuery(filters.search);
            if (filters.sort) setSortField(filters.sort);
            if (filters.date) {
              setSelectedDate(
                filters.date instanceof Date
                  ? filters.date
                  : new Date(filters.date)
              );
            } else if (filters.date === null) {
              setSelectedDate(null);
            }
            if (onClose) onClose();
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
          style={{ fontSize: "clamp(0.875rem, 0.75rem + 0.5vw, 1rem)" }}
        />
      </div>

      {/* Filters Row */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 lg:gap-5">
        {/* Date Filter */}
        <Select
          value={selectedDate ? format(selectedDate, "yyyy-MM-dd") : "all"}
          onValueChange={(value) => {
            if (value === "all") {
              setSelectedDate(null);
            } else {
              setSelectedDate(new Date(value));
            }
          }}
        >
          <SelectTrigger className="w-full sm:w-[200px] lg:w-[220px] h-11 lg:h-12">
            <CalendarIcon className="mr-2 h-4 w-4 lg:h-5 lg:w-5" />
            <SelectValue placeholder="Filter by date" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Dates</SelectItem>
            {availableDates.map((dateStr) => {
              const date = new Date(dateStr);
              return (
                <SelectItem key={dateStr} value={dateStr}>
                  {format(date, "PPP")}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>

        {/* Status Filter */}
        <Select
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value as FilterStatus)}
        >
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
      </div>

      {/* Clear Filters Button */}
      {activeFiltersCount > 0 && (
        <Button
          variant="outline"
          onClick={() => {
            setSearchQuery("");
            setStatusFilter("all");
            setSelectedDate(null);
            onClose?.();
          }}
          className="w-full sm:w-auto"
        >
          Clear All Filters
        </Button>
      )}
    </div>
  );

  // Skeleton Loader
  const BookingSkeleton = () => (
    <Card className="border-border/60 w-full">
      <CardContent className="p-4 sm:p-5">
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
          <div className="flex items-center gap-3 pt-3 border-t">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

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

        {/* Bookings Skeleton */}
        <section className="w-full">
          <div className="flex flex-col gap-4 sm:gap-5 md:gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <BookingSkeleton key={i} />
            ))}
          </div>
        </section>
      </div>
    );
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
                style={{ fontSize: "clamp(1.5rem, 1.25rem + 1vw, 2.5rem)" }}
              >
                Bookings
              </h1>
              <p
                className="text-muted-foreground font-normal"
                style={{ fontSize: "clamp(0.875rem, 0.75rem + 0.5vw, 1rem)" }}
              >
                Manage and view all your appointments ({bookings.length} total)
              </p>
            </div>
            {/* Saved Filters - Desktop Only */}
            <div className="hidden lg:flex items-center gap-2 flex-shrink-0">
              <SavedFilters
                type="bookings"
                currentFilters={activeFilters}
                onApplyFilter={(filters) => {
                  setActiveFilters(filters);
                  if (filters.status) setStatusFilter(filters.status);
                  if (filters.search !== undefined) setSearchQuery(filters.search);
                  if (filters.sort) setSortField(filters.sort);
                  if (filters.date) {
                    setSelectedDate(
                      filters.date instanceof Date
                        ? filters.date
                        : new Date(filters.date)
                    );
                  } else if (filters.date === null) {
                    setSelectedDate(null);
                  }
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filter Section - Mobile First */}
      <section className="mb-3 sm:mb-4 md:mb-6 lg:mb-8 w-full">
        {/* Mobile: Filters Button */}
        <div className="flex items-center gap-2 mb-3 lg:hidden">
          <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="flex-1 h-11 justify-start">
                <Filter className="mr-2 h-4 w-4" />
                <span>Filters</span>
                {activeFiltersCount > 0 && (
                  <Badge
                    variant="default"
                    className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center"
                  >
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent
              side="top"
              className="h-auto max-h-[90vh] overflow-y-auto"
            >
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
        </div>

        {/* Desktop: Always Visible Filters */}
        <div className="hidden lg:block">
          <FiltersContent />
        </div>
      </section>

      {/* Bookings List Section - Mobile First */}
      <section className="w-full">
        {filteredAndSortedBookings.length > 0 ? (
          <>
            {/* Mobile: Card-based List */}
            <div className="block sm:hidden">
              <div className="flex flex-col gap-3 sm:gap-4">
                {groupedBookings.length > 0 ? (
                  groupedBookings.map(([dateKey, dateBookings]) => {
                    const date = new Date(dateKey);
                    const isTodayDate = isToday(date);
                    const isPastDate = isPast(date) && !isTodayDate;

                    return (
                      <div key={dateKey} className="flex flex-col gap-3">
                        {/* Date Header */}
                        <div
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                            isTodayDate
                              ? "bg-primary/10 border-2 border-primary/20"
                              : isPastDate
                              ? "bg-muted/30 border border-border/40"
                              : "bg-muted/20 border border-border/40"
                          }`}
                        >
                          <CalendarIcon
                            className={`h-4 w-4 flex-shrink-0 ${
                              isTodayDate ? "text-primary" : "text-muted-foreground"
                            }`}
                          />
                          <div className="flex-1 min-w-0">
                            <h2
                              className={`font-semibold truncate ${
                                isTodayDate ? "text-primary" : "text-foreground"
                              }`}
                              style={{
                                fontSize: "clamp(0.875rem, 0.75rem + 0.5vw, 1.125rem)",
                              }}
                            >
                              {isTodayDate
                                ? "Today"
                                : isPastDate
                                ? "Past"
                                : format(date, "EEEE, MMMM d, yyyy")}
                            </h2>
                            <p
                              className="text-muted-foreground truncate text-xs"
                              style={{
                                fontSize: "clamp(0.75rem, 0.625rem + 0.5vw, 0.875rem)",
                              }}
                            >
                              {dateBookings.length} appointment
                              {dateBookings.length !== 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>
                        {/* Bookings */}
                        <div className="flex flex-col gap-3">
                          {dateBookings.map((booking) => (
                            <MobileCard key={booking.id} booking={booking} />
                          ))}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex flex-col gap-3">
                    {filteredAndSortedBookings.map((booking) => (
                      <MobileCard key={booking.id} booking={booking} />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Tablet: 2-Column Grid */}
            <div className="hidden sm:block lg:hidden">
              <div className="flex flex-col gap-4 md:gap-5">
                {groupedBookings.length > 0 ? (
                  groupedBookings.map(([dateKey, dateBookings]) => {
                    const date = new Date(dateKey);
                    const isTodayDate = isToday(date);
                    const isPastDate = isPast(date) && !isTodayDate;

                    return (
                      <div key={dateKey} className="flex flex-col gap-4">
                        {/* Date Header */}
                        <div
                          className={`flex items-center gap-3 px-4 py-3 rounded-lg ${
                            isTodayDate
                              ? "bg-primary/10 border-2 border-primary/20"
                              : isPastDate
                              ? "bg-muted/30 border border-border/40"
                              : "bg-muted/20 border border-border/40"
                          }`}
                        >
                          <CalendarIcon
                            className={`h-5 w-5 flex-shrink-0 ${
                              isTodayDate ? "text-primary" : "text-muted-foreground"
                            }`}
                          />
                          <div className="flex-1 min-w-0">
                            <h2
                              className={`font-semibold truncate ${
                                isTodayDate ? "text-primary" : "text-foreground"
                              }`}
                              style={{
                                fontSize: "clamp(0.875rem, 0.75rem + 0.5vw, 1.25rem)",
                              }}
                            >
                              {isTodayDate
                                ? "Today"
                                : isPastDate
                                ? "Past"
                                : format(date, "EEEE, MMMM d, yyyy")}
                            </h2>
                            <p
                              className="text-muted-foreground truncate"
                              style={{
                                fontSize: "clamp(0.75rem, 0.625rem + 0.5vw, 0.875rem)",
                              }}
                            >
                              {dateBookings.length} appointment
                              {dateBookings.length !== 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>
                        {/* Bookings Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {dateBookings.map((booking) => (
                            <TabletCard key={booking.id} booking={booking} />
                          ))}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {filteredAndSortedBookings.map((booking) => (
                      <TabletCard key={booking.id} booking={booking} />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Desktop: Full Table */}
            <div className="hidden lg:block">
              <DesktopTable />
            </div>
          </>
        ) : (
          <Card className="w-full border-border/60 bg-card/95 backdrop-blur-sm">
            <CardContent className="p-8 sm:p-12 lg:p-16 xl:p-20">
              <div className="text-center text-muted-foreground">
                <div className="flex flex-col items-center gap-3 sm:gap-4">
                  <div className="rounded-full bg-muted/50 p-3 sm:p-4">
                    <CalendarIcon className="h-10 w-10 sm:h-12 sm:w-12 lg:h-16 lg:w-16 opacity-50" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <p
                      className="font-semibold text-foreground"
                      style={{
                        fontSize: "clamp(1rem, 0.875rem + 0.5vw, 1.25rem)",
                      }}
                    >
                      {searchQuery || statusFilter !== "all" || selectedDate
                        ? "No bookings match your filters"
                        : "No appointments found"}
                    </p>
                    <p
                      className="text-muted-foreground"
                      style={{
                        fontSize: "clamp(0.875rem, 0.75rem + 0.5vw, 1rem)",
                      }}
                    >
                      {searchQuery || statusFilter !== "all" || selectedDate
                        ? "Try adjusting your search or filter criteria"
                        : "Create a new booking to get started"}
                    </p>
                  </div>
                  {(searchQuery || statusFilter !== "all" || selectedDate) && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchQuery("");
                        setStatusFilter("all");
                        setSelectedDate(null);
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
                    variant={
                      selectedBooking.status === "Confirmed"
                        ? "default"
                        : selectedBooking.status === "Cancelled"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {selectedBooking.status}
                  </Badge>
                </div>
                <div className="col-span-2">
                  <Label className="text-muted-foreground">Date & Time</Label>
                  <p className="font-semibold">
                    {format(
                      selectedBooking.dateTime instanceof Date
                        ? selectedBooking.dateTime
                        : new Date(selectedBooking.dateTime),
                      "PPpp"
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDetailsOpen(false)}>
              Close
            </Button>
            <Button
              onClick={() => {
                setViewDetailsOpen(false);
                if (selectedBooking) handleEditBooking(selectedBooking);
              }}
            >
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
            <DialogDescription>Update booking details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="service">Service</Label>
              <Input
                id="service"
                value={editFormData.service}
                onChange={(e) =>
                  setEditFormData((prev) => ({ ...prev, service: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="staff">Staff</Label>
              <Input
                id="staff"
                value={editFormData.staff}
                onChange={(e) =>
                  setEditFormData((prev) => ({ ...prev, staff: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateTime">Date & Time</Label>
              <Input
                id="dateTime"
                type="datetime-local"
                value={editFormData.dateTime}
                onChange={(e) =>
                  setEditFormData((prev) => ({
                    ...prev,
                    dateTime: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={editFormData.status}
                onValueChange={(value: "Confirmed" | "Pending" | "Cancelled") =>
                  setEditFormData((prev) => ({ ...prev, status: value }))
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
                onChange={(e) =>
                  setEditFormData((prev) => ({ ...prev, notes: e.target.value }))
                }
                rows={3}
                placeholder="Add any additional notes..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Booking Confirmation Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this booking? This action cannot be
              undone.
              {selectedBooking && (
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <p className="font-semibold">{selectedBooking.service}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedBooking.customer} •{" "}
                    {format(
                      selectedBooking.dateTime instanceof Date
                        ? selectedBooking.dateTime
                        : new Date(selectedBooking.dateTime),
                      "PPpp"
                    )}
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
  );
}
