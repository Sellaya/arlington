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
    { title: "Total Calls", value: totalCalls.toString(), icon: Phone, change: '+0%' },
    { title: "Total Chats", value: totalChats.toString(), icon: MessageSquare, change: '+0%' },
    { title: 'New Leads', value: newLeads.toString(), icon: UserPlus, change: '+0%' },
    { title: 'Total Bookings', value: todayBookings.toString(), icon: CalendarPlus, change: '+0%' },
  ];
  return (
    <div className="flex flex-col gap-4 sm:gap-6 lg:gap-8 xl:gap-10 animate-fade-in-up">
      {/* Page Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between lg:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold font-headline">Dashboard</h1>
          <p className="text-sm sm:text-base lg:text-lg text-muted-foreground mt-1 lg:mt-2">
            Overview of your AI receptionist activity
          </p>
        </div>
      </div>

      {/* KPI Cards - Responsive Grid */}
      <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:gap-6 2xl:gap-8">
        {kpiData.map((kpi, index) => (
          <Card 
            key={kpi.title}
            className="animate-fade-in-up hover:shadow-3d-lg transition-all duration-300"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3 lg:pb-4">
              <CardTitle className="text-xs sm:text-sm lg:text-base font-medium">{kpi.title}</CardTitle>
              <div className="rounded-full bg-primary/10 p-2 sm:p-2.5 lg:p-3 shadow-3d-sm">
                <kpi.icon className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                {kpi.value}
              </div>
              <p className="text-xs sm:text-sm lg:text-base text-muted-foreground mt-1.5 sm:mt-2 lg:mt-3">{kpi.change} from yesterday</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Activity Feed - Full Width on Desktop */}
      <Card className="w-full">
        <CardHeader className="pb-3 sm:pb-4 lg:pb-6">
          <CardTitle className="text-lg sm:text-xl lg:text-2xl">Live Activity Feed</CardTitle>
          <CardDescription className="text-xs sm:text-sm lg:text-base">
            An overview of the most recent interactions.
          </CardDescription>
        </CardHeader>
        <CardContent className="lg:p-6">
          <div className="overflow-x-auto -mx-4 sm:mx-0 lg:mx-0">
            <div className="inline-block min-w-full align-middle px-4 sm:px-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[200px] lg:min-w-[250px]">Customer</TableHead>
                    <TableHead className="hidden sm:table-cell lg:min-w-[120px]">Channel</TableHead>
                    <TableHead className="min-w-[100px] lg:min-w-[120px]">Status</TableHead>
                    <TableHead className="hidden md:table-cell text-right lg:min-w-[180px]">Time</TableHead>
                    <TableHead className="sm:hidden text-right">Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {interactions.slice(0, 10).map((interaction) => (
                    <TableRow key={interaction.id} className="group">
                      <TableCell>
                        <div className="flex items-center gap-2 sm:gap-3">
                          <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                            <AvatarImage src={interaction.customer.avatar} alt={interaction.customer.name} />
                            <AvatarFallback>
                              {interaction.customer.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-sm sm:text-base truncate">{interaction.customer.name}</div>
                            <div className="text-xs sm:text-sm text-muted-foreground truncate">
                              {interaction.contact}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant="outline" className="flex w-fit items-center gap-1">
                          {interaction.channel === 'Call' ? (
                            <Phone className="h-3 w-3" />
                          ) : (
                            <MessageSquare className="h-3 w-3" />
                          )}
                          <span className="hidden md:inline">{interaction.channel}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            interaction.status === 'Completed'
                              ? 'default'
                              : interaction.status === 'Missed'
                              ? 'destructive'
                              : 'secondary'
                          }
                          className="bg-opacity-20 text-foreground text-xs sm:text-sm"
                        >
                          {interaction.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm text-muted-foreground text-right">
                        <span className="hidden md:inline">
                          {formatDistanceToNow(interaction.timestamp, { addSuffix: true })}
                        </span>
                        <span className="md:hidden">
                          {formatDistanceToNow(interaction.timestamp, { addSuffix: false })}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
