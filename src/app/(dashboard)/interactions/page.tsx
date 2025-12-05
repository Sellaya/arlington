"use client";

import React from 'react';
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
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import type { Interaction } from '@/lib/types';
import { format, formatDistanceToNow } from 'date-fns';
import { Filter, Phone, MessageSquare, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

type SortField = 'customer' | 'timestamp' | 'status';
type SortDirection = 'asc' | 'desc';

export default function InteractionsPage() {
  const [selectedInteraction, setSelectedInteraction] = React.useState<Interaction | null>(null);
  const [interactions, setInteractions] = React.useState<Interaction[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<'calls' | 'chats'>('calls');
  const [sortField, setSortField] = React.useState<SortField>('timestamp');
  const [sortDirection, setSortDirection] = React.useState<SortDirection>('desc');

  React.useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(data => {
        // Convert timestamp strings back to Date objects
        const processedInteractions = (data.interactions || []).map((interaction: any) => ({
          ...interaction,
          timestamp: interaction.timestamp ? new Date(interaction.timestamp) : new Date(),
        }));
        setInteractions(processedInteractions);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching interactions:', err);
        setLoading(false);
      });
  }, []);

  const calls = interactions.filter((i) => i.channel === 'Call');
  const chats = interactions.filter((i) => i.channel === 'Chat');
  const currentData = activeTab === 'calls' ? calls : chats;

  // Sorting logic
  const sortedData = React.useMemo(() => {
    const sorted = [...currentData].sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'customer':
          comparison = a.customer.name.localeCompare(b.customer.name);
          break;
        case 'timestamp':
          const aTime = a.timestamp instanceof Date ? a.timestamp.getTime() : new Date(a.timestamp).getTime();
          const bTime = b.timestamp instanceof Date ? b.timestamp.getTime() : new Date(b.timestamp).getTime();
          comparison = aTime - bTime;
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    return sorted;
  }, [currentData, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-3 w-3 ml-1 opacity-50" />;
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="h-3 w-3 ml-1" />
      : <ArrowDown className="h-3 w-3 ml-1" />;
  };

  // Skeleton Loader Component
  const InteractionSkeleton = () => (
    <Card className="p-4 sm:p-5 border-border/60">
      <div className="flex items-start gap-3 sm:gap-4">
        <Skeleton className="h-10 w-10 sm:h-12 sm:w-12 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
          <div className="flex gap-2 mt-2">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-20" />
          </div>
        </div>
      </div>
    </Card>
  );

  // Mobile: Card-based List
  const MobileCardList = ({ data }: { data: Interaction[] }) => (
    <div className="flex flex-col gap-3 sm:gap-4">
      {data.map((interaction) => (
        <Card
          key={interaction.id}
          onClick={() => setSelectedInteraction(interaction)}
          className="p-4 sm:p-5 border-border/60 bg-card/95 backdrop-blur-sm cursor-pointer transition-all duration-200 hover:shadow-3d-md hover:-translate-y-0.5 active:scale-[0.98] touch-3d"
        >
          <div className="flex items-start gap-3 sm:gap-4">
            <Avatar className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 ring-2 ring-border/40">
              <AvatarImage src={interaction.customer.avatar} alt={interaction.customer.name} />
              <AvatarFallback className="text-xs sm:text-sm font-medium">
                {interaction.customer.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <p 
                    className="font-semibold text-foreground truncate mb-1"
                    style={{ fontSize: 'clamp(0.875rem, 0.75rem + 0.5vw, 1rem)' }}
                  >
                    {interaction.customer.name}
                  </p>
                  <p 
                    className="text-muted-foreground truncate"
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
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap mt-3">
                <Badge variant="outline" className="text-xs">
                  {interaction.channel === 'Call' ? (
                    <><Phone className="h-3 w-3 mr-1" />Call</>
                  ) : (
                    <><MessageSquare className="h-3 w-3 mr-1" />Chat</>
                  )}
                </Badge>
                <span 
                  className="text-muted-foreground font-medium"
                  style={{ fontSize: 'clamp(0.625rem, 0.5rem + 0.5vw, 0.75rem)' }}
                >
                  {formatDistanceToNow(interaction.timestamp, { addSuffix: true })}
                </span>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

  // Tablet: 2-Column Grid
  const TabletGrid = ({ data }: { data: Interaction[] }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
      {data.map((interaction) => (
        <Card
          key={interaction.id}
          onClick={() => setSelectedInteraction(interaction)}
          className="p-4 sm:p-5 border-border/60 bg-card/95 backdrop-blur-sm cursor-pointer transition-all duration-200 hover:shadow-3d-md hover:-translate-y-0.5 active:scale-[0.98] touch-3d"
        >
          <div className="flex items-start gap-3">
            <Avatar className="h-10 w-10 flex-shrink-0 ring-2 ring-border/40">
              <AvatarImage src={interaction.customer.avatar} alt={interaction.customer.name} />
              <AvatarFallback className="text-xs">
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
              <div className="flex items-center gap-2 flex-wrap mt-2">
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
        </Card>
      ))}
    </div>
  );

  // Desktop: Full Table with Sortable Columns
  const DesktopTable = ({ data }: { data: Interaction[] }) => (
    <div className="overflow-x-auto -mx-4 sm:-mx-5 md:-mx-6 lg:-mx-8">
      <div className="inline-block min-w-full align-middle px-4 sm:px-5 md:px-6 lg:px-8">
        <Table className="w-full">
          <TableHeader>
            <TableRow className="border-border/60">
              <TableHead 
                className="cursor-pointer select-none hover:bg-muted/30 transition-colors"
                onClick={() => handleSort('customer')}
              >
                <div className="flex items-center">
                  <span style={{ fontSize: 'clamp(0.75rem, 0.625rem + 0.5vw, 0.875rem)' }}>Customer</span>
                  <SortIcon field="customer" />
                </div>
              </TableHead>
              <TableHead 
                style={{ fontSize: 'clamp(0.75rem, 0.625rem + 0.5vw, 0.875rem)' }}
              >
                Channel
              </TableHead>
              <TableHead 
                className="cursor-pointer select-none hover:bg-muted/30 transition-colors"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center">
                  <span style={{ fontSize: 'clamp(0.75rem, 0.625rem + 0.5vw, 0.875rem)' }}>Status</span>
                  <SortIcon field="status" />
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer select-none hover:bg-muted/30 transition-colors text-right"
                onClick={() => handleSort('timestamp')}
              >
                <div className="flex items-center justify-end">
                  <span style={{ fontSize: 'clamp(0.75rem, 0.625rem + 0.5vw, 0.875rem)' }}>Timestamp</span>
                  <SortIcon field="timestamp" />
                </div>
              </TableHead>
              <TableHead 
                className="text-right"
                style={{ fontSize: 'clamp(0.75rem, 0.625rem + 0.5vw, 0.875rem)' }}
              >
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((interaction) => (
              <TableRow 
                key={interaction.id} 
                onClick={() => setSelectedInteraction(interaction)}
                className="cursor-pointer group border-border/40 hover:bg-muted/30 transition-colors"
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
                    className="text-xs font-medium"
                  >
                    {interaction.status}
                  </Badge>
                </TableCell>
                <TableCell 
                  className="text-right text-muted-foreground py-4"
                  style={{ fontSize: 'clamp(0.75rem, 0.625rem + 0.5vw, 0.875rem)' }}
                >
                  <div className="flex flex-col items-end">
                    <span className="font-medium">{format(interaction.timestamp, 'PPp')}</span>
                    <span 
                      className="text-xs opacity-70 mt-0.5"
                      style={{ fontSize: 'clamp(0.625rem, 0.5rem + 0.5vw, 0.75rem)' }}
                    >
                      {formatDistanceToNow(interaction.timestamp, { addSuffix: true })}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right py-4">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedInteraction(interaction);
                    }}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex flex-col w-full">
        {/* Page Header Skeleton */}
        <section className="mb-4 sm:mb-6 md:mb-8 lg:mb-10">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </section>

        {/* Segmented Control Skeleton */}
        <section className="mb-4 sm:mb-6 md:mb-8">
          <Skeleton className="h-10 w-full sm:w-auto" />
        </section>

        {/* Interaction List Skeleton */}
        <section>
          <div className="flex flex-col gap-3 sm:gap-4">
            {[...Array(6)].map((_, i) => (
              <InteractionSkeleton key={i} />
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
              Interactions
            </h1>
            <p 
              className="text-muted-foreground font-normal"
              style={{ fontSize: 'clamp(0.875rem, 0.75rem + 0.5vw, 1rem)' }}
            >
              Review all calls and chats from your AI receptionist
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full sm:w-auto"
                  style={{ 
                    fontSize: 'clamp(0.75rem, 0.625rem + 0.5vw, 0.875rem)',
                    height: 'clamp(2.25rem, 2rem + 0.5vw, 2.75rem)'
                  }}
                >
                  <Filter 
                    style={{ 
                      width: 'clamp(0.875rem, 0.75rem + 0.5vw, 1rem)',
                      height: 'clamp(0.875rem, 0.75rem + 0.5vw, 1rem)'
                    }}
                    className="mr-2"
                  />
                  <span className="hidden sm:inline">Filter</span>
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
      </section>

      {/* Segmented Control - Mobile Horizontal, Desktop Tabs */}
      <section className="mb-4 sm:mb-6 md:mb-8">
        {/* Mobile: Horizontal Segmented Control */}
        <div className="block sm:hidden">
          <div className="inline-flex rounded-lg border border-border/60 bg-muted/30 p-1 w-full">
            <button
              onClick={() => setActiveTab('calls')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md transition-all duration-200 ${
                activeTab === 'calls'
                  ? 'bg-background text-foreground shadow-3d-sm font-medium'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              style={{ fontSize: 'clamp(0.75rem, 0.625rem + 0.5vw, 0.875rem)' }}
            >
              <Phone 
                style={{ 
                  width: 'clamp(1rem, 0.875rem + 0.5vw, 1.125rem)',
                  height: 'clamp(1rem, 0.875rem + 0.5vw, 1.125rem)'
                }}
              />
              <span>Calls</span>
              <Badge variant="secondary" className="ml-1 text-xs">
                {calls.length}
              </Badge>
            </button>
            <button
              onClick={() => setActiveTab('chats')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md transition-all duration-200 ${
                activeTab === 'chats'
                  ? 'bg-background text-foreground shadow-3d-sm font-medium'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              style={{ fontSize: 'clamp(0.75rem, 0.625rem + 0.5vw, 0.875rem)' }}
            >
              <MessageSquare 
                style={{ 
                  width: 'clamp(1rem, 0.875rem + 0.5vw, 1.125rem)',
                  height: 'clamp(1rem, 0.875rem + 0.5vw, 1.125rem)'
                }}
              />
              <span>Chats</span>
              <Badge variant="secondary" className="ml-1 text-xs">
                {chats.length}
              </Badge>
            </button>
          </div>
        </div>

        {/* Desktop: Tab-style Control */}
        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={() => setActiveTab('calls')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-200 ${
              activeTab === 'calls'
                ? 'bg-primary text-primary-foreground shadow-3d-sm font-medium'
                : 'bg-muted/30 text-muted-foreground hover:bg-muted/50 hover:text-foreground'
            }`}
            style={{ fontSize: 'clamp(0.875rem, 0.75rem + 0.5vw, 1rem)' }}
          >
            <Phone 
              style={{ 
                width: 'clamp(1rem, 0.875rem + 0.5vw, 1.25rem)',
                height: 'clamp(1rem, 0.875rem + 0.5vw, 1.25rem)'
              }}
            />
            <span>Calls</span>
            <Badge 
              variant={activeTab === 'calls' ? 'secondary' : 'outline'} 
              className="ml-1 text-xs"
            >
              {calls.length}
            </Badge>
          </button>
          <button
            onClick={() => setActiveTab('chats')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-200 ${
              activeTab === 'chats'
                ? 'bg-primary text-primary-foreground shadow-3d-sm font-medium'
                : 'bg-muted/30 text-muted-foreground hover:bg-muted/50 hover:text-foreground'
            }`}
            style={{ fontSize: 'clamp(0.875rem, 0.75rem + 0.5vw, 1rem)' }}
          >
            <MessageSquare 
              style={{ 
                width: 'clamp(1rem, 0.875rem + 0.5vw, 1.25rem)',
                height: 'clamp(1rem, 0.875rem + 0.5vw, 1.25rem)'
              }}
            />
            <span>Chats</span>
            <Badge 
              variant={activeTab === 'chats' ? 'secondary' : 'outline'} 
              className="ml-1 text-xs"
            >
              {chats.length}
            </Badge>
          </button>
        </div>
      </section>

      {/* Interactions List - Responsive Layout */}
      <section>
        {sortedData.length > 0 ? (
          <>
            {/* Mobile: Card-based List */}
            <div className="block sm:hidden">
              <MobileCardList data={sortedData} />
            </div>

            {/* Tablet: 2-Column Grid */}
            <div className="hidden sm:block lg:hidden">
              <TabletGrid data={sortedData} />
            </div>

            {/* Desktop: Full Table */}
            <div className="hidden lg:block">
              <DesktopTable data={sortedData} />
            </div>
          </>
        ) : (
          <Card className="p-12 sm:p-16 text-center border-border/60">
            <div className="flex flex-col items-center gap-4">
              {activeTab === 'calls' ? (
                <Phone className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground/50" />
              ) : (
                <MessageSquare className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground/50" />
              )}
              <div>
                <p 
                  className="font-semibold text-foreground mb-1"
                  style={{ fontSize: 'clamp(1rem, 0.875rem + 0.5vw, 1.25rem)' }}
                >
                  No {activeTab} found
                </p>
                <p 
                  className="text-muted-foreground"
                  style={{ fontSize: 'clamp(0.875rem, 0.75rem + 0.5vw, 1rem)' }}
                >
                  There are no {activeTab} interactions to display.
                </p>
              </div>
            </div>
          </Card>
        )}
      </section>

      {/* Interaction Detail Sheet */}
      <Sheet open={!!selectedInteraction} onOpenChange={(isOpen) => !isOpen && setSelectedInteraction(null)}>
        <SheetContent className="w-full sm:max-w-lg lg:max-w-2xl xl:max-w-3xl overflow-y-auto">
          {selectedInteraction && (
            <>
              <SheetHeader className="pb-4 lg:pb-6">
                <SheetTitle 
                  style={{ fontSize: 'clamp(1.25rem, 1rem + 1vw, 1.875rem)' }}
                >
                  Interaction Details
                </SheetTitle>
                <SheetDescription 
                  style={{ fontSize: 'clamp(0.875rem, 0.75rem + 0.5vw, 1rem)' }}
                >
                  Full transcript and details for the interaction with {selectedInteraction.customer.name}.
                </SheetDescription>
              </SheetHeader>
              <div className="grid gap-4 sm:gap-6 lg:gap-8 py-4 lg:py-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                  <div className="flex flex-col space-y-1.5 lg:space-y-2">
                    <p 
                      className="font-medium text-muted-foreground"
                      style={{ fontSize: 'clamp(0.75rem, 0.625rem + 0.5vw, 0.875rem)' }}
                    >
                      Customer
                    </p>
                    <p 
                      className="font-semibold text-foreground"
                      style={{ fontSize: 'clamp(0.875rem, 0.75rem + 0.5vw, 1rem)' }}
                    >
                      {selectedInteraction.customer.name}
                    </p>
                  </div>
                  <div className="flex flex-col space-y-1.5 lg:space-y-2">
                    <p 
                      className="font-medium text-muted-foreground"
                      style={{ fontSize: 'clamp(0.75rem, 0.625rem + 0.5vw, 0.875rem)' }}
                    >
                      Contact
                    </p>
                    <p 
                      className="font-semibold text-foreground"
                      style={{ fontSize: 'clamp(0.875rem, 0.75rem + 0.5vw, 1rem)' }}
                    >
                      {selectedInteraction.contact}
                    </p>
                  </div>
                  <div className="flex flex-col space-y-1.5 lg:space-y-2 sm:col-span-2 lg:col-span-1">
                    <p 
                      className="font-medium text-muted-foreground"
                      style={{ fontSize: 'clamp(0.75rem, 0.625rem + 0.5vw, 0.875rem)' }}
                    >
                      Timestamp
                    </p>
                    <p 
                      className="font-semibold text-foreground"
                      style={{ fontSize: 'clamp(0.875rem, 0.75rem + 0.5vw, 1rem)' }}
                    >
                      {format(selectedInteraction.timestamp, 'PPpp')}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col space-y-2 lg:space-y-3">
                  <p 
                    className="font-medium text-muted-foreground"
                    style={{ fontSize: 'clamp(0.75rem, 0.625rem + 0.5vw, 0.875rem)' }}
                  >
                    Tags
                  </p>
                  <div className="flex flex-wrap gap-2 lg:gap-3">
                    {selectedInteraction.tags.length > 0 ? (
                      selectedInteraction.tags.map(tag => (
                        <Badge 
                          key={tag} 
                          variant="secondary" 
                          className="text-xs sm:text-sm px-3 py-1"
                        >
                          {tag}
                        </Badge>
                      ))
                    ) : (
                      <span 
                        className="text-muted-foreground"
                        style={{ fontSize: 'clamp(0.875rem, 0.75rem + 0.5vw, 1rem)' }}
                      >
                        No tags
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col space-y-2 lg:space-y-3">
                  <p 
                    className="font-medium text-muted-foreground"
                    style={{ fontSize: 'clamp(0.75rem, 0.625rem + 0.5vw, 0.875rem)' }}
                  >
                    Transcript
                  </p>
                  <div className="bg-muted/50 rounded-xl p-4 sm:p-6 lg:p-8 max-h-[400px] sm:max-h-[500px] lg:max-h-[600px] overflow-y-auto">
                    <p 
                      className="font-mono whitespace-pre-wrap leading-relaxed"
                      style={{ fontSize: 'clamp(0.75rem, 0.625rem + 0.5vw, 0.875rem)' }}
                    >
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
