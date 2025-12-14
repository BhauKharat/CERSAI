// Billing.types.ts

// Example interface for billing feature
export interface BillingRecord {
  id: string;
  amount: number;
  date: string;
  status: 'paid' | 'pending' | 'failed';
}
