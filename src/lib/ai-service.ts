/**
 * AI Service Module
 * Provides AI-powered features using Google Gemini via Genkit
 */

import { generate } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import type { Interaction, Lead } from './types';

// Initialize the model - using the configured AI instance
// For server-side usage, we'll use a direct model call
const getModel = () => {
  try {
    return googleAI('gemini-2.5-flash');
  } catch (error) {
    console.error('Error initializing AI model:', error);
    return null;
  }
};

// AI-generated lead quality score (0-100)
export interface LeadQualityScore {
  score: number;
  reasoning: string;
  factors: {
    eventType: string;
    headcount?: number;
    sentiment: 'positive' | 'neutral' | 'negative';
    keywords: string[];
  };
}

// AI intent and topic tags
export interface IntentTags {
  primaryIntent: string;
  topics: string[];
  urgency: 'high' | 'medium' | 'low';
  confidence: number;
}

// Next-best-action suggestion
export interface NextBestAction {
  action: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  suggestedTemplate?: string;
}

// Follow-up draft
export interface FollowUpDraft {
  type: 'email' | 'sms';
  subject?: string;
  message: string;
  suggestedTiming: string;
}

// Manager digest summary
export interface ManagerDigest {
  summary: string;
  highlights: string[];
  metrics: {
    totalInteractions: number;
    hotLeads: number;
    atRisk: number;
    cancellations: number;
    avgQualityScore: number;
  };
  recommendations: string[];
}

// Interaction timeline summary
export interface TimelineSummary {
  synopsis: string;
  touchpoints: number;
  likelihoodToBook: 'high' | 'medium' | 'low';
  estimatedTimeframe?: string;
  keyInsights: string[];
}

/**
 * Generate lead quality score based on event type, headcount, sentiment, and keywords
 */
export async function generateLeadQualityScore(
  interaction: Interaction,
  eventType: string,
  headcount?: number,
  eventDescription?: string
): Promise<LeadQualityScore> {
  try {
    const prompt = `Analyze this lead and provide a quality score (0-100) based on the following criteria:
- Event Type: ${eventType || 'Not specified'}
- Headcount: ${headcount || 'Not specified'}
- Event Description: ${eventDescription || 'None'}
- Call Summary/Transcript: ${interaction.transcript || 'No transcript available'}
- Customer: ${interaction.customer.name}
- Contact: ${interaction.contact}

Consider:
1. Event type value (weddings typically higher value than small meetings)
2. Headcount size (larger events = higher value)
3. Sentiment in the conversation (positive, neutral, negative)
4. Keywords indicating urgency, budget, decision-making authority
5. Level of engagement and interest

Respond in JSON format:
{
  "score": <number 0-100>,
  "reasoning": "<brief explanation>",
  "factors": {
    "eventType": "<event type>",
    "headcount": <number or null>,
    "sentiment": "<positive|neutral|negative>",
    "keywords": ["<keyword1>", "<keyword2>"]
  }
}`;

    const model = getModel();
    if (!model) {
      throw new Error('AI model not available');
    }

    const response = await generate({
      model: model,
      prompt: prompt,
    });

    const text = response.text();
    // Try to parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        score: Math.min(100, Math.max(0, parsed.score || 50)),
        reasoning: parsed.reasoning || 'Analysis completed',
        factors: {
          eventType: parsed.factors?.eventType || eventType,
          headcount: parsed.factors?.headcount || headcount,
          sentiment: parsed.factors?.sentiment || 'neutral',
          keywords: parsed.factors?.keywords || [],
        },
      };
    }

    // Fallback if JSON parsing fails
    return {
      score: 50,
      reasoning: 'Unable to parse AI response',
      factors: {
        eventType: eventType || 'Unknown',
        headcount: headcount,
        sentiment: 'neutral',
        keywords: [],
      },
    };
  } catch (error) {
    console.error('Error generating lead quality score:', error);
    // Return default score on error
    return {
      score: 50,
      reasoning: 'Error analyzing lead',
      factors: {
        eventType: eventType || 'Unknown',
        headcount: headcount,
        sentiment: 'neutral',
        keywords: [],
      },
    };
  }
}

/**
 * Generate intent and topic tags for an interaction
 */
export async function generateIntentTags(
  interaction: Interaction,
  eventType?: string,
  eventDescription?: string
): Promise<IntentTags> {
  try {
    const prompt = `Analyze this customer interaction and identify:
1. Primary intent (e.g., "Wedding enquiry", "Corporate event", "Price negotiation", "Availability check")
2. Key topics discussed
3. Urgency level (high, medium, low)
4. Confidence level (0-100)

Interaction details:
- Customer: ${interaction.customer.name}
- Channel: ${interaction.channel}
- Transcript: ${interaction.transcript || 'No transcript'}
- Event Type: ${eventType || 'Not specified'}
- Event Description: ${eventDescription || 'None'}

Respond in JSON format:
{
  "primaryIntent": "<primary intent>",
  "topics": ["<topic1>", "<topic2>"],
  "urgency": "<high|medium|low>",
  "confidence": <number 0-100>
}`;

    const model = getModel();
    if (!model) {
      throw new Error('AI model not available');
    }

    const response = await generate({
      model: model,
      prompt: prompt,
    });

    const text = response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        primaryIntent: parsed.primaryIntent || 'General enquiry',
        topics: parsed.topics || [],
        urgency: parsed.urgency || 'medium',
        confidence: Math.min(100, Math.max(0, parsed.confidence || 50)),
      };
    }

    return {
      primaryIntent: 'General enquiry',
      topics: eventType ? [eventType] : [],
      urgency: 'medium',
      confidence: 50,
    };
  } catch (error) {
    console.error('Error generating intent tags:', error);
    return {
      primaryIntent: 'General enquiry',
      topics: eventType ? [eventType] : [],
      urgency: 'medium',
      confidence: 50,
    };
  }
}

/**
 * Generate next-best-action suggestion
 */
export async function generateNextBestAction(
  interaction: Interaction,
  lead: Lead | null,
  eventType?: string,
  headcount?: number
): Promise<NextBestAction> {
  try {
    const prompt = `Based on this customer interaction, suggest the next best action to take.

Interaction:
- Customer: ${interaction.customer.name}
- Contact: ${interaction.contact}
- Transcript: ${interaction.transcript || 'No transcript'}
- Event Type: ${eventType || 'Not specified'}
- Headcount: ${headcount || 'Not specified'}
- Lead Status: ${lead?.status || 'New'}

Provide a specific, actionable recommendation. Examples:
- "Send pricing PDF for weddings (80-120 guests)"
- "Follow up with call – mentioned urgent dates"
- "Schedule venue tour – high interest expressed"
- "Send contract template – ready to book"

Respond in JSON format:
{
  "action": "<specific action>",
  "reason": "<why this action>",
  "priority": "<high|medium|low>",
  "suggestedTemplate": "<optional template name>"
}`;

    const model = getModel();
    if (!model) {
      throw new Error('AI model not available');
    }

    const response = await generate({
      model: model,
      prompt: prompt,
    });

    const text = response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        action: parsed.action || 'Follow up with customer',
        reason: parsed.reason || 'Continue engagement',
        priority: parsed.priority || 'medium',
        suggestedTemplate: parsed.suggestedTemplate,
      };
    }

    return {
      action: 'Follow up with customer',
      reason: 'Continue engagement',
      priority: 'medium',
    };
  } catch (error) {
    console.error('Error generating next best action:', error);
    return {
      action: 'Follow up with customer',
      reason: 'Continue engagement',
      priority: 'medium',
    };
  }
}

/**
 * Generate follow-up email or SMS draft
 */
export async function generateFollowUpDraft(
  interaction: Interaction,
  lead: Lead | null,
  type: 'email' | 'sms',
  nextAction?: NextBestAction
): Promise<FollowUpDraft> {
  try {
    const prompt = `Generate a ${type.toUpperCase()} follow-up message for this customer interaction.

Customer: ${interaction.customer.name}
Contact: ${interaction.contact}
Previous Interaction: ${interaction.transcript || 'No transcript'}
Event Type: ${lead?.company || 'Not specified'}
Next Action: ${nextAction?.action || 'General follow-up'}

Requirements:
- Professional and friendly tone
- Reference the previous conversation
- Include relevant next steps
- Keep ${type === 'sms' ? 'SMS messages under 160 characters' : 'email concise but complete'}

${type === 'email' ? 'Include a subject line.' : ''}

Respond in JSON format:
{
  ${type === 'email' ? '"subject": "<email subject>",' : ''}
  "message": "<message content>",
  "suggestedTiming": "<when to send: immediate|within 1 hour|within 24 hours|next business day>"
}`;

    const model = getModel();
    if (!model) {
      throw new Error('AI model not available');
    }

    const response = await generate({
      model: model,
      prompt: prompt,
    });

    const text = response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        type,
        subject: parsed.subject,
        message: parsed.message || 'Thank you for your interest. We look forward to speaking with you soon.',
        suggestedTiming: parsed.suggestedTiming || 'within 24 hours',
      };
    }

    return {
      type,
      subject: type === 'email' ? 'Follow-up from Arlington Estate' : undefined,
      message: 'Thank you for your interest. We look forward to speaking with you soon.',
      suggestedTiming: 'within 24 hours',
    };
  } catch (error) {
    console.error('Error generating follow-up draft:', error);
    return {
      type,
      subject: type === 'email' ? 'Follow-up from Arlington Estate' : undefined,
      message: 'Thank you for your interest. We look forward to speaking with you soon.',
      suggestedTiming: 'within 24 hours',
    };
  }
}

/**
 * Generate manager digest for end-of-day summary
 */
export async function generateManagerDigest(
  interactions: Interaction[],
  leads: Lead[],
  bookings: any[]
): Promise<ManagerDigest> {
  try {
    const todayInteractions = interactions.filter(i => {
      const today = new Date();
      const interactionDate = i.timestamp instanceof Date ? i.timestamp : new Date(i.timestamp);
      return interactionDate.toDateString() === today.toDateString();
    });

    const prompt = `Generate an end-of-day manager digest summary.

Today's Activity:
- Total Interactions: ${todayInteractions.length}
- Total Leads: ${leads.length}
- Total Bookings: ${bookings.length}

Recent Interactions Summary:
${todayInteractions.slice(0, 10).map(i => `- ${i.customer.name}: ${i.transcript?.substring(0, 100) || 'No transcript'}`).join('\n')}

Lead Statuses:
${leads.map(l => `- ${l.name}: ${l.status}`).join('\n')}

Provide:
1. A concise summary paragraph
2. Key highlights (hot leads, at-risk leads, cancellations, etc.)
3. Metrics summary
4. Actionable recommendations

Respond in JSON format:
{
  "summary": "<paragraph summary>",
  "highlights": ["<highlight1>", "<highlight2>"],
  "metrics": {
    "totalInteractions": <number>,
    "hotLeads": <number>,
    "atRisk": <number>,
    "cancellations": <number>,
    "avgQualityScore": <number>
  },
  "recommendations": ["<recommendation1>", "<recommendation2>"]
}`;

    const model = getModel();
    if (!model) {
      throw new Error('AI model not available');
    }

    const response = await generate({
      model: model,
      prompt: prompt,
    });

    const text = response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        summary: parsed.summary || 'Daily activity summary',
        highlights: parsed.highlights || [],
        metrics: {
          totalInteractions: todayInteractions.length,
          hotLeads: parsed.metrics?.hotLeads || 0,
          atRisk: parsed.metrics?.atRisk || 0,
          cancellations: parsed.metrics?.cancellations || 0,
          avgQualityScore: parsed.metrics?.avgQualityScore || 0,
        },
        recommendations: parsed.recommendations || [],
      };
    }

    return {
      summary: `You had ${todayInteractions.length} interactions today.`,
      highlights: [],
      metrics: {
        totalInteractions: todayInteractions.length,
        hotLeads: 0,
        atRisk: 0,
        cancellations: 0,
        avgQualityScore: 0,
      },
      recommendations: [],
    };
  } catch (error) {
    console.error('Error generating manager digest:', error);
    return {
      summary: 'Unable to generate digest',
      highlights: [],
      metrics: {
        totalInteractions: 0,
        hotLeads: 0,
        atRisk: 0,
        cancellations: 0,
        avgQualityScore: 0,
      },
      recommendations: [],
    };
  }
}

/**
 * Generate interaction timeline summary for a lead
 */
export async function generateTimelineSummary(
  lead: Lead,
  interactions: Interaction[]
): Promise<TimelineSummary> {
  try {
    const leadInteractions = interactions.filter(
      i => i.customer.name.toLowerCase() === lead.name.toLowerCase()
    );

    const prompt = `Analyze the interaction timeline for this lead and provide insights.

Lead: ${lead.name}
Company/Event: ${lead.company}
Status: ${lead.status}
Last Interaction: ${lead.lastInteraction}

Interaction History (${leadInteractions.length} touchpoints):
${leadInteractions.map((i, idx) => `${idx + 1}. ${i.timestamp}: ${i.transcript?.substring(0, 150) || 'No transcript'}`).join('\n')}

Provide:
1. A synopsis of the lead's journey
2. Likelihood to book (high, medium, low)
3. Estimated timeframe if likely to book
4. Key insights from the interactions

Respond in JSON format:
{
  "synopsis": "<paragraph synopsis>",
  "touchpoints": <number>,
  "likelihoodToBook": "<high|medium|low>",
  "estimatedTimeframe": "<timeframe or null>",
  "keyInsights": ["<insight1>", "<insight2>"]
}`;

    const model = getModel();
    if (!model) {
      throw new Error('AI model not available');
    }

    const response = await generate({
      model: model,
      prompt: prompt,
    });

    const text = response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        synopsis: parsed.synopsis || `Over ${leadInteractions.length} touchpoints, this lead has shown interest.`,
        touchpoints: leadInteractions.length,
        likelihoodToBook: parsed.likelihoodToBook || 'medium',
        estimatedTimeframe: parsed.estimatedTimeframe,
        keyInsights: parsed.keyInsights || [],
      };
    }

    return {
      synopsis: `Over ${leadInteractions.length} touchpoints, this lead has shown interest.`,
      touchpoints: leadInteractions.length,
      likelihoodToBook: 'medium',
      keyInsights: [],
    };
  } catch (error) {
    console.error('Error generating timeline summary:', error);
    return {
      synopsis: 'Unable to generate summary',
      touchpoints: 0,
      likelihoodToBook: 'medium',
      keyInsights: [],
    };
  }
}

