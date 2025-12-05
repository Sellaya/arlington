"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, TrendingUp, Calendar } from 'lucide-react';

interface TimeInsight {
  pattern: string;
  description: string;
  frequency: number;
  percentage: number;
  examples: string[];
}

interface TimeInsightsProps {
  data: TimeInsight[];
  loading?: boolean;
}

export function TimeInsights({ data, loading }: TimeInsightsProps) {
  if (loading) {
    return (
      <Card className="border-border/60">
        <CardHeader>
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Time-Based Insights
          </CardTitle>
          <CardDescription>
            Patterns in enquiry timing and behavior
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No time-based insights available yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/60 w-full">
      <CardHeader className="px-3 sm:px-4 md:px-6 pb-2.5 sm:pb-3 md:pb-4">
        <CardTitle 
          className="flex items-center gap-2 font-semibold"
          style={{ fontSize: 'clamp(1rem, 0.875rem + 0.75vw, 1.5rem)' }}
        >
          <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
          <span>Time-Based Insights</span>
        </CardTitle>
        <CardDescription 
          className="text-muted-foreground"
          style={{ fontSize: 'clamp(0.6875rem, 0.625rem + 0.375vw, 0.875rem)' }}
        >
          Patterns in enquiry timing and behavior
        </CardDescription>
      </CardHeader>
      <CardContent className="px-3 sm:px-4 md:px-6 pb-3 sm:pb-4 md:pb-6">
        <div className="space-y-3 sm:space-y-4">
          {data.map((insight, index) => (
            <div
              key={index}
              className="bg-muted/50 rounded-lg p-3 sm:p-4 border border-border/40 hover:border-primary/20 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4 mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                    <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
                    <span 
                      className="font-semibold text-foreground"
                      style={{ fontSize: 'clamp(0.8125rem, 0.75rem + 0.375vw, 0.9375rem)' }}
                    >
                      {insight.pattern}
                    </span>
                    <Badge variant="outline" className="text-xs px-1.5 py-0.5 whitespace-nowrap">
                      {insight.frequency} occurrences
                    </Badge>
                  </div>
                  <p 
                    className="text-muted-foreground leading-relaxed"
                    style={{ fontSize: 'clamp(0.75rem, 0.6875rem + 0.375vw, 0.875rem)' }}
                  >
                    {insight.description}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground flex-shrink-0">
                  <TrendingUp className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  <span 
                    style={{ fontSize: 'clamp(0.6875rem, 0.625rem + 0.375vw, 0.8125rem)' }}
                  >
                    {insight.percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
              {insight.examples && insight.examples.length > 0 && (
                <div className="mt-2 sm:mt-2.5 pt-2 sm:pt-2.5 border-t border-border/40">
                  <p 
                    className="text-muted-foreground mb-1.5 sm:mb-2"
                    style={{ fontSize: 'clamp(0.625rem, 0.5625rem + 0.375vw, 0.75rem)' }}
                  >
                    Examples:
                  </p>
                  <ul className="space-y-1 sm:space-y-1.5">
                    {insight.examples.map((example, idx) => (
                      <li 
                        key={idx} 
                        className="flex items-start gap-2"
                        style={{ fontSize: 'clamp(0.625rem, 0.5625rem + 0.375vw, 0.75rem)' }}
                      >
                        <span className="text-primary mt-0.5 flex-shrink-0">•</span>
                        <span className="text-muted-foreground">{example}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

