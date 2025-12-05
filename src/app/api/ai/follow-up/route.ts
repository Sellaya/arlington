import { NextRequest, NextResponse } from 'next/server';
import { generateFollowUpDraft } from '@/lib/ai-service';
import type { Interaction, Lead, NextBestAction } from '@/lib/types';

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
    const { interaction, lead, type, nextAction } = body;

    if (!interaction || !type) {
      return NextResponse.json(
        { error: 'Interaction and type (email/sms) are required' },
        { status: 400 }
      );
    }

    const draft = await generateFollowUpDraft(
      interaction as Interaction,
      lead as Lead | null,
      type as 'email' | 'sms',
      nextAction as NextBestAction | undefined
    );

    return NextResponse.json(draft);
  } catch (error) {
    console.error('Error generating follow-up draft:', error);
    return NextResponse.json(
      { error: 'Failed to generate follow-up draft' },
      { status: 500 }
    );
  }
}

