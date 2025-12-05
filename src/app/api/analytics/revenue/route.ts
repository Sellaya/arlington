import { NextResponse } from 'next/server';
import { fetchBookings } from '@/lib/google-sheets';
import { calculateMonthlyRevenue } from '@/lib/analytics-service';

export async function GET() {
  try {
    const bookings = await fetchBookings();
    const monthlyRevenue = calculateMonthlyRevenue(bookings);

    return NextResponse.json({ monthlyRevenue });
  } catch (error) {
    console.error('Error calculating revenue:', error);
    return NextResponse.json(
      { error: 'Failed to calculate revenue' },
      { status: 500 }
    );
  }
}


