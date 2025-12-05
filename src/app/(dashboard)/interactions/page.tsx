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
import type { Interaction } from '@/lib/types';
import { format } from 'date-fns';
import { Filter, Phone, MessageSquare } from 'lucide-react';

export default function InteractionsPage() {
  const [selectedInteraction, setSelectedInteraction] = React.useState<Interaction | null>(null);
  const [interactions, setInteractions] = React.useState<Interaction[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(data => {
        setInteractions(data.interactions || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching interactions:', err);
        setLoading(false);
      });
  }, []);

  const calls = interactions.filter((i) => i.channel === 'Call');
  const chats = interactions.filter((i) => i.channel === 'Chat');

  const renderTable = (data: Interaction[]) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="min-w-[200px] lg:min-w-[250px] xl:min-w-[300px]">Customer</TableHead>
          <TableHead className="hidden sm:table-cell lg:min-w-[120px]">Channel</TableHead>
          <TableHead className="min-w-[100px] lg:min-w-[120px]">Status</TableHead>
          <TableHead className="hidden lg:table-cell xl:min-w-[200px]">Timestamp</TableHead>
          <TableHead className="hidden md:table-cell text-right lg:min-w-[100px]">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((interaction) => (
          <TableRow 
            key={interaction.id} 
            onClick={() => setSelectedInteraction(interaction)} 
            className="cursor-pointer group"
          >
            <TableCell>
              <div className="flex items-center gap-2 sm:gap-3">
                <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                  <AvatarImage src={interaction.customer.avatar} alt={interaction.customer.name} />
                  <AvatarFallback>{interaction.customer.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-sm sm:text-base truncate">{interaction.customer.name}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground truncate">{interaction.contact}</div>
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
                variant={interaction.status === 'Completed' ? 'default' : interaction.status === 'Missed' ? 'destructive' : 'secondary'}
                className="bg-opacity-20 text-foreground text-xs sm:text-sm"
              >
                {interaction.status}
              </Badge>
            </TableCell>
            <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">
              {format(interaction.timestamp, 'PPp')}
            </TableCell>
            <TableCell className="hidden md:table-cell text-right">
              <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                View
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  if (loading) {
    return (
      <div className="flex flex-col gap-4 sm:gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-headline">Interactions</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">Review all calls and chats.</p>
        </div>
        <div className="text-center py-12 sm:py-16 text-muted-foreground">
          <div className="inline-block animate-pulse">Loading interactions...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 sm:gap-6 lg:gap-8 xl:gap-10">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between lg:gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold font-headline">Interactions</h1>
          <p className="text-sm sm:text-base lg:text-lg text-muted-foreground mt-1 lg:mt-2">
            Review all calls and chats from your AI receptionist
          </p>
        </div>
        <div className="flex items-center gap-2 lg:gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto lg:px-6 lg:h-11">
                <Filter className="mr-2 h-4 w-4 lg:h-5 lg:w-5" />
                <span className="hidden sm:inline lg:text-base">Filter</span>
                <span className="sm:hidden">Filter</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem>Completed</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>Missed</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>In Progress</DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Tabs with Enhanced Layout */}
      <Tabs defaultValue="calls" className="w-full">
        <TabsList className="w-full sm:w-auto grid grid-cols-2 sm:inline-flex lg:gap-2">
          <TabsTrigger value="calls" className="w-full sm:w-auto lg:px-6 lg:h-11 lg:text-base">
            <Phone className="mr-2 h-4 w-4 lg:h-5 lg:w-5" />
            <span className="hidden sm:inline">Calls</span>
            <span className="sm:hidden">Calls</span>
            <span className="ml-2">({calls.length})</span>
          </TabsTrigger>
          <TabsTrigger value="chats" className="w-full sm:w-auto lg:px-6 lg:h-11 lg:text-base">
            <MessageSquare className="mr-2 h-4 w-4 lg:h-5 lg:w-5" />
            <span className="hidden sm:inline">Chats</span>
            <span className="sm:hidden">Chats</span>
            <span className="ml-2">({chats.length})</span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="calls" className="mt-4 sm:mt-6 lg:mt-8">
          {calls.length > 0 ? (
            <div className="overflow-x-auto -mx-4 sm:mx-0 lg:mx-0">
              <div className="inline-block min-w-full align-middle px-4 sm:px-0">
                {renderTable(calls)}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 sm:py-16 text-muted-foreground">
              <Phone className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm sm:text-base">No calls found</p>
            </div>
          )}
        </TabsContent>
        <TabsContent value="chats" className="mt-4 sm:mt-6">
          {chats.length > 0 ? (
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="inline-block min-w-full align-middle px-4 sm:px-0">
                {renderTable(chats)}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 sm:py-16 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm sm:text-base">No chats found</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Sheet open={!!selectedInteraction} onOpenChange={(isOpen) => !isOpen && setSelectedInteraction(null)}>
        <SheetContent className="w-full sm:max-w-lg lg:max-w-2xl xl:max-w-3xl overflow-y-auto">
          {selectedInteraction && (
            <>
              <SheetHeader className="pb-4 lg:pb-6">
                <SheetTitle className="text-xl sm:text-2xl lg:text-3xl">Interaction Details</SheetTitle>
                <SheetDescription className="text-sm sm:text-base lg:text-lg">
                  Full transcript and details for the interaction with {selectedInteraction.customer.name}.
                </SheetDescription>
              </SheetHeader>
              <div className="grid gap-4 sm:gap-6 lg:gap-8 py-4 lg:py-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                  <div className="flex flex-col space-y-1.5 lg:space-y-2">
                    <p className="text-xs sm:text-sm lg:text-base font-medium text-muted-foreground">Customer</p>
                    <p className="font-semibold text-sm sm:text-base lg:text-lg">{selectedInteraction.customer.name}</p>
                  </div>
                  <div className="flex flex-col space-y-1.5 lg:space-y-2">
                    <p className="text-xs sm:text-sm lg:text-base font-medium text-muted-foreground">Contact</p>
                    <p className="font-semibold text-sm sm:text-base lg:text-lg">{selectedInteraction.contact}</p>
                  </div>
                  <div className="flex flex-col space-y-1.5 lg:space-y-2 sm:col-span-2 lg:col-span-1">
                    <p className="text-xs sm:text-sm lg:text-base font-medium text-muted-foreground">Timestamp</p>
                    <p className="font-semibold text-sm sm:text-base lg:text-lg">{format(selectedInteraction.timestamp, 'PPpp')}</p>
                  </div>
                </div>
                <div className="flex flex-col space-y-2 lg:space-y-3">
                  <p className="text-xs sm:text-sm lg:text-base font-medium text-muted-foreground">Tags</p>
                  <div className="flex flex-wrap gap-2 lg:gap-3">
                    {selectedInteraction.tags.length > 0 ? (
                      selectedInteraction.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs sm:text-sm lg:text-base px-3 py-1">{tag}</Badge>
                      ))
                    ) : (
                      <span className="text-xs sm:text-sm lg:text-base text-muted-foreground">No tags</span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col space-y-2 lg:space-y-3">
                  <p className="text-xs sm:text-sm lg:text-base font-medium text-muted-foreground">Transcript</p>
                  <div className="bg-muted/50 rounded-xl p-4 sm:p-6 lg:p-8 max-h-[400px] sm:max-h-[500px] lg:max-h-[600px] overflow-y-auto">
                    <p className="text-xs sm:text-sm lg:text-base font-mono whitespace-pre-wrap leading-relaxed">
                      {selectedInteraction.transcript || "No transcript available."}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
