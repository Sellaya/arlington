import { NextRequest, NextResponse } from 'next/server';
import { generateLeadQualityScore } from '@/lib/ai-service';
import type { Interaction } from '@/lib/types';

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
    const { interaction, eventType, headcount, eventDescription } = body;

    if (!interaction) {
      return NextResponse.json(
        { error: 'Interaction is required' },
        { status: 400 }
      );
    }

    const score = await generateLeadQualityScore(
      interaction as Interaction,
      eventType || '',
      headcount,
      eventDescription
    );

    return NextResponse.json(score);
  } catch (error) {
    console.error('Error generating lead score:', error);
    return NextResponse.json(
      { error: 'Failed to generate lead score' },
      { status: 500 }
    );
  }
}

