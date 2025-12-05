import { NextRequest, NextResponse } from 'next/server';
import { generateManagerDigest } from '@/lib/ai-service';
import type { Interaction, Lead } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { interactions, leads, bookings } = body;

    if (!interactions || !leads || !bookings) {
      return NextResponse.json(
        { error: 'Interactions, leads, and bookings are required' },
        { status: 400 }
      );
    }

    const digest = await generateManagerDigest(
      interactions as Interaction[],
      leads as Lead[],
      bookings
    );

    return NextResponse.json(digest);
  } catch (error) {
    console.error('Error generating manager digest:', error);
    return NextResponse.json(
      { error: 'Failed to generate manager digest' },
      { status: 500 }
    );
  }
}

