import { NextResponse } from 'next/server';
import {
  fetchInteractions,
  fetchLeads,
  fetchBookings,
} from '@/lib/google-sheets';
import { calculateFunnel } from '@/lib/analytics-service';

export async function GET() {
  try {
    const [interactions, leads, bookings] = await Promise.all([
      fetchInteractions(),
      fetchLeads(),
      fetchBookings(),
    ]);

    const funnel = calculateFunnel(leads, bookings, interactions);

    return NextResponse.json({ funnel });
  } catch (error) {
    console.error('Error calculating funnel:', error);
    return NextResponse.json(
      { error: 'Failed to calculate funnel' },
      { status: 500 }
    );
  }
}


