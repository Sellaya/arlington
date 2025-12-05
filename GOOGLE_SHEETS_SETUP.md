# Google Sheets Integration Setup

This guide explains how to connect your app to Google Sheets for data management.

## Option 1: Published Google Sheet (Simplest - No Authentication)

### Step 1: Create Your Google Sheet

Create a Google Sheet with the following tabs:

#### Tab 1: "Interactions"
Columns: `id, customer_name, avatar_url, contact, timestamp, status, channel, transcript, tags`

Example:
```
id | customer_name | avatar_url | contact | timestamp | status | channel | transcript | tags
1 | Alice Johnson | https://... | alice@example.com | 2024-07-29T10:30:00 | Completed | Chat | Full transcript... | Sales Inquiry, New Lead
```

#### Tab 2: "Leads"
Columns: `id, name, company, contact, status, lastInteraction`

#### Tab 3: "Contacts"
Columns: `id, name, company, contact, lastInteraction`

#### Tab 4: "Bookings"
Columns: `id, customer, service, staff, dateTime, status`

#### Tab 5: "Analytics_Volume"
Columns: `name, calls, chats`

#### Tab 6: "Analytics_Conversion"
Columns: `date, rate`

### Step 2: Publish Your Sheet

1. Open your Google Sheet
2. Go to **File → Share → Publish to web**
3. Choose **"Entire document"** or specific sheets
4. Select **"CSV"** format
5. Click **"Publish"**
6. Copy the Sheet ID from the URL:
   - URL format: `https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit`
   - Copy the `SHEET_ID_HERE` part

### Step 3: Configure Environment Variable

Create or update `.env.local`:

```env
NEXT_PUBLIC_GOOGLE_SHEET_ID=your_sheet_id_here
```

### Step 4: Use in Your App

#### Option A: Server Components (Recommended)

Update your pages to fetch data:

```typescript
// src/app/(dashboard)/page.tsx
import { fetchInteractions } from '@/lib/google-sheets';

export default async function DashboardPage() {
  const interactions = await fetchInteractions();
  
  return (
    // Your component JSX
  );
}
```

#### Option B: Client Components with API Route

Use the API route at `/api/data`:

```typescript
'use client';
import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const [interactions, setInteractions] = useState([]);
  
  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(data => setInteractions(data.interactions));
  }, []);
  
  // Your component JSX
}
```

## Option 2: Google Sheets API (More Control - Requires Authentication)

For private sheets or write access, use the official Google Sheets API.

### Installation

```bash
npm install googleapis
```

### Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google Sheets API
4. Create credentials (Service Account)
5. Download JSON key file
6. Share your sheet with the service account email

### Example Implementation

```typescript
import { google } from 'googleapis';

const auth = new google.auth.GoogleAuth({
  keyFile: 'path/to/service-account-key.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
});

const sheets = google.sheets({ version: 'v4', auth });

export async function fetchInteractions() {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: 'Interactions!A2:H', // Skip header row
  });
  
  return response.data.values?.map((row, index) => ({
    id: row[0],
    customer: { name: row[1], avatar: row[2] },
    // ... map other fields
  })) || [];
}
```

## Troubleshooting

### Sheet Not Found
- Verify the Sheet ID is correct
- Ensure the sheet is published to web (for Option 1)
- Check that the sheet is shared with the service account (for Option 2)

### Data Not Updating
- The published sheet URL caches data for ~60 seconds
- For real-time updates, use the Google Sheets API

### CORS Issues
- Published sheets should work without CORS issues
- If using API, ensure credentials are server-side only

## Notes

- Published sheets are **public** - don't use for sensitive data
- For production, use the Google Sheets API with proper authentication
- Consider caching data to reduce API calls
- Update the CSV parser in `google-sheets.ts` if your data format differs


