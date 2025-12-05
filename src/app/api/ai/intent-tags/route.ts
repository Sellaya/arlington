import { NextRequest, NextResponse } from 'next/server';
import { generateIntentTags } from '@/lib/ai-service';
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
    const { interaction, eventType, eventDescription } = body;

    if (!interaction) {
      return NextResponse.json(
        { error: 'Interaction is required' },
        { status: 400 }
      );
    }

    const tags = await generateIntentTags(
      interaction as Interaction,
      eventType,
      eventDescription
    );

    return NextResponse.json(tags);
  } catch (error) {
    console.error('Error generating intent tags:', error);
    return NextResponse.json(
      { error: 'Failed to generate intent tags' },
      { status: 500 }
    );
  }
}

