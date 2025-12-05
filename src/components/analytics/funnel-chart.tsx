"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrendingDown, Users, CheckCircle, Calendar, DollarSign } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface FunnelMetrics {
  stage: string;
  count: number;
  percentage: number;
  dropoff: number;
  revenue: number;
}

interface FunnelChartProps {
  data: FunnelMetrics[];
  loading?: boolean;
}

const stageIcons: Record<string, React.ReactNode> = {
  'New': <Users className="h-4 w-4" />,
  'Contacted': <CheckCircle className="h-4 w-4" />,
  'Qualified': <CheckCircle className="h-4 w-4" />,
  'Booked': <Calendar className="h-4 w-4" />,
  'Completed': <CheckCircle className="h-4 w-4" />,
};

const stageColors: Record<string, string> = {
  'New': 'bg-blue-500',
  'Contacted': 'bg-yellow-500',
  'Qualified': 'bg-green-500',
  'Booked': 'bg-purple-500',
  'Completed': 'bg-emerald-500',
};

export function FunnelChart({ data, loading }: FunnelChartProps) {
  if (loading) {
    return (
      <Card className="border-border/60">
        <CardHeader>
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const maxCount = Math.max(...data.map(d => d.count), 1);

  return (
    <Card className="border-border/60 w-full">
      <CardHeader className="px-3 sm:px-4 md:px-6 pb-2.5 sm:pb-3 md:pb-4">
        <CardTitle 
          className="flex items-center gap-2 font-semibold"
          style={{ fontSize: 'clamp(1rem, 0.875rem + 0.75vw, 1.5rem)' }}
        >
          <Users className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
          <span>Lead → Booking Funnel</span>
        </CardTitle>
        <CardDescription 
          className="text-muted-foreground"
          style={{ fontSize: 'clamp(0.6875rem, 0.625rem + 0.375vw, 0.875rem)' }}
        >
          Conversion funnel from new leads to completed bookings
        </CardDescription>
      </CardHeader>
      <CardContent className="px-3 sm:px-4 md:px-6 pb-3 sm:pb-4 md:pb-6">
        <div className="space-y-3 sm:space-y-4">
          {data.map((stage, index) => {
            const widthPercentage = (stage.count / maxCount) * 100;
            const isLast = index === data.length - 1;
            
            return (
              <div key={stage.stage} className="space-y-1.5 sm:space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                    <span className="flex-shrink-0">{stageIcons[stage.stage]}</span>
                    <span 
                      className="font-semibold text-foreground"
                      style={{ fontSize: 'clamp(0.75rem, 0.6875rem + 0.375vw, 0.9375rem)' }}
                    >
                      {stage.stage}
                    </span>
                    <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                      {stage.count}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 flex-wrap text-xs sm:text-sm text-muted-foreground">
                    <span className="whitespace-nowrap">{stage.percentage.toFixed(1)}%</span>
                    {!isLast && stage.dropoff > 0 && (
                      <div className="flex items-center gap-1 text-destructive whitespace-nowrap">
                        <TrendingDown className="h-3 w-3 flex-shrink-0" />
                        <span>{stage.dropoff.toFixed(1)}% dropoff</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1 text-green-600 dark:text-green-500 whitespace-nowrap">
                      <DollarSign className="h-3 w-3 flex-shrink-0" />
                      <span>${(stage.revenue / 1000).toFixed(1)}k</span>
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <div 
                    className={`h-6 sm:h-8 rounded-lg ${stageColors[stage.stage]} transition-all duration-500`}
                    style={{ width: `${widthPercentage}%` }}
                  />
                  <Progress 
                    value={stage.percentage} 
                    className="h-1.5 sm:h-2 mt-1"
                  />
                </div>
                {!isLast && (
                  <div className="flex justify-center py-0.5 sm:py-1">
                    <div className="h-3 sm:h-4 w-0.5 bg-border" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        <div className="mt-4 sm:mt-5 md:mt-6 pt-3 sm:pt-4 border-t border-border/40">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <p 
                className="text-muted-foreground mb-1"
                style={{ fontSize: 'clamp(0.6875rem, 0.625rem + 0.375vw, 0.875rem)' }}
              >
                Overall Conversion
              </p>
              <p 
                className="font-bold text-primary"
                style={{ fontSize: 'clamp(1.25rem, 1rem + 1.25vw, 2rem)' }}
              >
                {data.length > 0 && data[0].count > 0
                  ? ((data[data.length - 1].count / data[0].count) * 100).toFixed(1)
                  : '0'}%
              </p>
            </div>
            <div>
              <p 
                className="text-muted-foreground mb-1"
                style={{ fontSize: 'clamp(0.6875rem, 0.625rem + 0.375vw, 0.875rem)' }}
              >
                Total Pipeline Value
              </p>
              <p 
                className="font-bold text-green-600 dark:text-green-500"
                style={{ fontSize: 'clamp(1.25rem, 1rem + 1.25vw, 2rem)' }}
              >
                ${(data.reduce((sum, stage) => sum + stage.revenue, 0) / 1000).toFixed(1)}k
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

