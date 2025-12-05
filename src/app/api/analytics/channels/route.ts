import { NextResponse } from 'next/server';
import {
  fetchInteractions,
  fetchLeads,
  fetchBookings,
} from '@/lib/google-sheets';
import { calculateChannelPerformance } from '@/lib/analytics-service';

export async function GET() {
  try {
    const [interactions, leads, bookings] = await Promise.all([
      fetchInteractions(),
      fetchLeads(),
      fetchBookings(),
    ]);

    const channelPerformance = calculateChannelPerformance(
      interactions,
      leads,
      bookings
    );

    return NextResponse.json({ channelPerformance });
  } catch (error) {
    console.error('Error calculating channel performance:', error);
    return NextResponse.json(
      { error: 'Failed to calculate channel performance' },
      { status: 500 }
    );
  }
}

