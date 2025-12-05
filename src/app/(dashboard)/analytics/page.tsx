"use client";

import React from 'react';
import { Bar, BarChart, CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';
import { FunnelChart } from '@/components/analytics/funnel-chart';
import { RevenuePipeline } from '@/components/analytics/revenue-pipeline';
import { ChannelPerformance } from '@/components/analytics/channel-performance';
import { TimeInsights } from '@/components/analytics/time-insights';

const kpiData = [
    { title: "Average Response Time", value: '32s', change: '-2s' },
    { title: "Avg. Handling Time", value: '2m 15s', change: '+5s' },
    { title: "Missed Interaction Rate", value: '5.8%', change: '-1.2%' },
];


export default function AnalyticsPage() {
    const [analyticsData, setAnalyticsData] = React.useState({ volume: [], conversion: [] });
    const [funnelData, setFunnelData] = React.useState<any[]>([]);
    const [revenueData, setRevenueData] = React.useState<any[]>([]);
    const [channelData, setChannelData] = React.useState<any[]>([]);
    const [timeInsights, setTimeInsights] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [loadingFunnel, setLoadingFunnel] = React.useState(true);
    const [loadingRevenue, setLoadingRevenue] = React.useState(true);
    const [loadingChannels, setLoadingChannels] = React.useState(true);
    const [loadingTimeInsights, setLoadingTimeInsights] = React.useState(true);

    React.useEffect(() => {
        fetch('/api/data')
            .then(res => {
                if (!res.ok) {
                    throw new Error('Failed to fetch data');
                }
                return res.json();
            })
            .then(data => {
                // Ensure analytics data structure is correct
                const analytics = data.analytics || {};
                setAnalyticsData({
                    volume: analytics.volume || [],
                    conversion: analytics.conversion || [],
                });
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching analytics:', err);
                setAnalyticsData({ volume: [], conversion: [] });
                setLoading(false);
            });
    }, []);

    // Fetch funnel data
    React.useEffect(() => {
        fetch('/api/analytics/funnel')
            .then(res => {
                if (!res.ok) {
                    throw new Error('Failed to fetch funnel data');
                }
                return res.json();
            })
            .then(data => {
                setFunnelData(data.funnel || []);
                setLoadingFunnel(false);
            })
            .catch(err => {
                console.error('Error fetching funnel:', err);
                setFunnelData([]);
                setLoadingFunnel(false);
            });
    }, []);

    // Fetch revenue data
    React.useEffect(() => {
        fetch('/api/analytics/revenue')
            .then(res => {
                if (!res.ok) {
                    throw new Error('Failed to fetch revenue data');
                }
                return res.json();
            })
            .then(data => {
                setRevenueData(data.monthlyRevenue || []);
                setLoadingRevenue(false);
            })
            .catch(err => {
                console.error('Error fetching revenue:', err);
                setRevenueData([]);
                setLoadingRevenue(false);
            });
    }, []);

    // Fetch channel performance
    React.useEffect(() => {
        fetch('/api/analytics/channels')
            .then(res => {
                if (!res.ok) {
                    throw new Error('Failed to fetch channel data');
                }
                return res.json();
            })
            .then(data => {
                setChannelData(data.channelPerformance || []);
                setLoadingChannels(false);
            })
            .catch(err => {
                console.error('Error fetching channels:', err);
                setChannelData([]);
                setLoadingChannels(false);
            });
    }, []);

    // Fetch time insights
    React.useEffect(() => {
        fetch('/api/analytics/time-insights')
            .then(res => {
                if (!res.ok) {
                    throw new Error('Failed to fetch time insights');
                }
                return res.json();
            })
            .then(data => {
                setTimeInsights(data.insights || []);
                setLoadingTimeInsights(false);
            })
            .catch(err => {
                console.error('Error fetching time insights:', err);
                setTimeInsights([]);
                setLoadingTimeInsights(false);
            });
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col w-full">
                {/* Page Header Skeleton */}
                <section className="mb-4 sm:mb-6 md:mb-8 lg:mb-10">
                    <Skeleton className="h-8 w-48 mb-2" />
                    <Skeleton className="h-4 w-64" />
                </section>

                {/* KPI Cards Skeleton */}
                <section className="mb-4 sm:mb-6 md:mb-8">
                    <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:gap-6 2xl:gap-8">
                        {[...Array(3)].map((_, i) => (
                            <Card key={i} className="border-border/60">
                                <CardHeader className="pb-2 sm:pb-3 lg:pb-4">
                                    <Skeleton className="h-4 w-32" />
                                </CardHeader>
                                <CardContent>
                                    <Skeleton className="h-8 w-20 mb-2" />
                                    <Skeleton className="h-3 w-24" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>

                {/* Charts Skeleton */}
                <section>
                    <div className="grid gap-4 sm:gap-6 lg:grid-cols-2 xl:gap-8 2xl:gap-10">
                        {[...Array(2)].map((_, i) => (
                            <Card key={i} className="border-border/60">
                                <CardHeader className="pb-3 sm:pb-4 lg:pb-6">
                                    <Skeleton className="h-6 w-40 mb-2" />
                                    <Skeleton className="h-4 w-24" />
                                </CardHeader>
                                <CardContent className="p-4 sm:p-5 md:p-6 lg:p-8">
                                    <Skeleton className="h-64 sm:h-80 md:h-96 lg:h-[400px] w-full" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>
            </div>
        );
    }

    return (
        <div className="flex flex-col w-full max-w-none">
            {/* Page Header Section - Mobile First */}
            <section className="mb-3 sm:mb-4 md:mb-6 lg:mb-8 xl:mb-10">
                <div className="flex flex-col gap-1.5 sm:gap-2 md:gap-3">
                    <h1 
                        className="font-bold font-headline text-foreground leading-tight"
                        style={{ fontSize: 'clamp(1.5rem, 1.25rem + 1.25vw, 2.5rem)' }}
                    >
                        Analytics
                    </h1>
                    <p 
                        className="text-muted-foreground font-normal leading-relaxed"
                        style={{ fontSize: 'clamp(0.8125rem, 0.75rem + 0.5vw, 1rem)' }}
                    >
                        Insights into your AI receptionist's performance
                    </p>
                </div>
            </section>

            {/* KPI Cards Section - Mobile First */}
            <section className="mb-3 sm:mb-4 md:mb-6 lg:mb-8 xl:mb-10">
                <div className="grid grid-cols-1 gap-2.5 sm:gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4 xl:gap-6 2xl:gap-8">
                    {kpiData.map((kpi) => (
                        <Card 
                            key={kpi.title} 
                            className="border-border/60 hover:shadow-3d-lg transition-all duration-300 hover:border-primary/20"
                        >
                            <CardHeader className="pb-2 sm:pb-2.5 md:pb-3 lg:pb-4 px-3 sm:px-4 md:px-6">
                                <CardTitle 
                                    className="font-medium text-foreground"
                                    style={{ fontSize: 'clamp(0.75rem, 0.6875rem + 0.375vw, 1rem)' }}
                                >
                                    {kpi.title}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="px-3 sm:px-4 md:px-6 pb-3 sm:pb-4 md:pb-6">
                                <div 
                                    className="font-bold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent leading-none"
                                    style={{ fontSize: 'clamp(1.5rem, 1.25rem + 1.5vw, 3rem)' }}
                                >
                                    {kpi.value}
                                </div>
                                <p 
                                    className="text-muted-foreground mt-1.5 sm:mt-2 md:mt-2.5 lg:mt-3 leading-tight"
                                    style={{ fontSize: 'clamp(0.6875rem, 0.625rem + 0.375vw, 0.9375rem)' }}
                                >
                                    {kpi.change} from last week
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

            {/* Funnel & Revenue Section - Mobile First */}
            <section className="mb-3 sm:mb-4 md:mb-6 lg:mb-8 xl:mb-10">
                <div className="grid grid-cols-1 gap-3 sm:gap-4 md:gap-5 lg:grid-cols-2 lg:gap-6 xl:gap-8 2xl:gap-10">
                    <FunnelChart data={funnelData} loading={loadingFunnel} />
                    <RevenuePipeline data={revenueData} loading={loadingRevenue} />
                </div>
            </section>

            {/* Channel Performance Section - Mobile First */}
            <section className="mb-3 sm:mb-4 md:mb-6 lg:mb-8 xl:mb-10">
                <ChannelPerformance data={channelData} loading={loadingChannels} />
            </section>

            {/* Time Insights Section - Mobile First */}
            <section className="mb-3 sm:mb-4 md:mb-6 lg:mb-8 xl:mb-10">
                <TimeInsights data={timeInsights} loading={loadingTimeInsights} />
            </section>

            {/* Original Charts Section - Mobile First */}
            <section className="mb-3 sm:mb-4 md:mb-6 lg:mb-8">
                <div className="grid grid-cols-1 gap-3 sm:gap-4 md:gap-5 lg:grid-cols-2 lg:gap-6 xl:gap-8 2xl:gap-10">
                    <Card className="w-full border-border/60">
                        <CardHeader className="pb-2.5 sm:pb-3 md:pb-4 lg:pb-6 px-3 sm:px-4 md:px-6">
                            <CardTitle 
                                className="font-semibold text-foreground"
                                style={{ fontSize: 'clamp(1rem, 0.875rem + 0.75vw, 1.5rem)' }}
                            >
                                Call & Chat Volume
                            </CardTitle>
                            <CardDescription 
                                className="text-muted-foreground"
                                style={{ fontSize: 'clamp(0.6875rem, 0.625rem + 0.375vw, 0.875rem)' }}
                            >
                                Last 7 days
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-3 sm:p-4 md:p-5 lg:p-6 xl:p-8">
                            <ChartContainer 
                                config={{ calls: { label: "Calls" }, chats: { label: "Chats" } }} 
                                className="h-[200px] sm:h-[250px] md:h-[300px] lg:h-[350px] xl:h-[400px] 2xl:h-[450px] w-full"
                            >
                                <BarChart data={analyticsData.volume}>
                                    <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
                                    <XAxis 
                                        dataKey="name" 
                                        tickLine={false} 
                                        axisLine={false}
                                        tick={{ 
                                            fontSize: 'clamp(0.625rem, 0.5625rem + 0.375vw, 0.75rem)',
                                            fill: 'hsl(var(--muted-foreground))'
                                        }}
                                    />
                                    <YAxis 
                                        tickLine={false} 
                                        axisLine={false}
                                        tick={{ 
                                            fontSize: 'clamp(0.625rem, 0.5625rem + 0.375vw, 0.75rem)',
                                            fill: 'hsl(var(--muted-foreground))'
                                        }}
                                    />
                                    <Tooltip content={<ChartTooltipContent />} />
                                    <Bar dataKey="calls" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="chats" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                    <Card className="w-full border-border/60">
                        <CardHeader className="pb-2.5 sm:pb-3 md:pb-4 lg:pb-6 px-3 sm:px-4 md:px-6">
                            <CardTitle 
                                className="font-semibold text-foreground"
                                style={{ fontSize: 'clamp(1rem, 0.875rem + 0.75vw, 1.5rem)' }}
                            >
                                Conversion Rate
                            </CardTitle>
                            <CardDescription 
                                className="text-muted-foreground"
                                style={{ fontSize: 'clamp(0.6875rem, 0.625rem + 0.375vw, 0.875rem)' }}
                            >
                                Weekly trend
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-3 sm:p-4 md:p-5 lg:p-6 xl:p-8">
                            <ChartContainer 
                                config={{ rate: { label: "Conversion Rate" } }} 
                                className="h-[200px] sm:h-[250px] md:h-[300px] lg:h-[350px] xl:h-[400px] 2xl:h-[450px] w-full"
                            >
                                <LineChart data={analyticsData.conversion}>
                                    <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
                                    <XAxis 
                                        dataKey="date" 
                                        tickLine={false} 
                                        axisLine={false}
                                        tick={{ 
                                            fontSize: 'clamp(0.625rem, 0.5625rem + 0.375vw, 0.75rem)',
                                            fill: 'hsl(var(--muted-foreground))'
                                        }}
                                    />
                                    <YAxis 
                                        unit="%" 
                                        tickLine={false} 
                                        axisLine={false}
                                        tick={{ 
                                            fontSize: 'clamp(0.625rem, 0.5625rem + 0.375vw, 0.75rem)',
                                            fill: 'hsl(var(--muted-foreground))'
                                        }}
                                    />
                                    <Tooltip content={<ChartTooltipContent />} />
                                    <Line 
                                        type="monotone" 
                                        dataKey="rate" 
                                        stroke="hsl(var(--primary))" 
                                        strokeWidth={2} 
                                        dot={{ r: 3 }} 
                                        activeDot={{ r: 5 }}
                                    />
                                </LineChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                </div>
            </section>
        </div>
    );
}
