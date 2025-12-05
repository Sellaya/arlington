"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';
import { DollarSign, TrendingUp } from 'lucide-react';

interface MonthlyRevenue {
  month: string;
  monthNumber: number;
  year: number;
  confirmed: number;
  pending: number;
  projected: number;
  total: number;
}

interface RevenuePipelineProps {
  data: MonthlyRevenue[];
  loading?: boolean;
}

export function RevenuePipeline({ data, loading }: RevenuePipelineProps) {
  if (loading) {
    return (
      <Card className="border-border/60">
        <CardHeader>
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  const chartData = data.map(month => ({
    month: month.month,
    'Confirmed': Math.round(month.confirmed),
    'Pending': Math.round(month.pending),
    'Projected': Math.round(month.projected),
  }));

  const totalConfirmed = data.reduce((sum, m) => sum + m.confirmed, 0);
  const totalPending = data.reduce((sum, m) => sum + m.pending, 0);
  const totalProjected = data.reduce((sum, m) => sum + m.projected, 0);

  return (
    <Card className="border-border/60 w-full">
      <CardHeader className="px-3 sm:px-4 md:px-6 pb-2.5 sm:pb-3 md:pb-4">
        <CardTitle 
          className="flex items-center gap-2 font-semibold"
          style={{ fontSize: 'clamp(1rem, 0.875rem + 0.75vw, 1.5rem)' }}
        >
          <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
          <span>Revenue Pipeline by Month</span>
        </CardTitle>
        <CardDescription 
          className="text-muted-foreground"
          style={{ fontSize: 'clamp(0.6875rem, 0.625rem + 0.375vw, 0.875rem)' }}
        >
          Estimated revenue projections based on event type and headcount
        </CardDescription>
      </CardHeader>
      <CardContent className="px-3 sm:px-4 md:px-6 pb-3 sm:pb-4 md:pb-6">
        <div className="space-y-3 sm:space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 md:gap-4">
            <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-2.5 sm:p-3 border border-green-200 dark:border-green-900">
              <p 
                className="text-muted-foreground mb-1"
                style={{ fontSize: 'clamp(0.625rem, 0.5625rem + 0.375vw, 0.75rem)' }}
              >
                Confirmed
              </p>
              <p 
                className="font-bold text-green-600 dark:text-green-500"
                style={{ fontSize: 'clamp(1rem, 0.875rem + 0.75vw, 1.5rem)' }}
              >
                ${(totalConfirmed / 1000).toFixed(1)}k
              </p>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-950/20 rounded-lg p-2.5 sm:p-3 border border-yellow-200 dark:border-yellow-900">
              <p 
                className="text-muted-foreground mb-1"
                style={{ fontSize: 'clamp(0.625rem, 0.5625rem + 0.375vw, 0.75rem)' }}
              >
                Pending
              </p>
              <p 
                className="font-bold text-yellow-600 dark:text-yellow-500"
                style={{ fontSize: 'clamp(1rem, 0.875rem + 0.75vw, 1.5rem)' }}
              >
                ${(totalPending / 1000).toFixed(1)}k
              </p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-2.5 sm:p-3 border border-blue-200 dark:border-blue-900">
              <p 
                className="text-muted-foreground mb-1"
                style={{ fontSize: 'clamp(0.625rem, 0.5625rem + 0.375vw, 0.75rem)' }}
              >
                Projected
              </p>
              <p 
                className="font-bold text-blue-600 dark:text-blue-500"
                style={{ fontSize: 'clamp(1rem, 0.875rem + 0.75vw, 1.5rem)' }}
              >
                ${(totalProjected / 1000).toFixed(1)}k
              </p>
            </div>
          </div>

          {chartData.length > 0 ? (
            <ChartContainer
              config={{
                Confirmed: {
                  label: "Confirmed Revenue",
                  color: "hsl(var(--chart-1))",
                },
                Pending: {
                  label: "Pending Revenue",
                  color: "hsl(var(--chart-2))",
                },
                Projected: {
                  label: "Projected Revenue",
                  color: "hsl(var(--chart-3))",
                },
              }}
              className="h-[200px] sm:h-[250px] md:h-[300px] lg:h-[350px] w-full"
            >
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="month" 
                  tick={{ 
                    fontSize: 'clamp(0.625rem, 0.5625rem + 0.375vw, 0.75rem)',
                    fill: 'hsl(var(--muted-foreground))'
                  }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  tick={{ 
                    fontSize: 'clamp(0.625rem, 0.5625rem + 0.375vw, 0.75rem)',
                    fill: 'hsl(var(--muted-foreground))'
                  }}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  content={<ChartTooltipContent />}
                  formatter={(value: number) => `$${(value / 1000).toFixed(1)}k`}
                />
                <Legend 
                  wrapperStyle={{ fontSize: 'clamp(0.625rem, 0.5625rem + 0.375vw, 0.75rem)' }}
                />
                <Bar dataKey="Confirmed" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Pending" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Projected" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          ) : (
            <div className="h-[200px] sm:h-[250px] md:h-[300px] flex items-center justify-center text-muted-foreground">
              <p style={{ fontSize: 'clamp(0.75rem, 0.6875rem + 0.375vw, 0.875rem)' }}>
                No revenue data available
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

