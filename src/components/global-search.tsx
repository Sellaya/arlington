"use client";

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Clock, Phone, MessageSquare, Calendar, Briefcase, User, X } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';
import type { Interaction, Lead, Contact, Booking } from '@/lib/types';

interface SearchResult {
  id: string;
  type: 'interaction' | 'lead' | 'contact' | 'booking';
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  url: string;
  metadata?: {
    status?: string;
    date?: Date;
    avatar?: string;
  };
}

interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GlobalSearch({ open, onOpenChange }: GlobalSearchProps) {
  const router = useRouter();
  const [query, setQuery] = React.useState('');
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  // Load data and search
  React.useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    const searchQuery = query.toLowerCase();

    fetch('/api/data')
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to fetch data');
        }
        return res.json();
      })
      .then(data => {
        const allResults: SearchResult[] = [];

        // Search interactions
        (data.interactions || []).forEach((item: Interaction) => {
          const name = item.customer.name.toLowerCase();
          const contact = item.contact.toLowerCase();
          const transcript = (item.transcript || '').toLowerCase();

          if (name.includes(searchQuery) || contact.includes(searchQuery) || transcript.includes(searchQuery)) {
            allResults.push({
              id: item.id,
              type: 'interaction',
              title: item.customer.name,
              subtitle: item.contact,
              icon: item.channel === 'Call' ? (
                <Phone className="h-4 w-4" />
              ) : (
                <MessageSquare className="h-4 w-4" />
              ),
              url: '/interactions',
              metadata: {
                status: item.status,
                date: item.timestamp instanceof Date ? item.timestamp : new Date(item.timestamp),
                avatar: item.customer.avatar,
              },
            });
          }
        });

        // Search leads
        (data.leads || []).forEach((item: Lead) => {
          const name = item.name.toLowerCase();
          const company = item.company.toLowerCase();
          const contact = item.contact.toLowerCase();

          if (name.includes(searchQuery) || company.includes(searchQuery) || contact.includes(searchQuery)) {
            allResults.push({
              id: item.id,
              type: 'lead',
              title: item.name,
              subtitle: `${item.company} • ${item.contact}`,
              icon: <Briefcase className="h-4 w-4" />,
              url: '/management',
              metadata: {
                status: item.status,
                date: item.lastInteraction instanceof Date ? item.lastInteraction : new Date(item.lastInteraction),
              },
            });
          }
        });

        // Search contacts
        (data.contacts || []).forEach((item: Contact) => {
          const name = item.name.toLowerCase();
          const company = item.company.toLowerCase();
          const contact = item.contact.toLowerCase();

          if (name.includes(searchQuery) || company.includes(searchQuery) || contact.includes(searchQuery)) {
            allResults.push({
              id: item.id,
              type: 'contact',
              title: item.name,
              subtitle: `${item.company} • ${item.contact}`,
              icon: <User className="h-4 w-4" />,
              url: '/management',
              metadata: {
                date: item.lastInteraction instanceof Date ? item.lastInteraction : new Date(item.lastInteraction),
              },
            });
          }
        });

        // Search bookings
        (data.bookings || []).forEach((item: Booking) => {
          const customer = item.customer.toLowerCase();
          const service = item.service.toLowerCase();

          if (customer.includes(searchQuery) || service.includes(searchQuery)) {
            allResults.push({
              id: item.id,
              type: 'booking',
              title: item.customer,
              subtitle: `${item.service} • ${format(item.dateTime instanceof Date ? item.dateTime : new Date(item.dateTime), 'MMM d, yyyy')}`,
              icon: <Calendar className="h-4 w-4" />,
              url: '/bookings',
              metadata: {
                status: item.status,
                date: item.dateTime instanceof Date ? item.dateTime : new Date(item.dateTime),
              },
            });
          }
        });

        // Sort by relevance (exact matches first, then by date)
        allResults.sort((a, b) => {
          const aExact = a.title.toLowerCase() === searchQuery;
          const bExact = b.title.toLowerCase() === searchQuery;
          if (aExact && !bExact) return -1;
          if (!aExact && bExact) return 1;
          
          if (a.metadata?.date && b.metadata?.date) {
            return b.metadata.date.getTime() - a.metadata.date.getTime();
          }
          return 0;
        });

        setResults(allResults.slice(0, 10)); // Limit to 10 results
        setLoading(false);
      })
      .catch(error => {
        console.error('Error searching:', error);
        setLoading(false);
      });
  }, [query]);

  const handleSelectResult = React.useCallback((result: SearchResult) => {
    router.push(result.url);
    onOpenChange(false);
    setQuery('');
    setSelectedIndex(0);
  }, [router, onOpenChange]);

  // Keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && results[selectedIndex]) {
        e.preventDefault();
        handleSelectResult(results[selectedIndex]);
      } else if (e.key === 'Escape') {
        onOpenChange(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, results, selectedIndex, handleSelectResult]);

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'interaction': return 'Interaction';
      case 'lead': return 'Lead';
      case 'contact': return 'Contact';
      case 'booking': return 'Booking';
      default: return type;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'Completed':
      case 'Confirmed':
      case 'Qualified':
        return 'default';
      case 'Missed':
      case 'Cancelled':
      case 'Lost':
        return 'destructive';
      case 'Pending':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Global Search
          </DialogTitle>
          <DialogDescription>
            Search across leads, contacts, bookings, and interactions
          </DialogDescription>
        </DialogHeader>
        
        <div className="px-6 pt-4 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, contact, event type, or content..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              className="pl-10 pr-10"
              autoFocus
            />
            {query && (
              <button
                onClick={() => {
                  setQuery('');
                  setResults([]);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <div className="px-6 pb-6 max-h-[400px] overflow-y-auto">
          {loading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : query && results.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No results found for "{query}"</p>
            </div>
          ) : !query ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Start typing to search...</p>
              <div className="mt-4 flex flex-wrap gap-2 justify-center">
                <Badge variant="outline">⌘K to open</Badge>
                <Badge variant="outline">↑↓ to navigate</Badge>
                <Badge variant="outline">Enter to select</Badge>
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              {results.map((result, index) => (
                <button
                  key={result.id}
                  onClick={() => handleSelectResult(result)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    index === selectedIndex
                      ? 'bg-primary/10 border border-primary/20'
                      : 'hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1 text-muted-foreground">
                      {result.icon}
                    </div>
                    {result.metadata?.avatar && (
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarImage src={result.metadata.avatar} />
                        <AvatarFallback className="text-xs">
                          {result.title.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-sm truncate">{result.title}</p>
                        <Badge variant="outline" className="text-xs">
                          {getTypeLabel(result.type)}
                        </Badge>
                        {result.metadata?.status && (
                          <Badge variant={getStatusColor(result.metadata.status) as any} className="text-xs">
                            {result.metadata.status}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{result.subtitle}</p>
                      {result.metadata?.date && (
                        <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(result.metadata.date, { addSuffix: true })}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

