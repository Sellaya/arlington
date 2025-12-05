"use client";

import React from 'react';
import { Bar, BarChart, CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';

const kpiData = [
    { title: "Average Response Time", value: '32s', change: '-2s' },
    { title: "Avg. Handling Time", value: '2m 15s', change: '+5s' },
    { title: "Missed Interaction Rate", value: '5.8%', change: '-1.2%' },
];


export default function AnalyticsPage() {
    const [analyticsData, setAnalyticsData] = React.useState({ volume: [], conversion: [] });
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        fetch('/api/data')
            .then(res => res.json())
            .then(data => {
                setAnalyticsData(data.analytics || { volume: [], conversion: [] });
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching analytics:', err);
                setLoading(false);
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
        <div className="flex flex-col w-full">
            {/* Page Header Section */}
            <section className="mb-4 sm:mb-6 md:mb-8 lg:mb-10">
                <div className="flex flex-col gap-2 sm:gap-3">
                    <h1 
                        className="font-bold font-headline text-foreground"
                        style={{ fontSize: 'clamp(1.75rem, 1.5rem + 1.5vw, 2.5rem)' }}
                    >
                        Analytics
                    </h1>
                    <p 
                        className="text-muted-foreground font-normal"
                        style={{ fontSize: 'clamp(0.875rem, 0.75rem + 0.5vw, 1rem)' }}
                    >
                        Insights into your AI receptionist's performance
                    </p>
                </div>
            </section>

            {/* KPI Cards Section */}
            <section className="mb-4 sm:mb-6 md:mb-8 lg:mb-10">
                <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:gap-6 2xl:gap-8">
                {kpiData.map((kpi) => (
                    <Card key={kpi.title} className="hover:shadow-3d-lg transition-all duration-300">
                        <CardHeader className="pb-2 sm:pb-3 lg:pb-4">
                            <CardTitle className="text-xs sm:text-sm lg:text-base font-medium">{kpi.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                                {kpi.value}
                            </div>
                            <p className="text-xs sm:text-sm lg:text-base text-muted-foreground mt-1.5 sm:mt-2 lg:mt-3">{kpi.change} from last week</p>
                        </CardContent>
                    </Card>
                ))}
                </div>
            </section>

            {/* Charts Section */}
            <section>
                <div className="grid gap-4 sm:gap-6 lg:grid-cols-2 xl:gap-8 2xl:gap-10">
                <Card className="w-full">
                    <CardHeader className="pb-3 sm:pb-4 lg:pb-6">
                        <CardTitle className="text-base sm:text-lg lg:text-xl xl:text-2xl">Call & Chat Volume</CardTitle>
                        <CardDescription className="text-xs sm:text-sm lg:text-base">Last 7 days</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-5 md:p-6 lg:p-8">
                        <ChartContainer 
                            config={{ calls: { label: "Calls" }, chats: { label: "Chats" } }} 
                            className="h-64 sm:h-80 md:h-96 lg:h-[400px] xl:h-[450px] 2xl:h-[500px] w-full"
                        >
                            <BarChart data={analyticsData.volume}>
                                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                                <XAxis 
                                    dataKey="name" 
                                    tickLine={false} 
                                    axisLine={false}
                                    tick={{ fontSize: 12 }}
                                />
                                <YAxis 
                                    tickLine={false} 
                                    axisLine={false}
                                    tick={{ fontSize: 12 }}
                                />
                                <Tooltip content={<ChartTooltipContent />} />
                                <Bar dataKey="calls" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="chats" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
                <Card className="w-full">
                    <CardHeader className="pb-3 sm:pb-4 lg:pb-6">
                        <CardTitle className="text-base sm:text-lg lg:text-xl xl:text-2xl">Conversion Rate</CardTitle>
                        <CardDescription className="text-xs sm:text-sm lg:text-base">Weekly trend</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-5 md:p-6 lg:p-8">
                        <ChartContainer 
                            config={{ rate: { label: "Conversion Rate" } }} 
                            className="h-64 sm:h-80 md:h-96 lg:h-[400px] xl:h-[450px] 2xl:h-[500px] w-full"
                        >
                            <LineChart data={analyticsData.conversion}>
                                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                                <XAxis 
                                    dataKey="date" 
                                    tickLine={false} 
                                    axisLine={false}
                                    tick={{ fontSize: 12 }}
                                />
                                <YAxis 
                                    unit="%" 
                                    tickLine={false} 
                                    axisLine={false}
                                    tick={{ fontSize: 12 }}
                                />
                                <Tooltip content={<ChartTooltipContent />} />
                                <Line 
                                    type="monotone" 
                                    dataKey="rate" 
                                    stroke="hsl(var(--primary))" 
                                    strokeWidth={2} 
                                    dot={{ r: 4 }} 
                                    activeDot={{ r: 6 }}
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
