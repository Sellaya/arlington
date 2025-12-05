import { NextRequest, NextResponse } from 'next/server';
import { generateManagerDigest } from '@/lib/ai-service';
import type { Interaction, Lead } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }
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

