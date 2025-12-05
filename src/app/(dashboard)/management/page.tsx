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
import { Search, Briefcase, Users, Sparkles, TrendingUp, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { SavedFilters } from '@/components/saved-filters';
import { getDefaultView, getCurrentUserRole, type FilterType } from '@/lib/filter-service';

function LeadsTable({ data, onLoadQualityScore, onLoadTimeline }: { 
  data: Lead[];
  onLoadQualityScore: (lead: Lead) => void;
  onLoadTimeline: (lead: Lead) => void;
}) {
  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 50) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="min-w-[150px] lg:min-w-[200px] xl:min-w-[250px]">Name</TableHead>
          <TableHead className="hidden sm:table-cell min-w-[150px] lg:min-w-[200px] xl:min-w-[250px]">Company</TableHead>
          <TableHead className="hidden lg:table-cell min-w-[120px] xl:min-w-[180px]">Contact</TableHead>
          <TableHead className="min-w-[100px] lg:min-w-[120px]">Status</TableHead>
          <TableHead className="min-w-[100px]">Quality Score</TableHead>
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
            <TableCell>
              {lead.qualityScore ? (
                <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-md border text-xs font-semibold ${getScoreColor(lead.qualityScore.score)}`}>
                  <TrendingUp className="h-3 w-3" />
                  {lead.qualityScore.score}
                </div>
              ) : (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onLoadQualityScore(lead)}
                  className="h-7 text-xs"
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  Score
                </Button>
              )}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex items-center justify-end gap-2">
                <span className="text-muted-foreground text-xs sm:text-sm">
                  {format(lead.lastInteraction, 'PP')}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onLoadTimeline(lead)}
                  className="h-7 w-7 p-0"
                  title="View timeline summary"
                >
                  <Clock className="h-3 w-3" />
                </Button>
              </div>
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
  const { toast } = useToast();
  const [leads, setLeads] = React.useState<Lead[]>([]);
  const [contacts, setContacts] = React.useState<Contact[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedLead, setSelectedLead] = React.useState<Lead | null>(null);
  const [loadingAI, setLoadingAI] = React.useState(false);
  const [timelineSummary, setTimelineSummary] = React.useState<any>(null);
  const [activeFilters, setActiveFilters] = React.useState<Record<string, any>>({
    status: 'all',
    search: '',
  });

  // Apply default view on mount
  React.useEffect(() => {
    const role = getCurrentUserRole();
    const defaultView = getDefaultView(role, 'leads' as FilterType);
    if (defaultView) {
      setActiveFilters(defaultView.filters);
    }
  }, []);

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

  const handleLoadQualityScore = async (lead: Lead) => {
    if (lead.qualityScore) return; // Already loaded
    
    setLoadingAI(true);
    try {
      // Find related interaction
      const interactionsResponse = await fetch('/api/data');
      const data = await interactionsResponse.json();
      const interaction = (data.interactions || []).find(
        (i: any) => i.customer.name.toLowerCase() === lead.name.toLowerCase()
      );

      if (!interaction) {
        toast({
          title: 'No interaction found',
          description: 'Cannot generate score without interaction data',
          variant: 'destructive',
        });
        return;
      }

      const response = await fetch('/api/ai/lead-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interaction,
          eventType: lead.company,
          headcount: undefined, // Could be extracted from interaction if available
        }),
      });

      const qualityScore = await response.json();
      
      // Update lead with quality score
      setLeads(prev => prev.map(l => 
        l.id === lead.id ? { ...l, qualityScore } : l
      ));
    } catch (error) {
      console.error('Error loading quality score:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate quality score',
        variant: 'destructive',
      });
    } finally {
      setLoadingAI(false);
    }
  };

  const handleLoadTimeline = async (lead: Lead) => {
    setSelectedLead(lead);
    setLoadingAI(true);
    setTimelineSummary(null);
    
    try {
      const interactionsResponse = await fetch('/api/data');
      const data = await interactionsResponse.json();
      const interactions = data.interactions || [];

      const response = await fetch('/api/ai/timeline-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead,
          interactions,
        }),
      });

      const summary = await response.json();
      setTimelineSummary(summary);
    } catch (error) {
      console.error('Error loading timeline summary:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate timeline summary',
        variant: 'destructive',
      });
    } finally {
      setLoadingAI(false);
    }
  };

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
          <div className="flex items-center gap-2 w-full sm:w-auto">
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
            <SavedFilters
              type="leads"
              currentFilters={activeFilters}
              onApplyFilter={setActiveFilters}
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
                <LeadsTable 
                  data={leads} 
                  onLoadQualityScore={handleLoadQualityScore}
                  onLoadTimeline={handleLoadTimeline}
                />
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

      {/* Timeline Summary Dialog */}
      <Dialog open={!!selectedLead} onOpenChange={(open) => !open && setSelectedLead(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Timeline Summary - {selectedLead?.name}</DialogTitle>
            <DialogDescription>
              AI-generated analysis of interaction history
            </DialogDescription>
          </DialogHeader>
          {loadingAI ? (
            <div className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : timelineSummary ? (
            <div className="space-y-4">
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <h4 className="font-semibold mb-2">Synopsis</h4>
                <p className="text-sm text-muted-foreground">{timelineSummary.synopsis}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Touchpoints</p>
                  <p className="text-lg font-semibold">{timelineSummary.touchpoints}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Likelihood to Book</p>
                  <Badge variant={timelineSummary.likelihoodToBook === 'high' ? 'default' : 'secondary'}>
                    {timelineSummary.likelihoodToBook}
                  </Badge>
                </div>
              </div>
              {timelineSummary.estimatedTimeframe && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Estimated Timeframe</p>
                  <p className="text-sm font-semibold">{timelineSummary.estimatedTimeframe}</p>
                </div>
              )}
              {timelineSummary.keyInsights && timelineSummary.keyInsights.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Key Insights</p>
                  <ul className="space-y-1">
                    {timelineSummary.keyInsights.map((insight: string, idx: number) => (
                      <li key={idx} className="text-sm flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground">No summary available</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
