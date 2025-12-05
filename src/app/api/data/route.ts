import { NextResponse } from 'next/server';
import {
  fetchInteractions,
  fetchLeads,
  fetchContacts,
  fetchBookings,
  fetchAnalyticsData,
} from '@/lib/google-sheets';

// API route to fetch all data from Google Sheets
export async function GET() {
  try {
    const [interactions, leads, contacts, bookings, analytics] = await Promise.all([
      fetchInteractions(),
      fetchLeads(),
      fetchContacts(),
      fetchBookings(),
      fetchAnalyticsData(),
    ]);

    return NextResponse.json({
      interactions,
      leads,
      contacts,
      bookings,
      analytics,
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data from Google Sheets' },
      { status: 500 }
    );
  }
}




