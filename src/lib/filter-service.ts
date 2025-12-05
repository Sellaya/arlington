/**
 * Filter Service
 * Manages saved filter sets, views, and filter persistence
 */

export type FilterType = 'interactions' | 'leads' | 'bookings' | 'contacts';

export interface FilterSet {
  id: string;
  name: string;
  type: FilterType;
  filters: Record<string, any>;
  isDefault?: boolean;
  role?: string; // For role-based default views
  createdAt: Date;
  updatedAt: Date;
}

export interface SavedFilter {
  id: string;
  name: string;
  description?: string;
  filters: Record<string, any>;
  type: FilterType;
  isDefault?: boolean;
  role?: string;
}

// Predefined filter sets
export const PREDEFINED_FILTERS: SavedFilter[] = [
  {
    id: 'today-calls',
    name: "Today's Calls",
    description: 'All calls from today',
    type: 'interactions',
    filters: {
      channel: 'Call',
      dateRange: 'today',
      status: 'all',
    },
  },
  {
    id: 'unqualified-wedding-leads',
    name: 'Unqualified Wedding Leads',
    description: 'Wedding leads that need qualification',
    type: 'leads',
    filters: {
      status: 'New',
      eventType: 'Wedding',
      search: '',
    },
  },
  {
    id: 'high-value-corporate',
    name: 'High-Value Corporate',
    description: 'Corporate events with high headcount',
    type: 'leads',
    filters: {
      status: ['New', 'Contacted', 'Qualified'],
      eventType: 'Corporate',
      minHeadcount: 50,
    },
  },
  {
    id: 'upcoming-bookings',
    name: 'Upcoming Bookings',
    description: 'All upcoming confirmed bookings',
    type: 'bookings',
    filters: {
      status: 'Confirmed',
      dateRange: 'future',
    },
    role: 'coordinator',
  },
  {
    id: 'new-qualified-leads',
    name: 'New + Qualified Leads',
    description: 'New and qualified leads for sales',
    type: 'leads',
    filters: {
      status: ['New', 'Qualified'],
    },
    role: 'sales',
  },
  {
    id: 'pending-bookings',
    name: 'Pending Bookings',
    description: 'Bookings awaiting confirmation',
    type: 'bookings',
    filters: {
      status: 'Pending',
    },
  },
  {
    id: 'missed-interactions',
    name: 'Missed Interactions',
    description: 'All missed calls and chats',
    type: 'interactions',
    filters: {
      status: 'Missed',
    },
  },
  {
    id: 'completed-today',
    name: 'Completed Today',
    description: 'All completed interactions today',
    type: 'interactions',
    filters: {
      status: 'Completed',
      dateRange: 'today',
    },
  },
];

// Role-based default views
export const ROLE_DEFAULT_VIEWS: Record<string, Record<FilterType, string>> = {
  coordinator: {
    interactions: 'completed-today',
    leads: 'unqualified-wedding-leads',
    bookings: 'upcoming-bookings',
    contacts: 'default',
  },
  sales: {
    interactions: 'today-calls',
    leads: 'new-qualified-leads',
    bookings: 'pending-bookings',
    contacts: 'default',
  },
  manager: {
    interactions: 'today-calls',
    leads: 'high-value-corporate',
    bookings: 'upcoming-bookings',
    contacts: 'default',
  },
};

// Get saved filters from localStorage
export function getSavedFilters(type: FilterType): SavedFilter[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(`saved-filters-${type}`);
    if (!stored) return PREDEFINED_FILTERS.filter(f => f.type === type);
    
    const custom = JSON.parse(stored);
    return [...PREDEFINED_FILTERS.filter(f => f.type === type), ...custom];
  } catch (error) {
    console.error('Error loading saved filters:', error);
    return PREDEFINED_FILTERS.filter(f => f.type === type);
  }
}

// Save a filter set
export function saveFilter(filter: SavedFilter): void {
  if (typeof window === 'undefined') return;
  
  try {
    const existing = getSavedFilters(filter.type);
    const updated = existing.some(f => f.id === filter.id)
      ? existing.map(f => f.id === filter.id ? filter : f)
      : [...existing, filter];
    
    const custom = updated.filter(f => !PREDEFINED_FILTERS.some(pf => pf.id === f.id));
    localStorage.setItem(`saved-filters-${filter.type}`, JSON.stringify(custom));
  } catch (error) {
    console.error('Error saving filter:', error);
  }
}

// Delete a saved filter
export function deleteFilter(filterId: string, type: FilterType): void {
  if (typeof window === 'undefined') return;
  
  try {
    const existing = getSavedFilters(type);
    const updated = existing.filter(f => f.id !== filterId);
    const custom = updated.filter(f => !PREDEFINED_FILTERS.some(pf => pf.id === f.id));
    localStorage.setItem(`saved-filters-${type}`, JSON.stringify(custom));
  } catch (error) {
    console.error('Error deleting filter:', error);
  }
}

// Get default view for role
export function getDefaultView(role: string, type: FilterType): SavedFilter | null {
  const defaultViewId = ROLE_DEFAULT_VIEWS[role]?.[type];
  if (!defaultViewId) return null;
  
  const filters = getSavedFilters(type);
  return filters.find(f => f.id === defaultViewId) || null;
}

// Get current user role (mock - in production, get from auth)
export function getCurrentUserRole(): string {
  if (typeof window === 'undefined') return 'manager';
  
  try {
    return localStorage.getItem('user-role') || 'manager';
  } catch {
    return 'manager';
  }
}

// Set current user role
export function setCurrentUserRole(role: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('user-role', role);
  } catch (error) {
    console.error('Error setting user role:', error);
  }
}

// Apply filters to data
export function applyFilters<T>(
  data: T[],
  filters: Record<string, any>,
  filterFn: (item: T, filters: Record<string, any>) => boolean
): T[] {
  return data.filter(item => filterFn(item, filters));
}

