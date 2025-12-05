# Funnel & Revenue Analytics Implementation

This document outlines the funnel analysis, revenue projections, channel performance, and time-based insights features implemented in the Arlington Estate AI Receptionist Dashboard.

## ✅ Completed Features

### 1. Lead → Booking Funnel

**Location**: Analytics Page

**Features**:
- Visual funnel showing conversion stages:
  - **New** → New leads
  - **Contacted** → Leads with interactions
  - **Qualified** → Qualified leads
  - **Booked** → Leads with bookings
  - **Completed** → Confirmed bookings

- Metrics per stage:
  - Count of leads/bookings
  - Percentage of original leads
  - Dropoff percentage from previous stage
  - Estimated revenue at each stage

- Summary metrics:
  - Overall conversion rate
  - Total pipeline value

**Implementation Files**:
- `src/lib/analytics-service.ts` - `calculateFunnel()` function
- `src/components/analytics/funnel-chart.tsx` - Visualization component
- `src/app/api/analytics/funnel/route.ts` - API endpoint

---

### 2. Revenue Projections

**Location**: Analytics Page

**Features**:
- Monthly revenue breakdown:
  - **Confirmed** revenue (bookings with 'Confirmed' status)
  - **Pending** revenue (bookings with 'Pending' status)
  - **Projected** revenue (all bookings)

- Revenue calculation:
  - Base price per event type
  - Per-person pricing
  - Total estimated value

- Event type pricing:
  - Wedding: $5,000 base + $150/person
  - Corporate: $3,000 base + $100/person
  - Birthday: $1,500 base + $75/person
  - Anniversary: $2,000 base + $100/person
  - Conference: $4,000 base + $120/person
  - Meeting: $500 base + $50/person
  - Other: $2,000 base + $80/person

- Visualizations:
  - Stacked bar chart by month
  - Summary cards with totals

**Implementation Files**:
- `src/lib/analytics-service.ts` - `calculateMonthlyRevenue()` and `calculateEstimatedRevenue()` functions
- `src/components/analytics/revenue-pipeline.tsx` - Visualization component
- `src/app/api/analytics/revenue/route.ts` - API endpoint

---

### 3. Channel Performance

**Location**: Analytics Page

**Features**:
- Comparison of three channels:
  - **Calls** (phone interactions)
  - **Chats** (chat interactions)
  - **Web Forms** (form submissions)

- Metrics per channel:
  - Total interactions
  - Converted leads (leads that became bookings)
  - Conversion rate percentage
  - Average revenue per conversion
  - Total revenue generated

- Visualizations:
  - Channel comparison cards
  - Conversion rate bar chart
  - "Best" channel badge highlighting

**Implementation Files**:
- `src/lib/analytics-service.ts` - `calculateChannelPerformance()` function
- `src/components/analytics/channel-performance.tsx` - Visualization component
- `src/app/api/analytics/channels/route.ts` - API endpoint

---

### 4. Time-Based Insights

**Location**: Analytics Page

**Features**:
- Pattern detection:
  - Day of week patterns (e.g., "Most enquiries on Sundays")
  - Hour of day patterns (e.g., "Peak activity 7-10pm")
  - Day + Hour combinations (e.g., "Sundays between 7-10pm")

- Event type correlation:
  - Which event types are most common on specific days/times
  - Frequency and percentage of total interactions

- Insights format:
  - Pattern name
  - Descriptive text
  - Frequency count
  - Percentage of total
  - Example occurrences

**Example Insights**:
- "Most enquiries for Weddings come in on Sundays between 7:00 - 8:00"
- "Peak activity for Corporate events between 9:00 - 10:00"
- "Sunday Activity: Most enquiries for Weddings come in on Sundays"

**Implementation Files**:
- `src/lib/analytics-service.ts` - `calculateTimeInsights()` function
- `src/components/analytics/time-insights.tsx` - Visualization component
- `src/app/api/analytics/time-insights/route.ts` - API endpoint

---

## Technical Architecture

### Analytics Service (`src/lib/analytics-service.ts`)

**Core Functions**:
- `calculateFunnel(leads, bookings, interactions)` - Calculate conversion funnel
- `calculateMonthlyRevenue(bookings)` - Calculate revenue by month
- `calculateEstimatedRevenue(eventType, headcount)` - Estimate revenue for event
- `calculateChannelPerformance(interactions, leads, bookings)` - Compare channels
- `calculateTimeInsights(interactions, leads)` - Detect time patterns

**Revenue Estimates**:
- Configurable pricing per event type
- Base price + per-person pricing model
- Default fallback for unknown event types

---

### API Endpoints

All analytics endpoints are located in `src/app/api/analytics/`:
- `/api/analytics/funnel` - GET - Returns funnel metrics
- `/api/analytics/revenue` - GET - Returns monthly revenue data
- `/api/analytics/channels` - GET - Returns channel performance
- `/api/analytics/time-insights` - GET - Returns time-based patterns

---

### Components

**Funnel Chart** (`src/components/analytics/funnel-chart.tsx`):
- Visual funnel with stage indicators
- Progress bars showing conversion percentages
- Dropoff indicators
- Revenue display per stage
- Summary metrics

**Revenue Pipeline** (`src/components/analytics/revenue-pipeline.tsx`):
- Stacked bar chart by month
- Summary cards (Confirmed, Pending, Projected)
- Responsive chart container

**Channel Performance** (`src/components/analytics/channel-performance.tsx`):
- Channel comparison cards
- Conversion rate bar chart
- Best channel highlighting
- Revenue metrics per channel

**Time Insights** (`src/components/analytics/time-insights.tsx`):
- Insight cards with patterns
- Frequency and percentage display
- Example occurrences
- Empty state handling

---

## Data Flow

1. **Data Collection**: Analytics service fetches from Google Sheets
2. **Processing**: Service functions calculate metrics
3. **API Layer**: Endpoints serve processed data
4. **Visualization**: Components render charts and metrics
5. **User Display**: Analytics page displays all insights

---

## Revenue Calculation Logic

### Event Type Pricing
```typescript
Wedding: $5,000 base + $150/person
Corporate: $3,000 base + $100/person
Birthday: $1,500 base + $75/person
Anniversary: $2,000 base + $100/person
Conference: $4,000 base + $120/person
Meeting: $500 base + $50/person
Other: $2,000 base + $80/person
```

### Example Calculation
- Event: Wedding
- Headcount: 100 guests
- Revenue: $5,000 + (100 × $150) = $20,000

---

## Funnel Calculation Logic

1. **New Leads**: All leads with status 'New'
2. **Contacted**: Leads with status 'Contacted' OR have interactions
3. **Qualified**: Leads with status 'Qualified'
4. **Booked**: Leads that have corresponding bookings
5. **Completed**: Bookings with status 'Confirmed'

Each stage calculates:
- Count
- Percentage of original leads
- Dropoff from previous stage
- Estimated revenue

---

## Channel Performance Logic

1. Count total interactions by channel
2. Identify converted leads (leads with bookings)
3. Match conversions to interaction channels
4. Calculate conversion rates
5. Calculate revenue per channel
6. Determine best performing channel

---

## Time-Based Insights Logic

1. **Day Analysis**: Group interactions by day of week
2. **Hour Analysis**: Group interactions by hour of day
3. **Event Type Correlation**: Match interactions to event types via leads
4. **Pattern Detection**: Find most common day+hour+event combinations
5. **Insight Generation**: Create descriptive insights with examples

---

## Usage Examples

### Viewing Funnel
1. Navigate to Analytics page
2. View "Lead → Booking Funnel" card
3. See conversion stages with metrics
4. Review dropoff percentages
5. Check pipeline value

### Analyzing Revenue
1. Navigate to Analytics page
2. View "Revenue Pipeline by Month" card
3. See monthly breakdown
4. Compare confirmed vs pending
5. Review projected totals

### Comparing Channels
1. Navigate to Analytics page
2. View "Channel Performance" card
3. Compare conversion rates
4. See revenue per channel
5. Identify best performing channel

### Understanding Time Patterns
1. Navigate to Analytics page
2. View "Time-Based Insights" card
3. Read pattern descriptions
4. See frequency and percentages
5. Review example occurrences

---

## Future Enhancements

Potential improvements:
- Custom revenue estimates per event type
- Historical funnel trends
- Channel attribution modeling
- Predictive revenue forecasting
- Time-based recommendations
- Export analytics reports
- Scheduled analytics emails
- Custom date ranges
- Event type performance analysis
- Lead source tracking

---

## Notes

- Revenue estimates are based on event type and headcount
- Funnel stages are calculated from lead status and booking data
- Channel performance requires matching interactions to bookings
- Time insights require sufficient interaction data
- All calculations are real-time based on current data
- Revenue is estimated, not actual (unless integrated with payment system)


