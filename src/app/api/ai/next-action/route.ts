import { NextRequest, NextResponse } from 'next/server';
import { generateNextBestAction } from '@/lib/ai-service';
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
    const { interaction, lead, eventType, headcount } = body;

    if (!interaction) {
      return NextResponse.json(
        { error: 'Interaction is required' },
        { status: 400 }
      );
    }

    const action = await generateNextBestAction(
      interaction as Interaction,
      lead as Lead | null,
      eventType,
      headcount
    );

    return NextResponse.json(action);
  } catch (error) {
    console.error('Error generating next action:', error);
    return NextResponse.json(
      { error: 'Failed to generate next action' },
      { status: 500 }
    );
  }
}

