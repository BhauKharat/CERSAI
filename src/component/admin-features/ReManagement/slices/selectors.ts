import { createSelector } from '@reduxjs/toolkit';

export const selectStatusOptions = createSelector(() => {
  // Return predefined status options based on your UI requirements
  return [
    { value: 'Active', label: 'Approved' },
    { value: 'Inactive', label: 'Pending' },
    { value: 'Rejected', label: 'Rejected' },
    { value: 'Suspended', label: 'Suspended' },
    { value: 'ALL', label: 'All' },
  ];
});
