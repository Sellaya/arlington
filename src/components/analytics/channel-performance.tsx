"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Phone, MessageSquare, Globe, TrendingUp } from 'lucide-react';

interface ChannelPerformance {
  channel: 'Call' | 'Chat' | 'Web Form';
  total: number;
  converted: number;
  conversionRate: number;
  avgRevenue: number;
  totalRevenue: number;
}

interface ChannelPerformanceProps {
  data: ChannelPerformance[];
  loading?: boolean;
}

const channelIcons: Record<string, React.ReactNode> = {
  'Call': <Phone className="h-4 w-4" />,
  'Chat': <MessageSquare className="h-4 w-4" />,
  'Web Form': <Globe className="h-4 w-4" />,
};

const channelColors: Record<string, string> = {
  'Call': 'hsl(var(--chart-1))',
  'Chat': 'hsl(var(--chart-2))',
  'Web Form': 'hsl(var(--chart-3))',
};

export function ChannelPerformance({ data, loading }: ChannelPerformanceProps) {
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

  const chartData = data.map(channel => ({
    channel: channel.channel,
    'Total': channel.total,
    'Converted': channel.converted,
    'Conversion Rate': channel.conversionRate,
  }));

  const bestChannel = data.reduce((best, current) => 
    current.conversionRate > best.conversionRate ? current : best
  );

  return (
    <Card className="border-border/60 w-full">
      <CardHeader className="px-3 sm:px-4 md:px-6 pb-2.5 sm:pb-3 md:pb-4">
        <CardTitle 
          className="flex items-center gap-2 font-semibold"
          style={{ fontSize: 'clamp(1rem, 0.875rem + 0.75vw, 1.5rem)' }}
        >
          <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
          <span>Channel Performance</span>
        </CardTitle>
        <CardDescription 
          className="text-muted-foreground"
          style={{ fontSize: 'clamp(0.6875rem, 0.625rem + 0.375vw, 0.875rem)' }}
        >
          Conversion rates and revenue by channel (Calls vs Chats vs Web Forms)
        </CardDescription>
      </CardHeader>
      <CardContent className="px-3 sm:px-4 md:px-6 pb-3 sm:pb-4 md:pb-6">
        <div className="space-y-4 sm:space-y-5 md:space-y-6">
          {/* Channel Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {data.map((channel) => (
              <div
                key={channel.channel}
                className={`rounded-lg p-3 sm:p-4 border-2 transition-colors ${
                  channel.channel === bestChannel.channel
                    ? 'border-primary bg-primary/5 dark:bg-primary/10'
                    : 'border-border/60'
                }`}
              >
                <div className="flex items-center gap-2 mb-2.5 sm:mb-3 flex-wrap">
                  <span className="flex-shrink-0">{channelIcons[channel.channel]}</span>
                  <span 
                    className="font-semibold text-foreground"
                    style={{ fontSize: 'clamp(0.875rem, 0.8125rem + 0.375vw, 1rem)' }}
                  >
                    {channel.channel}
                  </span>
                  {channel.channel === bestChannel.channel && (
                    <Badge variant="default" className="text-xs px-1.5 py-0.5">Best</Badge>
                  )}
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                  <div className="flex justify-between items-center">
                    <span 
                      className="text-muted-foreground"
                      style={{ fontSize: 'clamp(0.6875rem, 0.625rem + 0.375vw, 0.8125rem)' }}
                    >
                      Total:
                    </span>
                    <span 
                      className="font-semibold text-foreground"
                      style={{ fontSize: 'clamp(0.75rem, 0.6875rem + 0.375vw, 0.875rem)' }}
                    >
                      {channel.total}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span 
                      className="text-muted-foreground"
                      style={{ fontSize: 'clamp(0.6875rem, 0.625rem + 0.375vw, 0.8125rem)' }}
                    >
                      Converted:
                    </span>
                    <span 
                      className="font-semibold text-green-600 dark:text-green-500"
                      style={{ fontSize: 'clamp(0.75rem, 0.6875rem + 0.375vw, 0.875rem)' }}
                    >
                      {channel.converted}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span 
                      className="text-muted-foreground"
                      style={{ fontSize: 'clamp(0.6875rem, 0.625rem + 0.375vw, 0.8125rem)' }}
                    >
                      Conversion:
                    </span>
                    <span 
                      className="font-semibold text-primary"
                      style={{ fontSize: 'clamp(0.75rem, 0.6875rem + 0.375vw, 0.875rem)' }}
                    >
                      {channel.conversionRate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-border/40">
                    <span 
                      className="text-muted-foreground"
                      style={{ fontSize: 'clamp(0.6875rem, 0.625rem + 0.375vw, 0.8125rem)' }}
                    >
                      Revenue:
                    </span>
                    <span 
                      className="font-semibold text-green-600 dark:text-green-500"
                      style={{ fontSize: 'clamp(0.75rem, 0.6875rem + 0.375vw, 0.875rem)' }}
                    >
                      ${(channel.totalRevenue / 1000).toFixed(1)}k
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Conversion Rate Chart */}
          {chartData.length > 0 && (
            <ChartContainer
              config={{
                'Conversion Rate': {
                  label: "Conversion Rate (%)",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-[200px] sm:h-[250px] md:h-[300px] w-full"
            >
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="channel" 
                  tick={{ 
                    fontSize: 'clamp(0.625rem, 0.5625rem + 0.375vw, 0.75rem)',
                    fill: 'hsl(var(--muted-foreground))'
                  }}
                />
                <YAxis 
                  tick={{ 
                    fontSize: 'clamp(0.625rem, 0.5625rem + 0.375vw, 0.75rem)',
                    fill: 'hsl(var(--muted-foreground))'
                  }}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip 
                  content={<ChartTooltipContent />}
                  formatter={(value: number) => `${value.toFixed(1)}%`}
                />
                <Bar dataKey="Conversion Rate" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={channelColors[entry.channel]} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

