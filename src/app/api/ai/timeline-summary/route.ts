import { NextRequest, NextResponse } from 'next/server';
import { generateTimelineSummary } from '@/lib/ai-service';
import type { Lead, Interaction } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { lead, interactions } = body;

    if (!lead || !interactions) {
      return NextResponse.json(
        { error: 'Lead and interactions are required' },
        { status: 400 }
      );
    }

    const summary = await generateTimelineSummary(
      lead as Lead,
      interactions as Interaction[]
    );

    return NextResponse.json(summary);
  } catch (error) {
    console.error('Error generating timeline summary:', error);
    return NextResponse.json(
      { error: 'Failed to generate timeline summary' },
      { status: 500 }
    );
  }
}

