"use client";

import React from 'react';
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
import type { Lead, Contact } from '@/lib/types';
import { format } from 'date-fns';
import { Search, Briefcase, Users } from 'lucide-react';

function LeadsTable({ data }: { data: Lead[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="min-w-[150px] lg:min-w-[200px] xl:min-w-[250px]">Name</TableHead>
          <TableHead className="hidden sm:table-cell min-w-[150px] lg:min-w-[200px] xl:min-w-[250px]">Company</TableHead>
          <TableHead className="hidden lg:table-cell min-w-[120px] xl:min-w-[180px]">Contact</TableHead>
          <TableHead className="min-w-[100px] lg:min-w-[120px]">Status</TableHead>
          <TableHead className="text-right min-w-[120px] lg:min-w-[180px] xl:min-w-[200px]">Last Interaction</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((lead) => (
          <TableRow key={lead.id} className="group">
            <TableCell className="font-medium text-sm sm:text-base">
              <div className="truncate">{lead.name}</div>
            </TableCell>
            <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">
              <div className="truncate">{lead.company || '—'}</div>
            </TableCell>
            <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">
              <div className="truncate">{lead.contact || '—'}</div>
            </TableCell>
            <TableCell>
              <Badge variant="outline" className="text-xs sm:text-sm">{lead.status}</Badge>
            </TableCell>
            <TableCell className="text-right text-muted-foreground text-xs sm:text-sm">
              {format(lead.lastInteraction, 'PP')}
            </TableCell>
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
          <TableHead className="min-w-[150px] lg:min-w-[200px] xl:min-w-[250px]">Name</TableHead>
          <TableHead className="hidden sm:table-cell min-w-[150px] lg:min-w-[200px] xl:min-w-[250px]">Company</TableHead>
          <TableHead className="hidden lg:table-cell min-w-[120px] xl:min-w-[180px]">Contact</TableHead>
          <TableHead className="text-right min-w-[120px] lg:min-w-[180px] xl:min-w-[200px]">Last Interaction</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((contact) => (
          <TableRow key={contact.id} className="group">
            <TableCell className="font-medium text-sm sm:text-base">
              <div className="truncate">{contact.name}</div>
            </TableCell>
            <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">
              <div className="truncate">{contact.company || '—'}</div>
            </TableCell>
            <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">
              <div className="truncate">{contact.contact || '—'}</div>
            </TableCell>
            <TableCell className="text-right text-muted-foreground text-xs sm:text-sm">
              {format(contact.lastInteraction, 'PP')}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}


export default function ManagementPage() {
  const [leads, setLeads] = React.useState<Lead[]>([]);
  const [contacts, setContacts] = React.useState<Contact[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(data => {
        setLeads(data.leads || []);
        setContacts(data.contacts || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching data:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col gap-4 sm:gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-headline">Management</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">Manage your leads and contacts.</p>
        </div>
        <div className="text-center py-12 sm:py-16 text-muted-foreground">
          <div className="inline-block animate-pulse">Loading data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 sm:gap-6 lg:gap-8 xl:gap-10">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between lg:gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold font-headline">Management</h1>
          <p className="text-sm sm:text-base lg:text-lg text-muted-foreground mt-1 lg:mt-2">
            Manage your leads and contacts
          </p>
        </div>
        <div className="relative w-full sm:w-64 lg:w-80 xl:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 lg:h-5 lg:w-5 text-muted-foreground" />
          <Input placeholder="Search leads and contacts..." className="pl-10 lg:h-11 lg:text-base" />
        </div>
      </div>

      {/* Tabs with Enhanced Layout */}
      <Tabs defaultValue="leads" className="w-full">
        <TabsList className="w-full sm:w-auto grid grid-cols-2 sm:inline-flex lg:gap-2">
          <TabsTrigger value="leads" className="w-full sm:w-auto lg:px-6 lg:h-11 lg:text-base">
            <Briefcase className="mr-2 h-4 w-4 lg:h-5 lg:w-5" />
            <span>Leads</span>
            <span className="ml-2">({leads.length})</span>
          </TabsTrigger>
          <TabsTrigger value="contacts" className="w-full sm:w-auto lg:px-6 lg:h-11 lg:text-base">
            <Users className="mr-2 h-4 w-4 lg:h-5 lg:w-5" />
            <span>Contacts</span>
            <span className="ml-2">({contacts.length})</span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="leads" className="mt-4 sm:mt-6 lg:mt-8">
          {leads.length > 0 ? (
            <div className="overflow-x-auto -mx-4 sm:mx-0 lg:mx-0">
              <div className="inline-block min-w-full align-middle px-4 sm:px-0">
                <LeadsTable data={leads} />
              </div>
            </div>
          ) : (
            <div className="text-center py-12 sm:py-16 text-muted-foreground">
              <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm sm:text-base">No leads found</p>
            </div>
          )}
        </TabsContent>
        <TabsContent value="contacts" className="mt-4 sm:mt-6">
          {contacts.length > 0 ? (
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="inline-block min-w-full align-middle px-4 sm:px-0">
                <ContactsTable data={contacts} />
              </div>
            </div>
          ) : (
            <div className="text-center py-12 sm:py-16 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm sm:text-base">No contacts found</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
