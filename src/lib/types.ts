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
};

export type Lead = {
  id: string;
  name: string;
  company: string;
  contact: string;
  status: 'New' | 'Contacted' | 'Qualified' | 'Lost';
  lastInteraction: Date;
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
