import type { Interaction, Lead, Contact, Booking } from './types';

/**
 * Fetch data from Arlington Estate Google Sheet
 * Sheet ID: 1mitXbIgnRfoWovu2eS5VUZcGnFjbvCFJU2pt36Ib9vM
 * 
 * Sheet Structure:
 * - Column A: Name
 * - Column B: Email
 * - Column C: Phone
 * - Column D: Event Type
 * - Column E: Event Description
 * - Column F: Head Count
 * - Column G: Call_ID
 * - Column H: Call Recordings (URL)
 * - Column I: Call Summary
 * - Column K: Serial
 */

const SHEET_ID = process.env.NEXT_PUBLIC_GOOGLE_SHEET_ID || '1mitXbIgnRfoWovu2eS5VUZcGnFjbvCFJU2pt36Ib9vM';

// Helper to convert CSV text to JSON
function csvToJson(csvText: string): string[][] {
  const lines = csvText.split('\n').filter(line => line.trim());
  return lines.map(line => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  });
}

// Fetch data from a specific sheet tab
async function fetchSheetData(sheetName: string): Promise<string[][]> {
  if (!SHEET_ID) {
    throw new Error('NEXT_PUBLIC_GOOGLE_SHEET_ID is not set');
  }

  // Google Sheets CSV export URL
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${sheetName}`;
  
  try {
    const response = await fetch(url, { next: { revalidate: 60 } }); // Cache for 60 seconds
    if (!response.ok) {
      throw new Error(`Failed to fetch sheet: ${response.statusText}`);
    }
    const csvText = await response.text();
    return csvToJson(csvText);
  } catch (error) {
    console.error(`Error fetching sheet "${sheetName}":`, error);
    throw error;
  }
}

// Parse interactions from sheet data (Sheet 1 - Main data)
export async function fetchInteractions(): Promise<Interaction[]> {
  try {
    // Try to fetch from first sheet (default or "Sheet1")
    const rows = await fetchSheetData('Sheet1');
    if (rows.length < 2) {
      // Try alternative sheet names
      try {
        const altRows = await fetchSheetData('0'); // gid=0
        if (altRows.length >= 2) {
          return parseInteractionsFromRows(altRows);
        }
      } catch {
        // Continue with empty array
      }
      return [];
    }
    return parseInteractionsFromRows(rows);
  } catch (error) {
    console.error('Error fetching interactions:', error);
    return [];
  }
}

// Helper to parse interactions from rows
function parseInteractionsFromRows(rows: string[][]): Interaction[] {
  const dataRows = rows.slice(1); // Skip header row
  
  return dataRows
    .filter(row => row[0] && row[0].trim() !== '') // Filter out empty rows
    .map((row, index) => {
      const name = row[0]?.trim() || 'Unknown';
      const email = row[1]?.trim() || '';
      const phone = row[2]?.trim() || '';
      const eventType = row[3]?.trim() || '';
      const eventDescription = row[4]?.trim() || '';
      const headcountStr = row[5]?.trim() || '';
      const callId = row[6]?.trim() || '';
      const callSummary = row[8]?.trim() || '';
      
      // Parse headcount if available
      const headcount = headcountStr ? parseInt(headcountStr, 10) : undefined;
      
      // Generate avatar from name
      const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&size=40`;
      
      // Determine status based on data availability
      let status: 'Completed' | 'Missed' | 'In Progress' = 'Completed';
      if (!callSummary && !callId) {
        status = 'Missed';
      } else if (callSummary && callSummary.length > 0) {
        status = 'Completed';
      }
      
      // Use event type as tags
      const tags = eventType ? [eventType] : [];
      if (callSummary) {
        tags.push('Has Summary');
      }
      
      return {
        id: callId || `call-${index + 1}`,
        customer: {
          name: name,
          avatar: avatar,
        },
        contact: email || phone || 'No contact info',
        timestamp: new Date(), // You might want to parse from call ID timestamp if available
        status: status,
        channel: 'Call' as 'Call' | 'Chat', // All are calls based on the sheet
        transcript: callSummary,
        tags: tags,
        // Additional context for AI processing
        eventType: eventType || undefined,
        eventDescription: eventDescription || undefined,
        headcount: isNaN(headcount as number) ? undefined : headcount,
      };
    });
}

// Parse leads from sheet data (converted from main sheet)
export async function fetchLeads(): Promise<Lead[]> {
  try {
    const rows = await fetchSheetData('Sheet1');
    if (rows.length < 2) {
      try {
        const altRows = await fetchSheetData('0');
        if (altRows.length >= 2) {
          return parseLeadsFromRows(altRows);
        }
      } catch {
        return [];
      }
      return [];
    }
    return parseLeadsFromRows(rows);
  } catch (error) {
    console.error('Error fetching leads:', error);
    return [];
  }
}

function parseLeadsFromRows(rows: string[][]): Lead[] {
  const dataRows = rows.slice(1);
  
  return dataRows
    .filter(row => row[0] && row[0].trim() !== '')
    .map((row, index) => {
      const name = row[0]?.trim() || 'Unknown';
      const email = row[1]?.trim() || '';
      const phone = row[2]?.trim() || '';
      const eventType = row[3]?.trim() || '';
      const callSummary = row[8]?.trim() || '';
      
      // Determine status based on call summary
      let status: 'New' | 'Contacted' | 'Qualified' | 'Lost' = 'New';
      if (callSummary && callSummary.length > 50) {
        status = 'Contacted';
      }
      if (eventType && eventType.toLowerCase().includes('wedding')) {
        status = 'Qualified';
      }
      
      return {
        id: `L${index + 1}`,
        name: name,
        company: eventType || 'Individual',
        contact: email || phone,
        status: status,
        lastInteraction: new Date(),
      };
    });
}

// Parse contacts from sheet data (converted from main sheet)
export async function fetchContacts(): Promise<Contact[]> {
  try {
    const rows = await fetchSheetData('Sheet1');
    if (rows.length < 2) {
      try {
        const altRows = await fetchSheetData('0');
        if (altRows.length >= 2) {
          return parseContactsFromRows(altRows);
        }
      } catch {
        return [];
      }
      return [];
    }
    return parseContactsFromRows(rows);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return [];
  }
}

function parseContactsFromRows(rows: string[][]): Contact[] {
  const dataRows = rows.slice(1);
  
  return dataRows
    .filter(row => row[0] && row[0].trim() !== '')
    .map((row, index) => ({
      id: `C${index + 1}`,
      name: row[0]?.trim() || 'Unknown',
      company: row[3]?.trim() || 'Individual', // Event Type as company
      contact: row[1]?.trim() || row[2]?.trim() || '', // Email or phone
      lastInteraction: new Date(),
    }));
}

// Parse bookings from sheet data (converted from main sheet)
export async function fetchBookings(): Promise<Booking[]> {
  try {
    // Try second sheet first (might be "LeadsGeneral Calls" or similar)
    try {
      const rows2 = await fetchSheetData('LeadsGeneral Calls');
      if (rows2.length >= 2) {
        return parseBookingsFromRows(rows2);
      }
    } catch {
      // Try main sheet
    }
    
    const rows = await fetchSheetData('Sheet1');
    if (rows.length < 2) {
      try {
        const altRows = await fetchSheetData('0');
        if (altRows.length >= 2) {
          return parseBookingsFromRows(altRows);
        }
      } catch {
        return [];
      }
      return [];
    }
    return parseBookingsFromRows(rows);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return [];
  }
}

function parseBookingsFromRows(rows: string[][]): Booking[] {
  const dataRows = rows.slice(1);
  const today = new Date();
  
  return dataRows
    .filter(row => row[0] && row[0].trim() !== '')
    .map((row, index) => {
      const name = row[0]?.trim() || 'Unknown';
      const eventType = row[3]?.trim() || '';
      const eventDesc = row[4]?.trim() || '';
      const callSummary = row[8]?.trim() || '';
      
      // Determine status
      let status: 'Confirmed' | 'Pending' | 'Cancelled' = 'Pending';
      if (callSummary && callSummary.toLowerCase().includes('confirmed')) {
        status = 'Confirmed';
      }
      
      // Generate varied dates - spread bookings across next 30 days
      // Use index to create different dates and times
      const daysOffset = index % 30; // Cycle through 30 days
      const hoursOffset = (index * 2) % 24; // Spread across different hours
      const minutesOffset = (index * 15) % 60; // Spread across different minutes
      
      const bookingDate = new Date(today);
      bookingDate.setDate(today.getDate() + daysOffset);
      bookingDate.setHours(9 + hoursOffset, minutesOffset, 0, 0); // Start from 9 AM
      
      return {
        id: `B${index + 1}`,
        customer: name,
        service: eventType || eventDesc || 'Event Booking',
        staff: 'Event Coordinator', // Default staff
        dateTime: bookingDate,
        status: status,
      };
    });
}

// Parse analytics data from sheet (generate from main data)
export async function fetchAnalyticsData() {
  try {
    const rows = await fetchSheetData('Sheet1');
    if (rows.length < 2) {
      try {
        const altRows = await fetchSheetData('0');
        if (altRows.length >= 2) {
          return generateAnalyticsFromRows(altRows);
        }
      } catch {
        return { volume: [], conversion: [] };
      }
      return { volume: [], conversion: [] };
    }
    return generateAnalyticsFromRows(rows);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return {
      volume: [],
      conversion: [],
    };
  }
}

function generateAnalyticsFromRows(rows: string[][]): { volume: Array<{ name: string; calls: number; chats: number }>; conversion: Array<{ date: string; rate: number }> } {
  const dataRows = rows.slice(1).filter(row => row[0] && row[0].trim() !== '');
  const totalCalls = dataRows.length;
  const completedCalls = dataRows.filter(row => row[8] && row[8].trim() !== '').length;
  
  // Generate weekly volume (mock data based on total)
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const volume = days.map((day, index) => ({
    name: day,
    calls: Math.floor(totalCalls / 7) + (index % 3),
    chats: 0, // All are calls
  }));
  
  // Generate conversion rates
  const conversionRate = totalCalls > 0 ? (completedCalls / totalCalls) * 100 : 0;
  const conversion = [
    { date: 'Week 1', rate: conversionRate * 0.8 },
    { date: 'Week 2', rate: conversionRate * 0.9 },
    { date: 'Week 3', rate: conversionRate },
    { date: 'Week 4', rate: conversionRate * 1.1 },
    { date: 'Current', rate: conversionRate },
  ];
  
  return { volume, conversion };
}

