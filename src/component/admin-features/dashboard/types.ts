export interface MenuItem {
  key: string;
  icon?: React.ReactNode;
  label: React.ReactNode;
  path?: string;
  children?: MenuItem[];
}

export interface TableRecord {
  key: string;
  registrationDate: string;
  pan: string;
  entityName: string;
  status: 'pending' | 'approved';
}

export interface DashboardState {
  searchQuery: string;
  dateRange: [string, string];
  statusFilter: string;
  currentPage: number;
  pageSize: number;
  data: TableRecord[];
}
