export type Interaction = {
  id: string;
  customer: {
    name: string;
    avatar: string;
  };
  contact: string;
  timestamp: Date;
  status: 'Completed' | 'Missed' | 'In Progress';
  channel: 'Call' | 'Chat';
  transcript: string;
  tags: string[];
  // AI-generated fields
  intentTags?: {
    primaryIntent: string;
    topics: string[];
    urgency: 'high' | 'medium' | 'low';
    confidence: number;
  };
  nextBestAction?: {
    action: string;
    reason: string;
    priority: 'high' | 'medium' | 'low';
    suggestedTemplate?: string;
  };
  // Additional context from Google Sheets
  eventType?: string;
  eventDescription?: string;
  headcount?: number;
};

export type Lead = {
  id: string;
  name: string;
  company: string;
  contact: string;
  status: 'New' | 'Contacted' | 'Qualified' | 'Lost';
  lastInteraction: Date;
  // AI-generated fields
  qualityScore?: {
    score: number;
    reasoning: string;
    factors: {
      eventType: string;
      headcount?: number;
      sentiment: 'positive' | 'neutral' | 'negative';
      keywords: string[];
    };
  };
  timelineSummary?: {
    synopsis: string;
    touchpoints: number;
    likelihoodToBook: 'high' | 'medium' | 'low';
    estimatedTimeframe?: string;
    keyInsights: string[];
  };
};

export type Contact = {
  id: string;
  name: string;
  company: string;
  contact: string;
  lastInteraction: Date;
};


export type Booking = {
  id: string;
  customer: string;
  service: string;
  staff: string;
  dateTime: Date;
  status: 'Confirmed' | 'Pending' | 'Cancelled';
};
