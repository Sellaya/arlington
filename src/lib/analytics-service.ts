/**
 * Analytics Service
 * Provides funnel analysis, revenue projections, channel performance, and time-based insights
 */

import type { Interaction, Lead, Booking, Contact } from './types';

// Revenue estimates by event type and headcount
const REVENUE_ESTIMATES: Record<string, { basePrice: number; perPerson: number }> = {
  'Wedding': { basePrice: 5000, perPerson: 150 },
  'Corporate': { basePrice: 3000, perPerson: 100 },
  'Birthday': { basePrice: 1500, perPerson: 75 },
  'Anniversary': { basePrice: 2000, perPerson: 100 },
  'Conference': { basePrice: 4000, perPerson: 120 },
  'Meeting': { basePrice: 500, perPerson: 50 },
  'Other': { basePrice: 2000, perPerson: 80 },
};

// Calculate estimated revenue for a booking/lead
export function calculateEstimatedRevenue(
  eventType: string,
  headcount?: number
): number {
  // Normalize event type (case-insensitive, handle variations)
  const normalizedType = Object.keys(REVENUE_ESTIMATES).find(
    key => key.toLowerCase() === eventType.toLowerCase()
  ) || 'Other';
  
  const estimate = REVENUE_ESTIMATES[normalizedType] || REVENUE_ESTIMATES['Other'];
  const base = estimate.basePrice;
  const perPerson = headcount && headcount > 0 ? estimate.perPerson * headcount : 0;
  return base + perPerson;
}

// Funnel stages
export type FunnelStage = 'New' | 'Contacted' | 'Qualified' | 'Booked' | 'Completed';

export interface FunnelMetrics {
  stage: FunnelStage;
  count: number;
  percentage: number;
  dropoff: number; // Percentage dropoff from previous stage
  revenue: number; // Estimated revenue at this stage
}

// Calculate lead → booking funnel
export function calculateFunnel(
  leads: Lead[],
  bookings: Booking[],
  interactions: Interaction[]
): FunnelMetrics[] {
  // Stage 1: New leads
  const newLeads = leads.filter(l => l.status === 'New');
  
  // Stage 2: Contacted (leads with status 'Contacted' or have interactions)
  const contactedLeads = leads.filter(l => 
    l.status === 'Contacted' || 
    interactions.some(i => i.customer.name.toLowerCase() === l.name.toLowerCase())
  );
  
  // Stage 3: Qualified
  const qualifiedLeads = leads.filter(l => l.status === 'Qualified');
  
  // Stage 4: Booked (leads that have bookings)
  const bookedLeads = leads.filter(l => 
    bookings.some(b => b.customer.toLowerCase() === l.name.toLowerCase())
  );
  
  // Stage 5: Completed (bookings with status 'Confirmed')
  const completedBookings = bookings.filter(b => b.status === 'Confirmed');
  
  const stages: FunnelMetrics[] = [
    {
      stage: 'New',
      count: newLeads.length,
      percentage: 100,
      dropoff: 0,
      revenue: newLeads.reduce((sum, lead) => {
        const eventType = lead.company || 'Other';
        return sum + calculateEstimatedRevenue(eventType);
      }, 0),
    },
    {
      stage: 'Contacted',
      count: contactedLeads.length,
      percentage: newLeads.length > 0 ? (contactedLeads.length / newLeads.length) * 100 : 0,
      dropoff: newLeads.length > 0 ? ((newLeads.length - contactedLeads.length) / newLeads.length) * 100 : 0,
      revenue: contactedLeads.reduce((sum, lead) => {
        const eventType = lead.company || 'Other';
        return sum + calculateEstimatedRevenue(eventType);
      }, 0),
    },
    {
      stage: 'Qualified',
      count: qualifiedLeads.length,
      percentage: newLeads.length > 0 ? (qualifiedLeads.length / newLeads.length) * 100 : 0,
      dropoff: contactedLeads.length > 0 ? ((contactedLeads.length - qualifiedLeads.length) / contactedLeads.length) * 100 : 0,
      revenue: qualifiedLeads.reduce((sum, lead) => {
        const eventType = lead.company || 'Other';
        return sum + calculateEstimatedRevenue(eventType);
      }, 0),
    },
    {
      stage: 'Booked',
      count: bookedLeads.length,
      percentage: newLeads.length > 0 ? (bookedLeads.length / newLeads.length) * 100 : 0,
      dropoff: qualifiedLeads.length > 0 ? ((qualifiedLeads.length - bookedLeads.length) / qualifiedLeads.length) * 100 : 0,
      revenue: bookedLeads.reduce((sum, lead) => {
        const eventType = lead.company || 'Other';
        return sum + calculateEstimatedRevenue(eventType);
      }, 0),
    },
    {
      stage: 'Completed',
      count: completedBookings.length,
      percentage: newLeads.length > 0 ? (completedBookings.length / newLeads.length) * 100 : 0,
      dropoff: bookedLeads.length > 0 ? ((bookedLeads.length - completedBookings.length) / bookedLeads.length) * 100 : 0,
      revenue: completedBookings.reduce((sum, booking) => {
        const eventType = booking.service || 'Other';
        return sum + calculateEstimatedRevenue(eventType);
      }, 0),
    },
  ];
  
  return stages;
}

// Revenue pipeline by month
export interface MonthlyRevenue {
  month: string;
  monthNumber: number;
  year: number;
  confirmed: number;
  pending: number;
  projected: number;
  total: number;
}

export function calculateMonthlyRevenue(bookings: Booking[]): MonthlyRevenue[] {
  const monthlyData: Record<string, MonthlyRevenue> = {};
  
  bookings.forEach(booking => {
    const date = booking.dateTime instanceof Date ? booking.dateTime : new Date(booking.dateTime);
    const monthNum = date.getMonth() + 1;
    const monthKey = `${date.getFullYear()}-${monthNum < 10 ? '0' : ''}${monthNum}`;
    const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = {
        month: monthName,
        monthNumber: date.getMonth() + 1,
        year: date.getFullYear(),
        confirmed: 0,
        pending: 0,
        projected: 0,
        total: 0,
      };
    }
    
    const eventType = booking.service || 'Other';
    const revenue = calculateEstimatedRevenue(eventType);
    
    if (booking.status === 'Confirmed') {
      monthlyData[monthKey].confirmed += revenue;
    } else if (booking.status === 'Pending') {
      monthlyData[monthKey].pending += revenue;
    }
    monthlyData[monthKey].projected += revenue;
    monthlyData[monthKey].total += revenue;
  });
  
  return Object.values(monthlyData).sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return a.monthNumber - b.monthNumber;
  });
}

// Channel performance metrics
export interface ChannelPerformance {
  channel: 'Call' | 'Chat' | 'Web Form';
  total: number;
  converted: number;
  conversionRate: number;
  avgRevenue: number;
  totalRevenue: number;
}

export function calculateChannelPerformance(
  interactions: Interaction[],
  leads: Lead[],
  bookings: Booking[]
): ChannelPerformance[] {
  const channels: Record<string, ChannelPerformance> = {
    'Call': { channel: 'Call', total: 0, converted: 0, conversionRate: 0, avgRevenue: 0, totalRevenue: 0 },
    'Chat': { channel: 'Chat', total: 0, converted: 0, conversionRate: 0, avgRevenue: 0, totalRevenue: 0 },
    'Web Form': { channel: 'Web Form', total: 0, converted: 0, conversionRate: 0, avgRevenue: 0, totalRevenue: 0 },
  };
  
  // Count interactions by channel
  interactions.forEach(interaction => {
    const channel = interaction.channel;
    if (channels[channel]) {
      channels[channel].total++;
    }
  });
  
  // Count conversions (leads that became bookings)
  leads.forEach(lead => {
    const hasBooking = bookings.some(b => 
      b.customer.toLowerCase() === lead.name.toLowerCase()
    );
    
    if (hasBooking) {
      // Find the interaction channel for this lead
      const interaction = interactions.find(i => 
        i.customer.name.toLowerCase() === lead.name.toLowerCase()
      );
      
      if (interaction) {
        const channel = interaction.channel;
        if (channels[channel]) {
          channels[channel].converted++;
          
          const booking = bookings.find(b => 
            b.customer.toLowerCase() === lead.name.toLowerCase()
          );
          if (booking) {
            const eventType = booking.service || lead.company || 'Other';
            const revenue = calculateEstimatedRevenue(eventType);
            channels[channel].totalRevenue += revenue;
          }
        }
      }
    }
  });
  
  // Calculate conversion rates and averages
  Object.values(channels).forEach(channel => {
    channel.conversionRate = channel.total > 0 
      ? (channel.converted / channel.total) * 100 
      : 0;
    channel.avgRevenue = channel.converted > 0 
      ? channel.totalRevenue / channel.converted 
      : 0;
  });
  
  return Object.values(channels);
}

// Time-based insights
export interface TimeInsight {
  pattern: string;
  description: string;
  frequency: number;
  percentage: number;
  examples: string[];
}

export function calculateTimeInsights(
  interactions: Interaction[],
  leads: Lead[]
): TimeInsight[] {
  const insights: TimeInsight[] = [];
  
  // Day of week analysis
  const dayCounts: Record<string, number> = {};
  const dayEventTypes: Record<string, Record<string, number>> = {};
  
  interactions.forEach(interaction => {
    const date = interaction.timestamp instanceof Date 
      ? interaction.timestamp 
      : new Date(interaction.timestamp);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    
    dayCounts[dayName] = (dayCounts[dayName] || 0) + 1;
    
    // Find related lead for event type
    const lead = leads.find(l => 
      l.name.toLowerCase() === interaction.customer.name.toLowerCase()
    );
    const eventType = lead?.company || interaction.eventType || 'Unknown';
    
    if (!dayEventTypes[dayName]) {
      dayEventTypes[dayName] = {};
    }
    dayEventTypes[dayName][eventType] = (dayEventTypes[dayName][eventType] || 0) + 1;
  });
  
  // Find most active day
  const mostActiveDay = Object.entries(dayCounts).reduce((a, b) => 
    dayCounts[a[0]] > dayCounts[b[0]] ? a : b
  );
  
  if (mostActiveDay) {
    const [day, count] = mostActiveDay;
    const total = interactions.length;
    const topEventType = Object.entries(dayEventTypes[day] || {})
      .sort((a, b) => b[1] - a[1])[0];
    
    if (topEventType) {
      insights.push({
        pattern: `${day} Activity`,
        description: `Most enquiries for ${topEventType[0]} come in on ${day}s`,
        frequency: topEventType[1],
        percentage: (topEventType[1] / total) * 100,
        examples: [`${topEventType[1]} ${topEventType[0]} enquiries on ${day}s`],
      });
    }
  }
  
  // Hour of day analysis
  const hourCounts: Record<number, number> = {};
  const hourEventTypes: Record<number, Record<string, number>> = {};
  
  interactions.forEach(interaction => {
    const date = interaction.timestamp instanceof Date 
      ? interaction.timestamp 
      : new Date(interaction.timestamp);
    const hour = date.getHours();
    
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    
    const lead = leads.find(l => 
      l.name.toLowerCase() === interaction.customer.name.toLowerCase()
    );
    const eventType = lead?.company || interaction.eventType || 'Unknown';
    
    if (!hourEventTypes[hour]) {
      hourEventTypes[hour] = {};
    }
    hourEventTypes[hour][eventType] = (hourEventTypes[hour][eventType] || 0) + 1;
  });
  
  // Find peak hours
  const peakHours = Object.entries(hourCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  
  peakHours.forEach(([hourStr, count]) => {
    const hour = parseInt(hourStr);
    const hourRange = `${hour}:00 - ${hour + 1}:00`;
    const topEventType = Object.entries(hourEventTypes[hour] || {})
      .sort((a, b) => b[1] - a[1])[0];
    
    if (topEventType && count > 0) {
      insights.push({
        pattern: `${hourRange} Peak`,
        description: `Peak activity for ${topEventType[0]} between ${hourRange}`,
        frequency: topEventType[1],
        percentage: (topEventType[1] / interactions.length) * 100,
        examples: [`${topEventType[1]} ${topEventType[0]} enquiries during ${hourRange}`],
      });
    }
  });
  
  // Day + Hour combination
  const dayHourCounts: Record<string, Record<number, number>> = {};
  const dayHourEventTypes: Record<string, Record<number, Record<string, number>>> = {};
  
  interactions.forEach(interaction => {
    const date = interaction.timestamp instanceof Date 
      ? interaction.timestamp 
      : new Date(interaction.timestamp);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    const hour = date.getHours();
    
    if (!dayHourCounts[dayName]) {
      dayHourCounts[dayName] = {};
    }
    dayHourCounts[dayName][hour] = (dayHourCounts[dayName][hour] || 0) + 1;
    
    const lead = leads.find(l => 
      l.name.toLowerCase() === interaction.customer.name.toLowerCase()
    );
    const eventType = lead?.company || interaction.eventType || 'Unknown';
    
    if (!dayHourEventTypes[dayName]) {
      dayHourEventTypes[dayName] = {};
    }
    if (!dayHourEventTypes[dayName][hour]) {
      dayHourEventTypes[dayName][hour] = {};
    }
    dayHourEventTypes[dayName][hour][eventType] = 
      (dayHourEventTypes[dayName][hour][eventType] || 0) + 1;
  });
  
  // Find best day+hour combinations
  Object.entries(dayHourEventTypes).forEach(([day, hours]) => {
    Object.entries(hours).forEach(([hourStr, eventTypes]) => {
      const hour = parseInt(hourStr);
      const topEventType = Object.entries(eventTypes)
        .sort((a, b) => b[1] - a[1])[0];
      
      if (topEventType && topEventType[1] >= 2) {
        const hourRange = `${hour}:00 - ${hour + 1}:00`;
        insights.push({
          pattern: `${day} ${hourRange}`,
          description: `Most enquiries for ${topEventType[0]} come in on ${day}s between ${hourRange}`,
          frequency: topEventType[1],
          percentage: (topEventType[1] / interactions.length) * 100,
          examples: [`${topEventType[1]} ${topEventType[0]} enquiries on ${day}s ${hourRange}`],
        });
      }
    });
  });
  
  // Sort by frequency and return top insights
  return insights
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 5);
}

