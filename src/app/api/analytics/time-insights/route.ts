import { NextResponse } from 'next/server';
import {
  fetchInteractions,
  fetchLeads,
} from '@/lib/google-sheets';
import { calculateTimeInsights } from '@/lib/analytics-service';

export async function GET() {
  try {
    const [interactions, leads] = await Promise.all([
      fetchInteractions(),
      fetchLeads(),
    ]);

    const insights = calculateTimeInsights(interactions, leads);

    return NextResponse.json({ insights });
  } catch (error) {
    console.error('Error calculating time insights:', error);
    return NextResponse.json(
      { error: 'Failed to calculate time insights' },
      { status: 500 }
    );
  }
}

