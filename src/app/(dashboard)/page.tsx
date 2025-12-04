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
import { interactions } from '@/lib/data';
import { formatDistanceToNow } from 'date-fns';

const kpiData = [
  { title: "Today's Calls", value: '42', icon: Phone, change: '+5.2%' },
  { title: "Today's Chats", value: '67', icon: MessageSquare, change: '+8.1%' },
  { title: 'New Leads Today', value: '12', icon: UserPlus, change: '-2.5%' },
  { title: 'Bookings Today', value: '8', icon: CalendarPlus, change: '+10.0%' },
];

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpiData.map((kpi) => (
          <Card key={kpi.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
              <kpi.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <p className="text-xs text-muted-foreground">{kpi.change} from yesterday</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Live Activity Feed</CardTitle>
          <CardDescription>
            An overview of the most recent interactions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Channel</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {interactions.slice(0, 5).map((interaction) => (
                <TableRow key={interaction.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={interaction.customer.avatar} alt={interaction.customer.name} />
                        <AvatarFallback>
                          {interaction.customer.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{interaction.customer.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {interaction.contact}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="flex w-fit items-center gap-1">
                      {interaction.channel === 'Call' ? (
                        <Phone className="h-3 w-3" />
                      ) : (
                        <MessageSquare className="h-3 w-3" />
                      )}
                      {interaction.channel}
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
                      className="bg-opacity-20 text-foreground"
                    >
                      {interaction.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {formatDistanceToNow(interaction.timestamp, { addSuffix: true })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
