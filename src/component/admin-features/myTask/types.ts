export interface TableRecord {
  key: string;
  registrationDate: string;
  pan: string;
  entityName: string;
  status: 'pending' | 'in-progress' | 'completed' | 'rejected' | 'approved';
  action?: React.ReactNode;
  // Add other fields as per your table's data structure
}
