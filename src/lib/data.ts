import type { Interaction, Lead, Contact, Booking } from './types';

export const interactions: Interaction[] = [
  {
    id: '1',
    customer: { name: 'Alice Johnson', avatar: 'https://picsum.photos/seed/1/40/40' },
    contact: 'alice@example.com',
    timestamp: new Date('2024-07-29T10:30:00'),
    status: 'Completed',
    channel: 'Chat',
    transcript: 'Full transcript of chat with Alice Johnson...',
    tags: ['Sales Inquiry', 'New Lead'],
  },
  {
    id: '2',
    customer: { name: 'Bob Williams', avatar: 'https://picsum.photos/seed/2/40/40' },
    contact: '+1-202-555-0182',
    timestamp: new Date('2024-07-29T10:25:00'),
    status: 'Completed',
    channel: 'Call',
    transcript: 'Full transcript of call with Bob Williams...',
    tags: ['Support', 'Existing Customer'],
  },
  {
    id: '3',
    customer: { name: 'Charlie Brown', avatar: 'https://picsum.photos/seed/3/40/40' },
    contact: '+1-202-555-0191',
    timestamp: new Date('2024-07-29T10:15:00'),
    status: 'Missed',
    channel: 'Call',
    transcript: '',
    tags: ['Missed Call'],
  },
  {
    id: '4',
    customer: { name: 'Diana Prince', avatar: 'https://picsum.photos/seed/4/40/40' },
    contact: 'diana@example.com',
    timestamp: new Date('2024-07-29T10:05:00'),
    status: 'In Progress',
    channel: 'Chat',
    transcript: 'Ongoing chat with Diana Prince...',
    tags: ['Technical Issue'],
  },
];

export const leads: Lead[] = [
  { id: 'L1', name: 'Frank Miller', company: 'Miller Corp', contact: 'frank@miller.com', status: 'New', lastInteraction: new Date('2024-07-29T10:30:00') },
  { id: 'L2', name: 'Grace Hopper', company: 'Innovate LLC', contact: 'grace@innovate.com', status: 'Contacted', lastInteraction: new Date('2024-07-28T14:00:00') },
  { id: 'L3', name: 'Henry Ford', company: 'Ford Motors', contact: 'henry@ford.com', status: 'Qualified', lastInteraction: new Date('2024-07-27T11:00:00') },
  { id: 'L4', name: 'Ivy Green', company: 'Green Gardens', contact: 'ivy@green.com', status: 'Lost', lastInteraction: new Date('2024-07-26T16:30:00') },
];

export const contacts: Contact[] = [
    { id: 'C1', name: 'Alice Johnson', company: 'Example Inc', contact: 'alice@example.com', lastInteraction: new Date('2024-07-29T10:30:00') },
    { id: 'C2', name: 'Bob Williams', company: 'Another Co', contact: '+1-202-555-0182', lastInteraction: new Date('2024-07-29T10:25:00') },
];

export const bookings: Booking[] = [
  { id: 'B1', customer: 'John Smith', service: 'Initial Consultation', staff: 'Jane Doe', dateTime: new Date('2024-07-30T11:00:00'), status: 'Confirmed' },
  { id: 'B2', customer: 'Emily White', service: 'Follow-up Meeting', staff: 'Jane Doe', dateTime: new Date('2024-07-30T14:00:00'), status: 'Pending' },
  { id: 'B3', customer: 'Michael Brown', service: 'Product Demo', staff: 'John Applessed', dateTime: new Date('2024-07-31T09:30:00'), status: 'Confirmed' },
];

export const analyticsData = {
    volume: [
        { name: 'Mon', calls: 30, chats: 45 },
        { name: 'Tue', calls: 40, chats: 55 },
        { name: 'Wed', calls: 35, chats: 60 },
        { name: 'Thu', calls: 50, chats: 70 },
        { name: 'Fri', calls: 60, chats: 80 },
        { name: 'Sat', calls: 25, chats: 40 },
        { name: 'Sun', calls: 15, chats: 20 },
    ],
    conversion: [
        { date: 'Jul 1', rate: 2.5 },
        { date: 'Jul 8', rate: 2.8 },
        { date: 'Jul 15', rate: 3.5 },
        { date: 'Jul 22', rate: 3.2 },
        { date: 'Jul 29', rate: 4.1 },
    ]
};
