# Google Sheets Integration - Quick Start

Your app is now configured to fetch data from your Google Sheet!

## Sheet Information
- **Sheet ID**: `1mitXbIgnRfoWovu2eS5VUZcGnFjbvCFJU2pt36Ib9vM`
- **Sheet URL**: https://docs.google.com/spreadsheets/d/1mitXbIgnRfoWovu2eS5VUZcGnFjbvCFJU2pt36Ib9vM/edit

## Required: Publish Your Sheet

**IMPORTANT**: You must publish your Google Sheet for the app to access it:

1. Open your Google Sheet
2. Go to **File → Share → Publish to web**
3. Select **"Entire document"** or the specific sheet tabs
4. Choose **"CSV"** format
5. Click **"Publish"**
6. The sheet is now accessible!

## Sheet Structure

Your sheet should have the following columns (in order):
- **Column A**: Name
- **Column B**: Email
- **Column C**: Phone
- **Column D**: Event Type
- **Column E**: Event Description
- **Column F**: Head Count
- **Column G**: Call_ID
- **Column H**: Call Recordings (URL)
- **Column I**: Call Summary
- **Column K**: Serial (optional)

## How It Works

1. **Dashboard Page**: Shows total calls, leads, and bookings from your sheet
2. **Interactions Page**: Displays all calls with customer info and summaries
3. **Management Page**: Shows leads and contacts extracted from your sheet
4. **Bookings Page**: Displays event bookings
5. **Analytics Page**: Generates analytics from your data

## Data Mapping

- **Interactions**: Each row becomes a call interaction
- **Leads**: Extracted from rows with contact information
- **Contacts**: All people who have called
- **Bookings**: Events extracted from the sheet
- **Analytics**: Generated from the total data

## Troubleshooting

### No Data Showing?
1. Make sure the sheet is **published to web** (see above)
2. Check that rows have data in Column A (Name)
3. Verify the sheet ID is correct in the code

### Data Not Updating?
- The data is cached for 60 seconds
- Refresh the page to see new data
- Check browser console for any errors

### Sheet Access Issues?
- Ensure the sheet is published (not just shared)
- Try accessing the CSV URL directly in a browser
- Format: `https://docs.google.com/spreadsheets/d/SHEET_ID/gviz/tq?tqx=out:csv&sheet=Sheet1`

## Testing

Visit these pages to see your data:
- `/` - Dashboard with KPIs
- `/interactions` - All calls
- `/management` - Leads and contacts
- `/bookings` - Event bookings
- `/analytics` - Performance metrics

## Notes

- Empty rows are automatically filtered out
- The app generates avatars automatically from names
- Call summaries are displayed in the interaction details
- All data is fetched from your live Google Sheet!


