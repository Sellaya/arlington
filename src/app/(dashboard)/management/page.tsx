import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { leads, contacts } from '@/lib/data';
import type { Lead, Contact } from '@/lib/types';
import { format } from 'date-fns';
import { Search, Briefcase, Users } from 'lucide-react';

function LeadsTable({ data }: { data: Lead[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead className="hidden md:table-cell">Company</TableHead>
          <TableHead className="hidden lg:table-cell">Contact</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Last Interaction</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((lead) => (
          <TableRow key={lead.id}>
            <TableCell className="font-medium">{lead.name}</TableCell>
            <TableCell className="hidden md:table-cell text-muted-foreground">{lead.company}</TableCell>
            <TableCell className="hidden lg:table-cell text-muted-foreground">{lead.contact}</TableCell>
            <TableCell>
              <Badge variant="outline">{lead.status}</Badge>
            </TableCell>
            <TableCell className="text-right text-muted-foreground">{format(lead.lastInteraction, 'PP')}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function ContactsTable({ data }: { data: Contact[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead className="hidden md:table-cell">Company</TableHead>
          <TableHead className="hidden lg:table-cell">Contact</TableHead>
          <TableHead className="text-right">Last Interaction</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((contact) => (
          <TableRow key={contact.id}>
            <TableCell className="font-medium">{contact.name}</TableCell>
            <TableCell className="hidden md:table-cell text-muted-foreground">{contact.company}</TableCell>
            <TableCell className="hidden lg:table-cell text-muted-foreground">{contact.contact}</TableCell>
            <TableCell className="text-right text-muted-foreground">{format(contact.lastInteraction, 'PP')}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}


export default function ManagementPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">Management</h1>
          <p className="text-muted-foreground">
            Manage your leads and contacts.
          </p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search..." className="pl-8" />
        </div>
      </div>

      <Tabs defaultValue="leads">
        <TabsList>
          <TabsTrigger value="leads"><Briefcase className="mr-2 h-4 w-4" />Leads</TabsTrigger>
          <TabsTrigger value="contacts"><Users className="mr-2 h-4 w-4" />Contacts</TabsTrigger>
        </TabsList>
        <TabsContent value="leads">
          <LeadsTable data={leads} />
        </TabsContent>
        <TabsContent value="contacts">
          <ContactsTable data={contacts} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
