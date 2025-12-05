import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Phone, MessageSquare, UserPlus, CalendarPlus } from 'lucide-react';
import { fetchInteractions, fetchLeads, fetchBookings } from '@/lib/google-sheets';
import { formatDistanceToNow } from 'date-fns';

export default async function DashboardPage() {
  const [interactions, leads, bookings] = await Promise.all([
    fetchInteractions(),
    fetchLeads(),
    fetchBookings(),
  ]);

  const totalCalls = interactions.length;
  const totalChats = 0; // All are calls from the sheet
  const newLeads = leads.filter(l => l.status === 'New').length;
  const todayBookings = bookings.length;

  const kpiData = [
    { title: "Total Calls", value: totalCalls.toString(), icon: Phone, change: '+0%', color: 'primary' },
    { title: "Total Chats", value: totalChats.toString(), icon: MessageSquare, change: '+0%', color: 'accent' },
    { title: 'New Leads', value: newLeads.toString(), icon: UserPlus, change: '+0%', color: 'primary' },
    { title: 'Total Bookings', value: todayBookings.toString(), icon: CalendarPlus, change: '+0%', color: 'accent' },
  ];

  return (
    <div className="flex flex-col w-full">
      {/* Page Header Section */}
      <section className="mb-4 sm:mb-6 md:mb-8 lg:mb-10">
        <div className="flex flex-col gap-2 sm:gap-3">
          <h1 
            className="font-bold font-headline text-foreground"
            style={{ fontSize: 'clamp(1.75rem, 1.5rem + 1.5vw, 2.5rem)' }}
          >
            Dashboard
          </h1>
          <p 
            className="text-muted-foreground font-normal"
            style={{ fontSize: 'clamp(0.875rem, 0.75rem + 0.5vw, 1rem)' }}
          >
            Overview of your AI receptionist activity
          </p>
        </div>
      </section>

      {/* KPI Cards Section - Mobile-first Grid */}
      <section className="mb-4 sm:mb-6 md:mb-8 lg:mb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
          {kpiData.map((kpi, index) => (
            <Card 
              key={kpi.title}
              className="group relative overflow-hidden border-border/60 bg-card/95 backdrop-blur-sm transition-all duration-300 hover:shadow-3d-md hover:-translate-y-1 animate-fade-in-up"
              style={{ 
                animationDelay: `${index * 100}ms`,
                animationFillMode: 'both'
              }}
            >
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3 sm:pb-4">
                <div className="flex flex-col gap-1 sm:gap-2 flex-1 min-w-0">
                  <CardTitle 
                    className="font-medium text-muted-foreground truncate"
                    style={{ fontSize: 'clamp(0.75rem, 0.625rem + 0.5vw, 0.875rem)' }}
                  >
                    {kpi.title}
                  </CardTitle>
                  <div 
                    className="font-bold text-foreground"
                    style={{ fontSize: 'clamp(1.5rem, 1.25rem + 1.5vw, 2.5rem)' }}
                  >
                    {kpi.value}
                  </div>
                </div>
                <div className="flex-shrink-0 ml-3">
                  <div className="rounded-xl bg-primary/10 p-2 sm:p-2.5 md:p-3 shadow-3d-sm group-hover:shadow-glow-primary transition-all duration-300">
                    <kpi.icon 
                      className="text-primary"
                      style={{ 
                        width: 'clamp(1rem, 0.875rem + 0.5vw, 1.5rem)',
                        height: 'clamp(1rem, 0.875rem + 0.5vw, 1.5rem)'
                      }}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p 
                  className="text-muted-foreground font-normal"
                  style={{ fontSize: 'clamp(0.625rem, 0.5rem + 0.5vw, 0.75rem)' }}
                >
                  {kpi.change} from yesterday
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Live Activity Feed Section */}
      <section>
        <Card className="w-full border-border/60 bg-card/95 backdrop-blur-sm">
          <CardHeader className="pb-4 sm:pb-5 md:pb-6">
            <div className="flex flex-col gap-1 sm:gap-2">
              <CardTitle 
                className="font-bold"
                style={{ fontSize: 'clamp(1.125rem, 1rem + 0.75vw, 1.5rem)' }}
              >
                Live Activity Feed
              </CardTitle>
              <CardDescription 
                style={{ fontSize: 'clamp(0.75rem, 0.625rem + 0.5vw, 0.875rem)' }}
              >
                An overview of the most recent interactions
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-0 sm:p-4 md:p-6 lg:p-8">
            {/* Mobile: Vertical List */}
            <div className="block sm:hidden">
              <div className="flex flex-col divide-y divide-border/60">
                {interactions.slice(0, 10).map((interaction) => (
                  <div 
                    key={interaction.id}
                    className="p-4 active:bg-muted/30 transition-colors duration-150"
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10 flex-shrink-0 ring-2 ring-border/40">
                        <AvatarImage src={interaction.customer.avatar} alt={interaction.customer.name} />
                        <AvatarFallback className="text-sm font-medium">
                          {interaction.customer.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1 min-w-0">
                            <p 
                              className="font-semibold text-foreground truncate"
                              style={{ fontSize: 'clamp(0.875rem, 0.75rem + 0.5vw, 1rem)' }}
                            >
                              {interaction.customer.name}
                            </p>
                            <p 
                              className="text-muted-foreground truncate mt-0.5"
                              style={{ fontSize: 'clamp(0.75rem, 0.625rem + 0.5vw, 0.875rem)' }}
                            >
                              {interaction.contact}
                            </p>
                          </div>
                          <Badge
                            variant={interaction.status === 'Completed' ? 'default' : interaction.status === 'Missed' ? 'destructive' : 'secondary'}
                            className="flex-shrink-0 text-xs"
                          >
                            {interaction.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 flex-wrap">
                          <Badge variant="outline" className="text-xs">
                            {interaction.channel === 'Call' ? (
                              <><Phone className="h-3 w-3 mr-1" />Call</>
                            ) : (
                              <><MessageSquare className="h-3 w-3 mr-1" />Chat</>
                            )}
                          </Badge>
                          <span 
                            className="text-muted-foreground"
                            style={{ fontSize: 'clamp(0.625rem, 0.5rem + 0.5vw, 0.75rem)' }}
                          >
                            {formatDistanceToNow(interaction.timestamp, { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tablet: 2-Column Table */}
            <div className="hidden sm:block lg:hidden">
              <div className="overflow-x-auto -mx-4 sm:-mx-4 md:-mx-6">
                <div className="inline-block min-w-full align-middle px-4 sm:px-4 md:px-6">
                  <Table className="w-full">
                    <TableHeader>
                      <TableRow className="border-border/60">
                        <TableHead 
                          className="font-semibold"
                          style={{ fontSize: 'clamp(0.75rem, 0.625rem + 0.5vw, 0.875rem)' }}
                        >
                          Customer
                        </TableHead>
                        <TableHead 
                          className="font-semibold text-right"
                          style={{ fontSize: 'clamp(0.75rem, 0.625rem + 0.5vw, 0.875rem)' }}
                        >
                          Status
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {interactions.slice(0, 10).map((interaction) => (
                        <TableRow 
                          key={interaction.id} 
                          className="group border-border/40 hover:bg-muted/30 transition-colors"
                        >
                          <TableCell className="py-3 sm:py-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9 flex-shrink-0 ring-2 ring-border/40">
                                <AvatarImage src={interaction.customer.avatar} alt={interaction.customer.name} />
                                <AvatarFallback className="text-xs">
                                  {interaction.customer.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p 
                                  className="font-semibold text-foreground truncate"
                                  style={{ fontSize: 'clamp(0.875rem, 0.75rem + 0.5vw, 1rem)' }}
                                >
                                  {interaction.customer.name}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="outline" className="text-xs">
                                    {interaction.channel === 'Call' ? (
                                      <><Phone className="h-3 w-3 mr-1" />Call</>
                                    ) : (
                                      <><MessageSquare className="h-3 w-3 mr-1" />Chat</>
                                    )}
                                  </Badge>
                                  <span 
                                    className="text-muted-foreground"
                                    style={{ fontSize: 'clamp(0.625rem, 0.5rem + 0.5vw, 0.75rem)' }}
                                  >
                                    {formatDistanceToNow(interaction.timestamp, { addSuffix: true })}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right py-3 sm:py-4">
                            <Badge
                              variant={interaction.status === 'Completed' ? 'default' : interaction.status === 'Missed' ? 'destructive' : 'secondary'}
                              className="text-xs"
                            >
                              {interaction.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>

            {/* Desktop: Full Table */}
            <div className="hidden lg:block">
              <div className="overflow-x-auto -mx-4 sm:-mx-5 md:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full align-middle px-4 sm:px-5 md:px-6 lg:px-8">
                  <Table className="w-full">
                    <TableHeader>
                      <TableRow className="border-border/60">
                        <TableHead 
                          className="font-semibold"
                          style={{ fontSize: 'clamp(0.75rem, 0.625rem + 0.5vw, 0.875rem)' }}
                        >
                          Customer
                        </TableHead>
                        <TableHead 
                          className="font-semibold"
                          style={{ fontSize: 'clamp(0.75rem, 0.625rem + 0.5vw, 0.875rem)' }}
                        >
                          Channel
                        </TableHead>
                        <TableHead 
                          className="font-semibold"
                          style={{ fontSize: 'clamp(0.75rem, 0.625rem + 0.5vw, 0.875rem)' }}
                        >
                          Status
                        </TableHead>
                        <TableHead 
                          className="font-semibold text-right"
                          style={{ fontSize: 'clamp(0.75rem, 0.625rem + 0.5vw, 0.875rem)' }}
                        >
                          Time
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {interactions.slice(0, 10).map((interaction) => (
                        <TableRow 
                          key={interaction.id} 
                          className="group border-border/40 hover:bg-muted/30 transition-colors"
                        >
                          <TableCell className="py-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10 flex-shrink-0 ring-2 ring-border/40">
                                <AvatarImage src={interaction.customer.avatar} alt={interaction.customer.name} />
                                <AvatarFallback className="text-sm">
                                  {interaction.customer.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p 
                                  className="font-semibold text-foreground truncate"
                                  style={{ fontSize: 'clamp(0.875rem, 0.75rem + 0.5vw, 1rem)' }}
                                >
                                  {interaction.customer.name}
                                </p>
                                <p 
                                  className="text-muted-foreground truncate mt-0.5"
                                  style={{ fontSize: 'clamp(0.75rem, 0.625rem + 0.5vw, 0.875rem)' }}
                                >
                                  {interaction.contact}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-4">
                            <Badge variant="outline" className="text-xs">
                              {interaction.channel === 'Call' ? (
                                <><Phone className="h-3 w-3 mr-1" />Call</>
                              ) : (
                                <><MessageSquare className="h-3 w-3 mr-1" />Chat</>
                              )}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-4">
                            <Badge
                              variant={interaction.status === 'Completed' ? 'default' : interaction.status === 'Missed' ? 'destructive' : 'secondary'}
                              className="text-xs"
                            >
                              {interaction.status}
                            </Badge>
                          </TableCell>
                          <TableCell 
                            className="text-right text-muted-foreground py-4"
                            style={{ fontSize: 'clamp(0.75rem, 0.625rem + 0.5vw, 0.875rem)' }}
                          >
                            {formatDistanceToNow(interaction.timestamp, { addSuffix: true })}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
