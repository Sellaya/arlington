# **App Name**: AI Receptionist Dashboard

## Core Features:

- Login & Onboarding: Firebase Auth integration for email/password and Google sign-in to manage user authentication.
- Dashboard Home: Overview of daily KPIs (calls, chats, leads, bookings) and live activity feed with interaction details, presented in mobile-first layout.
- Interactions (Calls & Chats): Tabbed view to display call and chat interactions, including customer details, contact info, timestamps, and a detail drawer for full transcripts and tags. Also provides filtering options (date range, status, channel).
- Leads & Contacts Management: List of captured leads with name, company, contact info, lead status, and last interaction date. Includes lead detail view with interaction timeline and notes, as well as search and filter capabilities.
- Bookings & Appointments Calendar: Calendar-style overview of upcoming appointments, filtered by date range and status, with customer, service, and staff details.
- Analytics Dashboard: Simple charts for call/chat trends, conversion rates, average response time, and KPI cards for handling time and missed interaction rate.
- AI Receptionist Configuration: Form-based UI for configuring AI receptionist settings, including business hours, preferred channels, greeting message, and escalation rules, validated with React Hook Form. Data can't be saved in MVP version.

## Style Guidelines:

- Primary color: Light Blue (#E0F7FA) for a professional and calming feel.
- Background color: White (#FFFFFF) to provide a clean, minimalistic backdrop.
- Accent color: Light Green (#A5D6A7) for call-to-action buttons and highlights.
- Body and headline font: 'Open Sans', a humanist sans-serif, for a modern, neutral look suitable for both headlines and body text.
- Use a consistent set of professional, line-based icons to represent different actions and categories.
- Mobile-first design, utilizing a grid layout on larger screens for efficient information display.
- Subtle transitions and animations for UI elements to improve user experience, such as modals, drawer panels and filter/sort buttons.