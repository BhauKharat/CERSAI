// Ticket.types.ts

// Example interface for ticket management feature
export interface Ticket {
  id: string;
  subject: string;
  status: 'open' | 'closed' | 'pending';
  createdAt: string;
}
