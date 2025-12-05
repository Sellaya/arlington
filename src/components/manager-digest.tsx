"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Sparkles, RefreshCw, TrendingUp, AlertTriangle, XCircle, CheckCircle, Phone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ManagerDigest {
  summary: string;
  highlights: string[];
  metrics: {
    totalInteractions: number;
    hotLeads: number;
    atRisk: number;
    cancellations: number;
    avgQualityScore: number;
  };
  recommendations: string[];
}

export function ManagerDigestCard({ interactions, leads, bookings }: {
  interactions: any[];
  leads: any[];
  bookings: any[];
}) {
  const { toast } = useToast();
  const [digest, setDigest] = React.useState<ManagerDigest | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [expanded, setExpanded] = React.useState(true); // Start expanded when digest is generated

  const generateDigest = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/manager-digest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interactions,
          leads,
          bookings,
        }),
      });

      const data = await response.json();
      setDigest(data);
      setExpanded(true);
    } catch (error) {
      console.error('Error generating digest:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate manager digest',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!digest && !loading) {
    return (
      <Card className="border-border/60 bg-gradient-to-br from-primary/5 to-primary/10 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <CardTitle style={{ fontSize: 'clamp(1.125rem, 1rem + 0.75vw, 1.5rem)' }}>
                Manager Digest
              </CardTitle>
            </div>
            <Button
              onClick={generateDigest}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Generate
            </Button>
          </div>
          <CardDescription style={{ fontSize: 'clamp(0.75rem, 0.625rem + 0.5vw, 0.875rem)' }}>
            Get an AI-powered end-of-day summary of your business activity
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="border-border/60">
        <CardHeader>
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/60 bg-gradient-to-br from-primary/5 to-primary/10 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle style={{ fontSize: 'clamp(1.125rem, 1rem + 0.75vw, 1.5rem)' }}>
              Manager Digest
            </CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={generateDigest}
              variant="ghost"
              size="sm"
              className="gap-2"
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setExpanded(prev => !prev);
              }}
              variant="ghost"
              size="sm"
              type="button"
            >
              {expanded ? 'Collapse' : 'Expand'}
            </Button>
          </div>
        </div>
        <CardDescription style={{ fontSize: 'clamp(0.75rem, 0.625rem + 0.5vw, 0.875rem)' }}>
          End-of-day AI summary - {new Date().toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Summary */}
          <div className="bg-background/50 rounded-lg p-4 border border-border/40">
            <p className="text-sm leading-relaxed">{digest?.summary}</p>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-background/50 rounded-lg p-3 border border-border/40">
              <div className="flex items-center gap-2 mb-1">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Interactions</p>
              </div>
              <p className="text-xl font-bold">{digest?.metrics.totalInteractions || 0}</p>
            </div>
            <div className="bg-background/50 rounded-lg p-3 border border-border/40">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <p className="text-xs text-muted-foreground">Hot Leads</p>
              </div>
              <p className="text-xl font-bold text-green-600">{digest?.metrics.hotLeads || 0}</p>
            </div>
            <div className="bg-background/50 rounded-lg p-3 border border-border/40">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <p className="text-xs text-muted-foreground">At Risk</p>
              </div>
              <p className="text-xl font-bold text-yellow-600">{digest?.metrics.atRisk || 0}</p>
            </div>
            <div className="bg-background/50 rounded-lg p-3 border border-border/40">
              <div className="flex items-center gap-2 mb-1">
                <XCircle className="h-4 w-4 text-red-600" />
                <p className="text-xs text-muted-foreground">Cancellations</p>
              </div>
              <p className="text-xl font-bold text-red-600">{digest?.metrics.cancellations || 0}</p>
            </div>
          </div>

          {/* Highlights */}
          {expanded && digest?.highlights && digest.highlights.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2 text-sm">Key Highlights</h4>
              <ul className="space-y-2">
                {digest.highlights.map((highlight, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendations */}
          {expanded && digest?.recommendations && digest.recommendations.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2 text-sm">Recommendations</h4>
              <ul className="space-y-2">
                {digest.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <Badge variant="outline" className="mt-0.5 flex-shrink-0">
                      {idx + 1}
                    </Badge>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

