"use client";

import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { analyticsData } from '@/lib/data';

const kpiData = [
    { title: "Average Response Time", value: '32s', change: '-2s' },
    { title: "Avg. Handling Time", value: '2m 15s', change: '+5s' },
    { title: "Missed Interaction Rate", value: '5.8%', change: '-1.2%' },
];


export default function AnalyticsPage() {
    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold font-headline">Analytics</h1>
                <p className="text-muted-foreground">
                    Insights into your AI receptionist's performance.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                {kpiData.map((kpi) => (
                    <Card key={kpi.title}>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{kpi.value}</div>
                            <p className="text-xs text-muted-foreground">{kpi.change} from last week</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Call & Chat Volume</CardTitle>
                        <CardDescription>Last 7 days</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={{}} className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={analyticsData.volume}>
                                    <CartesianGrid vertical={false} />
                                    <XAxis dataKey="name" tickLine={false} axisLine={false} />
                                    <YAxis tickLine={false} axisLine={false} />
                                    <Tooltip content={<ChartTooltipContent />} />
                                    <Bar dataKey="calls" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="chats" fill="var(--color-secondary)" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Conversion Rate</CardTitle>
                        <CardDescription>Weekly trend</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={{}} className="h-64">
                             <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={analyticsData.conversion}>
                                    <CartesianGrid vertical={false} />
                                    <XAxis dataKey="date" tickLine={false} axisLine={false} />
                                    <YAxis unit="%" tickLine={false} axisLine={false} />
                                    <Tooltip content={<ChartTooltipContent />} />
                                    <Line type="monotone" dataKey="rate" stroke="var(--color-primary)" strokeWidth={2} dot={true} />
                                </LineChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
