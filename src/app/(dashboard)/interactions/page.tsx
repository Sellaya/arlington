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
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { interactions } from '@/lib/data';
import type { Interaction } from '@/lib/types';
import { format } from 'date-fns';
import { Filter, Phone, MessageSquare } from 'lucide-react';

export default function InteractionsPage() {
  const [selectedInteraction, setSelectedInteraction] = React.useState<Interaction | null>(null);

  const calls = interactions.filter((i) => i.channel === 'Call');
  const chats = interactions.filter((i) => i.channel === 'Chat');

  const renderTable = (data: Interaction[]) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Customer</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="hidden md:table-cell">Timestamp</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((interaction) => (
          <TableRow key={interaction.id} onClick={() => setSelectedInteraction(interaction)} className="cursor-pointer">
            <TableCell>
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={interaction.customer.avatar} alt={interaction.customer.name} />
                  <AvatarFallback>{interaction.customer.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{interaction.customer.name}</div>
                  <div className="text-sm text-muted-foreground">{interaction.contact}</div>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <Badge
                variant={interaction.status === 'Completed' ? 'default' : interaction.status === 'Missed' ? 'destructive' : 'secondary'}
                className="bg-opacity-20 text-foreground"
              >
                {interaction.status}
              </Badge>
            </TableCell>
            <TableCell className="hidden md:table-cell text-muted-foreground">
              {format(interaction.timestamp, 'PPpp')}
            </TableCell>
            <TableCell className="text-right">
              <Button variant="ghost" size="sm">View</Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">Interactions</h1>
          <p className="text-muted-foreground">Review all calls and chats.</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem>Completed</DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem>Missed</DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem>In Progress</DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Tabs defaultValue="calls">
        <TabsList>
          <TabsTrigger value="calls">
            <Phone className="mr-2 h-4 w-4" />
            Calls
          </TabsTrigger>
          <TabsTrigger value="chats">
            <MessageSquare className="mr-2 h-4 w-4" />
            Chats
          </TabsTrigger>
        </TabsList>
        <TabsContent value="calls">
          {renderTable(calls)}
        </TabsContent>
        <TabsContent value="chats">
          {renderTable(chats)}
        </TabsContent>
      </Tabs>

      <Sheet open={!!selectedInteraction} onOpenChange={(isOpen) => !isOpen && setSelectedInteraction(null)}>
        <SheetContent className="sm:max-w-lg">
          {selectedInteraction && (
            <>
              <SheetHeader>
                <SheetTitle>Interaction Details</SheetTitle>
                <SheetDescription>
                  Full transcript and details for the interaction with {selectedInteraction.customer.name}.
                </SheetDescription>
              </SheetHeader>
              <div className="grid gap-4 py-4">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm text-muted-foreground">Customer</p>
                  <p className="font-medium">{selectedInteraction.customer.name}</p>
                </div>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm text-muted-foreground">Contact</p>
                  <p className="font-medium">{selectedInteraction.contact}</p>
                </div>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm text-muted-foreground">Timestamp</p>
                  <p className="font-medium">{format(selectedInteraction.timestamp, 'PPpp')}</p>
                </div>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm text-muted-foreground">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedInteraction.tags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                  </div>
                </div>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm text-muted-foreground">Transcript</p>
                  <p className="text-sm font-mono bg-muted p-3 rounded-md max-h-60 overflow-y-auto">
                    {selectedInteraction.transcript || "No transcript available."}
                  </p>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
