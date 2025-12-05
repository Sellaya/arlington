import { NextRequest, NextResponse } from 'next/server';
import { generateFollowUpDraft } from '@/lib/ai-service';
import type { Interaction, Lead, NextBestAction } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
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

