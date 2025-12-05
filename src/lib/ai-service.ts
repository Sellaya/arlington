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

    let response;
    try {
      response = await generate({
        model: model,
        prompt: prompt,
      });
    } catch (genError) {
      console.error('Error calling AI generate:', genError);
      throw new Error('Failed to generate AI response');
    }

    let text;
    try {
      text = response.text();
    } catch (textError) {
      console.error('Error getting response text:', textError);
      throw new Error('Failed to get AI response text');
    }
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

    let response;
    try {
      response = await generate({
        model: model,
        prompt: prompt,
      });
    } catch (genError) {
      console.error('Error calling AI generate:', genError);
      throw new Error('Failed to generate AI response');
    }

    let text;
    try {
      text = response.text();
    } catch (textError) {
      console.error('Error getting response text:', textError);
      throw new Error('Failed to get AI response text');
    }
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

    let response;
    try {
      response = await generate({
        model: model,
        prompt: prompt,
      });
    } catch (genError) {
      console.error('Error calling AI generate:', genError);
      throw new Error('Failed to generate AI response');
    }

    let text;
    try {
      text = response.text();
    } catch (textError) {
      console.error('Error getting response text:', textError);
      throw new Error('Failed to get AI response text');
    }
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

    let response;
    try {
      response = await generate({
        model: model,
        prompt: prompt,
      });
    } catch (genError) {
      console.error('Error calling AI generate:', genError);
      throw new Error('Failed to generate AI response');
    }

    let text;
    try {
      text = response.text();
    } catch (textError) {
      console.error('Error getting response text:', textError);
      throw new Error('Failed to get AI response text');
    }
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

// Generate fallback digest without AI
function generateFallbackDigest(
  interactions: Interaction[],
  leads: Lead[],
  bookings: any[],
  todayInteractions: Interaction[]
): ManagerDigest {
  // Calculate metrics from data
  const newLeads = leads.filter(l => l.status === 'New').length;
  const qualifiedLeads = leads.filter(l => l.status === 'Qualified').length;
  const hotLeads = qualifiedLeads + newLeads;
  const atRiskLeads = leads.filter(l => l.status === 'Contacted' && l.status !== 'Qualified').length;
  const cancellations = bookings.filter(b => b.status === 'Cancelled').length;
  
  // Calculate average quality score if available
  const leadsWithScores = leads.filter(l => l.qualityScore);
  const avgQualityScore = leadsWithScores.length > 0
    ? Math.round(leadsWithScores.reduce((sum, l) => sum + (l.qualityScore?.score || 0), 0) / leadsWithScores.length)
    : 0;

  const summary = `Today's activity summary: ${todayInteractions.length} interactions, ${leads.length} leads, and ${bookings.length} bookings. ${hotLeads} hot leads identified, ${atRiskLeads} leads at risk, and ${cancellations} cancellations.`;

  const highlights: string[] = [];
  if (hotLeads > 0) {
    highlights.push(`${hotLeads} hot leads requiring immediate attention`);
  }
  if (atRiskLeads > 0) {
    highlights.push(`${atRiskLeads} leads at risk of being lost`);
  }
  if (cancellations > 0) {
    highlights.push(`${cancellations} booking cancellation${cancellations > 1 ? 's' : ''} today`);
  }
  if (newLeads > 0) {
    highlights.push(`${newLeads} new lead${newLeads > 1 ? 's' : ''} added today`);
  }
  if (highlights.length === 0) {
    highlights.push('No significant activity to report');
  }

  const recommendations: string[] = [];
  if (newLeads > 0) {
    recommendations.push(`Follow up with ${newLeads} new lead${newLeads > 1 ? 's' : ''} within 24 hours`);
  }
  if (atRiskLeads > 0) {
    recommendations.push(`Re-engage ${atRiskLeads} at-risk lead${atRiskLeads > 1 ? 's' : ''} to prevent churn`);
  }
  if (qualifiedLeads > 0) {
    recommendations.push(`Convert ${qualifiedLeads} qualified lead${qualifiedLeads > 1 ? 's' : ''} to bookings`);
  }
  if (recommendations.length === 0) {
    recommendations.push('Continue monitoring leads and interactions');
  }

  return {
    summary,
    highlights,
    metrics: {
      totalInteractions: todayInteractions.length,
      hotLeads,
      atRisk: atRiskLeads,
      cancellations,
      avgQualityScore,
    },
    recommendations,
  };
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
    // Safely filter today's interactions
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayInteractions = interactions.filter(i => {
      try {
        if (!i || !i.timestamp) return false;
        const interactionDate = i.timestamp instanceof Date 
          ? i.timestamp 
          : new Date(i.timestamp);
        if (isNaN(interactionDate.getTime())) return false;
        interactionDate.setHours(0, 0, 0, 0);
        return interactionDate.getTime() === today.getTime();
      } catch {
        return false;
      }
    });

    const prompt = `Generate an end-of-day manager digest summary.

Today's Activity:
- Total Interactions: ${todayInteractions.length}
- Total Leads: ${leads.length}
- Total Bookings: ${bookings.length}

Recent Interactions Summary:
${todayInteractions.slice(0, 10).map(i => {
  const name = i?.customer?.name || 'Unknown';
  const transcript = i?.transcript?.substring(0, 100) || 'No transcript';
  return `- ${name}: ${transcript}`;
}).join('\n')}

Lead Statuses:
${leads.slice(0, 50).map(l => {
  const name = l?.name || 'Unknown';
  const status = l?.status || 'Unknown';
  return `- ${name}: ${status}`;
}).join('\n')}

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
      // Return fallback digest when AI model is not available
      return generateFallbackDigest(interactions, leads, bookings, todayInteractions);
    }

    let response;
    try {
      response = await generate({
        model: model,
        prompt: prompt,
      });
    } catch (genError) {
      console.error('Error calling AI generate:', genError);
      // Return fallback digest instead of throwing
      return generateFallbackDigest(interactions, leads, bookings, todayInteractions);
    }

    let text;
    try {
      text = response.text();
    } catch (textError) {
      console.error('Error getting response text:', textError);
      // Return fallback digest instead of throwing
      return generateFallbackDigest(interactions, leads, bookings, todayInteractions);
    }
    
    let parsed;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.error('Error parsing AI response JSON:', parseError);
      // Fall through to fallback response
    }
    
    if (parsed) {
      return {
        summary: parsed.summary || 'Daily activity summary',
        highlights: Array.isArray(parsed.highlights) ? parsed.highlights : [],
        metrics: {
          totalInteractions: todayInteractions.length,
          hotLeads: typeof parsed.metrics?.hotLeads === 'number' ? parsed.metrics.hotLeads : 0,
          atRisk: typeof parsed.metrics?.atRisk === 'number' ? parsed.metrics.atRisk : 0,
          cancellations: typeof parsed.metrics?.cancellations === 'number' ? parsed.metrics.cancellations : 0,
          avgQualityScore: typeof parsed.metrics?.avgQualityScore === 'number' ? parsed.metrics.avgQualityScore : 0,
        },
        recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
      };
    }

    // Return fallback digest if AI response couldn't be parsed
    return generateFallbackDigest(interactions, leads, bookings, todayInteractions);
  } catch (error) {
    console.error('Error generating manager digest:', error);
    // Return fallback digest on any error
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayInteractions = interactions.filter(i => {
      try {
        if (!i || !i.timestamp) return false;
        const interactionDate = i.timestamp instanceof Date 
          ? i.timestamp 
          : new Date(i.timestamp);
        if (isNaN(interactionDate.getTime())) return false;
        interactionDate.setHours(0, 0, 0, 0);
        return interactionDate.getTime() === today.getTime();
      } catch {
        return false;
      }
    });
    return generateFallbackDigest(interactions, leads, bookings, todayInteractions);
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

    let response;
    try {
      response = await generate({
        model: model,
        prompt: prompt,
      });
    } catch (genError) {
      console.error('Error calling AI generate:', genError);
      throw new Error('Failed to generate AI response');
    }

    let text;
    try {
      text = response.text();
    } catch (textError) {
      console.error('Error getting response text:', textError);
      throw new Error('Failed to get AI response text');
    }
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

