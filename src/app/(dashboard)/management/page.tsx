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
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
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
      <div className="flex flex-col w-full">
        {/* Page Header Skeleton */}
        <section className="mb-4 sm:mb-6 md:mb-8 lg:mb-10">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </section>

        {/* Search Skeleton */}
        <section className="mb-4 sm:mb-6 md:mb-8">
          <Skeleton className="h-11 w-full sm:w-64 lg:w-80" />
        </section>

        {/* Tabs Skeleton */}
        <section>
          <Skeleton className="h-10 w-full sm:w-auto mb-4" />
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full">
      {/* Page Header Section */}
      <section className="mb-4 sm:mb-6 md:mb-8 lg:mb-10">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
          <div className="flex-1 min-w-0">
            <h1 
              className="font-bold font-headline text-foreground mb-2"
              style={{ fontSize: 'clamp(1.75rem, 1.5rem + 1.5vw, 2.5rem)' }}
            >
              Management
            </h1>
            <p 
              className="text-muted-foreground font-normal"
              style={{ fontSize: 'clamp(0.875rem, 0.75rem + 0.5vw, 1rem)' }}
            >
              Manage your leads and contacts
            </p>
          </div>
          <div className="relative w-full sm:w-64 lg:w-80 xl:w-96 flex-shrink-0">
            <Search 
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              style={{ 
                width: 'clamp(1rem, 0.875rem + 0.5vw, 1.25rem)',
                height: 'clamp(1rem, 0.875rem + 0.5vw, 1.25rem)'
              }}
            />
            <Input 
              placeholder="Search leads and contacts..." 
              className="pl-10"
              style={{ 
                height: 'clamp(2.25rem, 2rem + 0.5vw, 2.75rem)',
                fontSize: 'clamp(0.875rem, 0.75rem + 0.5vw, 1rem)'
              }}
            />
          </div>
        </div>
      </section>

      {/* Tabs Section */}
      <section>
        <Tabs defaultValue="leads" className="w-full">
          <TabsList className="w-full sm:w-auto grid grid-cols-2 sm:inline-flex lg:gap-2 mb-4 sm:mb-6 lg:mb-8">
            <TabsTrigger 
              value="leads" 
              className="w-full sm:w-auto"
              style={{ 
                fontSize: 'clamp(0.875rem, 0.75rem + 0.5vw, 1rem)',
                height: 'clamp(2.25rem, 2rem + 0.5vw, 2.75rem)'
              }}
            >
              <Briefcase 
                className="mr-2"
                style={{ 
                  width: 'clamp(1rem, 0.875rem + 0.5vw, 1.25rem)',
                  height: 'clamp(1rem, 0.875rem + 0.5vw, 1.25rem)'
                }}
              />
              <span>Leads</span>
              <span className="ml-2">({leads.length})</span>
            </TabsTrigger>
            <TabsTrigger 
              value="contacts" 
              className="w-full sm:w-auto"
              style={{ 
                fontSize: 'clamp(0.875rem, 0.75rem + 0.5vw, 1rem)',
                height: 'clamp(2.25rem, 2rem + 0.5vw, 2.75rem)'
              }}
            >
              <Users 
                className="mr-2"
                style={{ 
                  width: 'clamp(1rem, 0.875rem + 0.5vw, 1.25rem)',
                  height: 'clamp(1rem, 0.875rem + 0.5vw, 1.25rem)'
                }}
              />
              <span>Contacts</span>
              <span className="ml-2">({contacts.length})</span>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="leads" className="mt-0">
          {leads.length > 0 ? (
            <div className="overflow-x-auto -mx-4 sm:-mx-5 md:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full align-middle px-4 sm:px-5 md:px-6 lg:px-8">
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
          <TabsContent value="contacts" className="mt-0">
          {contacts.length > 0 ? (
            <div className="overflow-x-auto -mx-4 sm:-mx-5 md:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full align-middle px-4 sm:px-5 md:px-6 lg:px-8">
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
      </section>
    </div>
  );
}
